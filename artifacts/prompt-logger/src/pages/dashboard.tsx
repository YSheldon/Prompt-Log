import { useGetStatsSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Activity, BookText, MessageSquare, Plus, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: recentSessions, isLoading: recentLoading } = useGetRecentActivity();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground font-sans text-sm">Your personal archive of AI interactions and prompt experiments.</p>
        </div>
        <Link href="/sessions/new">
          <Button className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm hover-elevate">
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/50 shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono">{stats?.totalSessions || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur border-border/50 shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono">{stats?.totalMessages || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur border-border/50 shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Session</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono">
                {stats?.avgMessagesPerSession ? Math.round(stats.avgMessagesPerSession * 10) / 10 : 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50 shadow-sm hover-elevate transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User / AI Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono">
                {stats?.totalAssistantMessages && stats?.totalUserMessages
                  ? (stats.totalUserMessages / stats.totalAssistantMessages).toFixed(2)
                  : "0.00"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              User messages per AI response
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-2xl">Recent Sessions</CardTitle>
              <Link href="/sessions">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your latest interactions and prompt experiments.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentLoading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSessions && recentSessions.length > 0 ? (
              <div className="divide-y divide-border/50">
                {recentSessions.slice(0, 5).map((session, i) => (
                  <Link key={session.id} href={`/sessions/${session.id}`}>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-sm group-hover:border-primary/50 transition-colors">
                          <BookText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                            {session.title}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                            <span className="mx-2">•</span>
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {session.messageCount} messages
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-200" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <BookText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-serif font-medium">No sessions yet</h3>
                <p className="text-sm text-muted-foreground mb-4 mt-1 max-w-sm">
                  Start documenting your AI conversations to see them appear here.
                </p>
                <Link href="/sessions/new">
                  <Button variant="outline">Create your first session</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="font-serif text-2xl">Quick Guide</CardTitle>
            <CardDescription>
              How to use PromptLogger effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-sm font-bold">1</div>
              <div>
                <h4 className="text-sm font-medium mb-1">Create focused sessions</h4>
                <p className="text-sm text-muted-foreground">Group your prompts by task or project. Use tags to organize them.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-sm font-bold">2</div>
              <div>
                <h4 className="text-sm font-medium mb-1">Log the iteration</h4>
                <p className="text-sm text-muted-foreground">Save not just the final prompt, but the back-and-forth that got you there.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-sm font-bold">3</div>
              <div>
                <h4 className="text-sm font-medium mb-1">Refine and reuse</h4>
                <p className="text-sm text-muted-foreground">Search through your history when you need to solve a similar problem.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
