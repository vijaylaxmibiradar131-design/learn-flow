import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { getAdjacentVideos, type SubjectTree } from "@/hooks/useSubjectTree";
import { useCallback, useRef } from "react";

export default function VideoPage() {
  const { videoId, subjectId } = useParams();
  const { user } = useAuth();
  const { tree } = useOutletContext<{ tree: SubjectTree }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const debounceRef = useRef<number>();

  // Find video in tree
  const allVideos = tree.sections.flatMap(s => s.videos);
  const currentVideo = allVideos.find(v => v.id === videoId);
  const { prev, next } = getAdjacentVideos(tree, videoId || "");

  // Fetch resume position
  const { data: progress } = useQuery({
    queryKey: ["video-progress", videoId],
    enabled: !!videoId && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("video_progress")
        .select("last_position_seconds, is_completed")
        .eq("user_id", user!.id)
        .eq("video_id", videoId!)
        .maybeSingle();
      return data;
    },
  });

  // Upsert progress mutation
  const upsertProgress = useMutation({
    mutationFn: async (params: { seconds: number; completed?: boolean }) => {
      const { error } = await supabase
        .from("video_progress")
        .upsert(
          {
            user_id: user!.id,
            video_id: videoId!,
            last_position_seconds: params.seconds,
            is_completed: params.completed ?? false,
            completed_at: params.completed ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,video_id" }
        );
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      if (vars.completed) {
        queryClient.invalidateQueries({ queryKey: ["subject-tree", subjectId] });
        queryClient.invalidateQueries({ queryKey: ["video-progress", videoId] });
      }
    },
  });

  const handleProgress = useCallback((seconds: number) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      upsertProgress.mutate({ seconds });
    }, 2000);
  }, [upsertProgress]);

  const handleCompleted = useCallback(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    upsertProgress.mutate({ seconds: currentVideo?.duration_seconds ?? 0, completed: true });
  }, [upsertProgress, currentVideo]);

  if (!currentVideo) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Video not found.</p>
      </div>
    );
  }

  if (currentVideo.locked) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Complete the previous video to unlock this one.</p>
        {prev && (
          <Button variant="outline" onClick={() => navigate(`/subjects/${subjectId}/video/${prev.id}`)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Go to Previous Video
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <YouTubePlayer
        youtubeUrl={currentVideo.youtube_url}
        startSeconds={progress?.last_position_seconds ?? 0}
        onProgress={handleProgress}
        onCompleted={handleCompleted}
      />

      <div className="mt-6">
        <h1 className="font-heading text-2xl font-bold">{currentVideo.title}</h1>
        {currentVideo.description && (
          <p className="mt-2 text-muted-foreground leading-relaxed">{currentVideo.description}</p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={!prev}
          onClick={() => prev && navigate(`/subjects/${subjectId}/video/${prev.id}`)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button
          disabled={!next || next.locked}
          onClick={() => next && navigate(`/subjects/${subjectId}/video/${next.id}`)}
        >
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
