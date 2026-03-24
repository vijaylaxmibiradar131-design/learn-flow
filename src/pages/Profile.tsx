import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, BookOpen, CheckCircle2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("*, subjects(title)")
        .eq("user_id", user!.id);
      return data;
    },
  });

  const { data: completedCount } = useQuery({
    queryKey: ["completed-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("video_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_completed", true);
      return count ?? 0;
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Profile</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {profile?.name || "—"}</p>
            <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Videos completed:</span> {completedCount ?? 0}</p>
            <p><span className="text-muted-foreground">Enrolled subjects:</span> {enrollments?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
