import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, PlayCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Learn at your
            <span className="text-primary"> own pace</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed sm:text-xl">
            Structured video courses with progress tracking. Pick up right where you left off.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link to="/subjects">
                <Button size="lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Subjects
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg">Get Started Free</Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          {[
            { icon: BookOpen, title: "Structured Courses", desc: "Organized into sections with strict ordering so you never miss a concept." },
            { icon: PlayCircle, title: "YouTube-Powered", desc: "Watch high-quality video content directly in the platform." },
            { icon: CheckCircle2, title: "Track Progress", desc: "Resume where you left off and track completion across all courses." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <Icon className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
