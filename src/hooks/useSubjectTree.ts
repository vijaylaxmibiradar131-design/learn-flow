import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface VideoNode {
  id: string;
  title: string;
  order_index: number;
  youtube_url: string;
  description: string | null;
  duration_seconds: number | null;
  is_completed: boolean;
  locked: boolean;
}

export interface SectionNode {
  id: string;
  title: string;
  order_index: number;
  videos: VideoNode[];
}

export interface SubjectTree {
  id: string;
  title: string;
  description: string | null;
  sections: SectionNode[];
}

export function useSubjectTree(subjectId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subject-tree", subjectId, user?.id],
    enabled: !!subjectId,
    queryFn: async (): Promise<SubjectTree> => {
      // Fetch subject
      const { data: subject, error: subErr } = await supabase
        .from("subjects")
        .select("id, title, description")
        .eq("id", subjectId!)
        .single();
      if (subErr) throw subErr;

      // Fetch sections ordered
      const { data: sections, error: secErr } = await supabase
        .from("sections")
        .select("id, title, order_index")
        .eq("subject_id", subjectId!)
        .order("order_index");
      if (secErr) throw secErr;

      // Fetch all videos for these sections
      const sectionIds = sections.map(s => s.id);
      const { data: videos, error: vidErr } = await supabase
        .from("videos")
        .select("id, title, order_index, youtube_url, description, duration_seconds, section_id")
        .in("section_id", sectionIds.length > 0 ? sectionIds : ["__none__"])
        .order("order_index");
      if (vidErr) throw vidErr;

      // Fetch user progress
      let progressMap: Record<string, boolean> = {};
      if (user) {
        const videoIds = videos.map(v => v.id);
        if (videoIds.length > 0) {
          const { data: progress } = await supabase
            .from("video_progress")
            .select("video_id, is_completed")
            .eq("user_id", user.id)
            .in("video_id", videoIds);
          if (progress) {
            progressMap = Object.fromEntries(progress.map(p => [p.video_id, p.is_completed]));
          }
        }
      }

      // Build flat ordered list for locking logic
      const flatVideos: { id: string; sectionId: string }[] = [];
      for (const sec of sections) {
        const secVids = videos.filter(v => v.section_id === sec.id).sort((a, b) => a.order_index - b.order_index);
        for (const v of secVids) {
          flatVideos.push({ id: v.id, sectionId: v.section_id });
        }
      }

      // Determine lock status
      const lockMap: Record<string, boolean> = {};
      for (let i = 0; i < flatVideos.length; i++) {
        if (i === 0) {
          lockMap[flatVideos[i].id] = false; // first video always unlocked
        } else {
          const prevId = flatVideos[i - 1].id;
          lockMap[flatVideos[i].id] = !progressMap[prevId]; // locked if previous not completed
        }
      }

      // Build tree
      const tree: SubjectTree = {
        id: subject.id,
        title: subject.title,
        description: subject.description,
        sections: sections.map(sec => ({
          id: sec.id,
          title: sec.title,
          order_index: sec.order_index,
          videos: videos
            .filter(v => v.section_id === sec.id)
            .sort((a, b) => a.order_index - b.order_index)
            .map(v => ({
              id: v.id,
              title: v.title,
              order_index: v.order_index,
              youtube_url: v.youtube_url,
              description: v.description,
              duration_seconds: v.duration_seconds,
              is_completed: !!progressMap[v.id],
              locked: !!lockMap[v.id],
            })),
        })),
      };

      return tree;
    },
  });
}

export function getAdjacentVideos(tree: SubjectTree | undefined, videoId: string) {
  if (!tree) return { prev: null, next: null };
  const flat = tree.sections.flatMap(s => s.videos);
  const idx = flat.findIndex(v => v.id === videoId);
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
