import { useState } from "react";
import { useListSessions, getListSessionsQueryKey, useDeleteSession } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Plus, Trash2, Filter, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

export default function Sessions() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [tagFilter, setTagFilter] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useListSessions(
    { search: debouncedSearch || undefined, tag: tagFilter || undefined },
    { query: { queryKey: getListSessionsQueryKey({ search: debouncedSearch || undefined, tag: tagFilter || undefined }) } }
  );

  const deleteSession = useDeleteSession({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Session deleted",
          description: "The session has been permanently removed.",
        });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete session. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent navigating to session detail
    deleteSession.mutate({ id });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-foreground mb-2">Sessions</h1>
          <p className="text-muted-foreground font-sans text-sm">Browse, search, and manage your saved prompts.</p>
        </div>
        <Link href="/sessions/new">
          <Button className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover-elevate">
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-input focus-visible:ring-primary"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="pl-9 bg-background border-input focus-visible:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-lg border border-border border-dashed">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-serif font-medium text-foreground">No sessions found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {searchTerm || tagFilter 
              ? "We couldn't find any sessions matching your search criteria. Try adjusting your filters." 
              : "You haven't created any sessions yet. Start documenting your prompts!"}
          </p>
          {(searchTerm || tagFilter) && (
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => { setSearchTerm(""); setTagFilter(""); }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions?.map((session, i) => (
            <Link key={session.id} href={`/sessions/${session.id}`}>
              <Card className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between md:justify-start gap-3">
                        <h2 className="text-xl font-medium font-serif group-hover:text-primary transition-colors line-clamp-1">
                          {session.title}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          <MessageSquare className="h-3 w-3" />
                          {session.messageCount} msg
                        </div>
                      </div>
                      
                      {session.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        {session.tags ? session.tags.split(',').map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-secondary/50 hover:bg-secondary text-xs font-normal">
                            {tag.trim()}
                          </Badge>
                        )) : (
                          <span className="text-xs text-muted-foreground/50 italic">No tags</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-4 shrink-0 border-t border-border pt-4 md:border-t-0 md:pt-0">
                      <div className="flex items-center text-sm text-muted-foreground font-mono">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(session.createdAt), "MMM d, yyyy")}
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete session?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{session.title}" and all its messages. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => handleDelete(e as any, session.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
