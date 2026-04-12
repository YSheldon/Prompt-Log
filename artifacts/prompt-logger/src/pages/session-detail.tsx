import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetSession, 
  getGetSessionQueryKey, 
  useListMessages, 
  getListMessagesQueryKey,
  useCreateMessage,
  useDeleteMessage,
  useUpdateSession
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  Bot, 
  User, 
  Send, 
  Trash2, 
  Settings, 
  Clock, 
  Tag as TagIcon,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
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

const messagePairSchema = z.object({
  userMessage: z.string().min(1, "User prompt is required"),
  assistantMessage: z.string().min(1, "Assistant response is required"),
});

type MessagePairFormValues = z.infer<typeof messagePairSchema>;

export default function SessionDetail() {
  const { id } = useParams();
  const sessionId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const [isAddingPair, setIsAddingPair] = useState(false);

  const { data: session, isLoading: sessionLoading } = useGetSession(sessionId, {
    query: { enabled: !!sessionId, queryKey: getGetSessionQueryKey(sessionId) }
  });

  const { data: messages, isLoading: messagesLoading } = useListMessages(sessionId, {
    query: { enabled: !!sessionId, queryKey: getListMessagesQueryKey(sessionId) }
  });

  const createMessage = useCreateMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(sessionId) });
        queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(sessionId) });
      }
    }
  });

  const deleteMessage = useDeleteMessage({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message deleted" });
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(sessionId) });
        queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(sessionId) });
      }
    }
  });

  const form = useForm<MessagePairFormValues>({
    resolver: zodResolver(messagePairSchema),
    defaultValues: {
      userMessage: "",
      assistantMessage: "",
    },
  });

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (messages?.length && !isAddingPair) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages?.length, isAddingPair]);

  const onSubmitPair = async (data: MessagePairFormValues) => {
    setIsAddingPair(true);
    try {
      // Create user message
      await createMessage.mutateAsync({
        id: sessionId,
        data: { role: "user", content: data.userMessage }
      });
      
      // Create assistant message
      await createMessage.mutateAsync({
        id: sessionId,
        data: { role: "assistant", content: data.assistantMessage }
      });
      
      form.reset();
      toast({ title: "Message pair added successfully" });
    } catch (error) {
      toast({ 
        title: "Error adding messages", 
        description: "There was a problem saving your conversation. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsAddingPair(false);
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    deleteMessage.mutate({ id: messageId });
  };

  if (sessionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-6 mt-12">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!session && !sessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-serif mb-2">Session not found</h2>
        <p className="text-muted-foreground mb-6">The session you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => setLocation("/sessions")}>Back to Sessions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-0 md:relative z-20 md:z-0 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/sessions")}
          className="mb-4 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-foreground">{session?.title}</h1>
            {session?.description && (
              <p className="text-muted-foreground">{session.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground font-mono">
              <span className="flex items-center">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                {session?.createdAt && format(new Date(session.createdAt), "PPp")}
              </span>
            </div>
            {session?.tags && (
              <div className="flex flex-wrap gap-2 pt-2">
                <TagIcon className="h-4 w-4 text-muted-foreground/50 self-center" />
                {session.tags.split(',').map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/50 font-normal">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="space-y-6">
        {messagesLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-3/4 ml-auto rounded-2xl rounded-tr-sm" />
            <Skeleton className="h-32 w-3/4 mr-auto rounded-2xl rounded-tl-sm" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 border border-border border-dashed rounded-xl">
            <p className="text-muted-foreground">No messages logged yet. Add your first prompt and response below.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {messages?.map((message) => {
              const isUser = message.role === "user";
              return (
                <div 
                  key={message.id} 
                  className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${
                    isUser 
                      ? "bg-primary border-primary-border text-primary-foreground" 
                      : "bg-card border-border text-foreground"
                  }`}>
                    {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  
                  <div className={`relative flex max-w-[85%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                    <div className={`rounded-2xl px-5 py-4 shadow-sm text-sm whitespace-pre-wrap font-sans leading-relaxed ${
                      isUser 
                        ? "bg-primary/10 border border-primary/20 text-foreground rounded-tr-sm" 
                        : "bg-card border border-border text-foreground rounded-tl-sm"
                    }`}>
                      {message.content}
                    </div>
                    
                    <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(new Date(message.createdAt), "HH:mm")}
                      </span>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete message?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this message from the session log.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteMessage(message.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Add New Pair Form */}
      <Card className="border-border shadow-sm overflow-hidden bg-card/50 backdrop-blur">
        <div className="bg-muted/30 px-6 py-3 border-b border-border font-medium text-sm flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Log new interaction
        </div>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPair)} className="space-y-6">
              <FormField
                control={form.control}
                name="userMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-primary font-medium">
                      <User className="h-4 w-4 mr-2" /> User Prompt
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Paste the prompt you sent..." 
                        className="min-h-[100px] resize-y bg-background font-mono text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assistantMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-medium">
                      <Bot className="h-4 w-4 mr-2" /> AI Response
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Paste the response you received..." 
                        className="min-h-[150px] resize-y bg-background font-mono text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isAddingPair || form.formState.isSubmitting}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm hover-elevate"
                >
                  {isAddingPair ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Save Interaction Pair
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
