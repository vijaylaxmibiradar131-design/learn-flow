import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, PlayCircle } from "lucide-react";
import type { SubjectTree } from "@/hooks/useSubjectTree";

export default function SubjectOverview() {
  const { tree } = useOutletContext<{ tree: SubjectTree }>();
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const firstVideo = tree.sections[0]?.videos[0];
  const totalVideos = tree.sections.reduce((sum, s) => sum + s.videos.length, 0);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-heading text-3xl font-bold tracking-tight">{tree.title}</h1>
      {tree.description && (
        <p className="mt-3 text-muted-foreground leading-relaxed">{tree.description}</p>
      )}

      <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          {tree.sections.length} section{tree.sections.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <PlayCircle className="h-4 w-4" />
          {totalVideos} video{totalVideos !== 1 ? "s" : ""}
        </span>
      </div>

      {firstVideo && (
        <Button
          className="mt-8"
          size="lg"
          onClick={() => navigate(`/subjects/${subjectId}/video/${firstVideo.id}`)}
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Start Learning
        </Button>
      )}
    </div>
  );
}
