import { Outlet, useParams } from "react-router-dom";
import { useSubjectTree } from "@/hooks/useSubjectTree";
import { SubjectSidebar } from "@/components/SubjectSidebar";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubjectLayout() {
  const { subjectId } = useParams();
  const { data: tree, isLoading, error } = useSubjectTree(subjectId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <SubjectSidebar tree={tree} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full w-72">
            <SubjectSidebar tree={tree} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center border-b px-4 py-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 truncate text-sm font-medium">{tree.title}</span>
        </div>
        <Outlet context={{ tree }} />
      </div>
    </div>
  );
}
