import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, PlayCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubjectTree } from "@/hooks/useSubjectTree";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  tree: SubjectTree;
  onClose?: () => void;
}

export function SubjectSidebar({ tree, onClose }: Props) {
  const { videoId } = useParams();
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-72 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/subjects")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="truncate font-heading text-sm font-semibold">{tree.title}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {tree.sections.map(section => (
            <div key={section.id}>
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.videos.map(video => {
                  const isActive = video.id === videoId;
                  return (
                    <li key={video.id}>
                      <button
                        disabled={video.locked}
                        onClick={() => {
                          navigate(`/subjects/${tree.id}/video/${video.id}`);
                          onClose?.();
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                          isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent",
                          video.locked && "cursor-not-allowed opacity-50"
                        )}
                      >
                        {video.locked ? (
                          <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        ) : video.is_completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-success" />
                        ) : (
                          <PlayCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{video.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
