import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSession } from "@workspace/api-client-react";
import { BookText, ArrowLeft, Save, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});

type SessionFormValues = z.infer<typeof formSchema>;

export default function NewSession() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  const createSession = useCreateSession({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Session created",
          description: "Your new prompt logging session is ready.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/summary"] });
        setLocation(`/sessions/${data.id}`);
      },
      onError: () => {
        toast({
          title: "Error creating session",
          description: "There was a problem saving your session. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    }
  });

  const onSubmit = (data: SessionFormValues) => {
    setIsSubmitting(true);
    
    // Process tags string to ensure it's clean
    let cleanTags = null;
    if (data.tags && data.tags.trim() !== "") {
      cleanTags = data.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .join(', ');
    }

    createSession.mutate({
      data: {
        title: data.title,
        description: data.description || null,
        tags: cleanTags,
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pt-4 md:pt-8">
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/sessions")}
          className="mb-4 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="font-serif text-4xl text-foreground mb-2 flex items-center">
          <BookText className="mr-3 h-8 w-8 text-primary" />
          New Session
        </h1>
        <p className="text-muted-foreground font-sans text-sm">
          Create a new workspace to document your prompt engineering iterations.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-xl">Session Details</CardTitle>
          <CardDescription>
            Give your session a descriptive name so you can find it later.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Code Review Assistant Refactoring" 
                        className="font-medium bg-background" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A short, descriptive name for this prompt experiment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What are you trying to achieve with this prompt?" 
                        className="resize-none bg-background min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Context about the task, the model used, or the constraints.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., coding, react, refactor" 
                        className="font-mono text-sm bg-background" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of keywords to help you search later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4 flex justify-end gap-4 border-t border-border mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/sessions")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Create Session</>
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
