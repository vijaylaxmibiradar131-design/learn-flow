import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function Subjects() {
  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Subjects</h1>
        <p className="mt-2 text-muted-foreground">Browse available courses and start learning</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 w-2/3 rounded bg-muted" /><div className="mt-2 h-4 w-full rounded bg-muted" /></CardHeader>
            </Card>
          ))}
        </div>
      ) : subjects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-heading text-xl font-semibold">No subjects yet</h2>
          <p className="mt-1 text-muted-foreground">Check back soon for new courses.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects?.map(subject => (
            <Link key={subject.id} to={`/subjects/${subject.id}`}>
              <Card className="group transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="font-heading text-lg group-hover:text-primary transition-colors">
                    {subject.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{subject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-primary">Start Learning →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
