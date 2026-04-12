import { Link, useLocation } from "wouter";
import { Book, LayoutDashboard, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      <aside className="w-full border-b border-border bg-sidebar md:w-64 md:border-r md:border-b-0 md:min-h-screen sticky top-0 md:relative z-10">
        <div className="flex h-14 items-center px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-2 font-serif text-2xl text-foreground font-bold tracking-tight">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-sm font-sans font-medium">P</span>
            PromptLogger
          </div>
        </div>
        <div className="px-4 py-4 md:py-6 md:px-6">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            <Link href="/" className="flex-shrink-0">
              <Button
                variant={location === "/" ? "secondary" : "ghost"}
                className={`w-full justify-start ${location === "/" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/sessions" className="flex-shrink-0">
              <Button
                variant={location.startsWith("/sessions") && location !== "/sessions/new" ? "secondary" : "ghost"}
                className={`w-full justify-start ${location.startsWith("/sessions") && location !== "/sessions/new" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}
              >
                <Book className="mr-2 h-4 w-4" />
                Sessions
              </Button>
            </Link>
            <div className="md:mt-6">
              <Link href="/sessions/new" className="flex-shrink-0">
                <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Session
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
