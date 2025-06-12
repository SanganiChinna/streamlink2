
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { extractGoogleDriveFileId } from "@/lib/utils";
import { addVideoToLibraryAction } from "@/app/actions";
import { PlusCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  googleDriveLink: z.string().url({ message: "Please enter a valid URL." })
    .refine(extractGoogleDriveFileId, { message: "Invalid Google Drive link format." }),
  title: z.string().min(1, { message: "Title is required." }).max(150, { message: "Title cannot exceed 150 characters."}),
  description: z.string().max(5000, { message: "Description cannot exceed 5000 characters."}).optional(),
});

type FormData = z.infer<typeof formSchema>;

const AdminForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "", // Ensure description is initialized for optional field
    }
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      const result = await addVideoToLibraryAction({
        googleDriveLink: data.googleDriveLink,
        title: data.title,
        description: data.description || "No description provided.", // Provide default if empty
      });

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || `Video "${data.title}" added to library.`,
        });
        reset();
      } else if (result.message) { // Video already exists
         toast({
          title: "Info",
          description: result.message,
          variant: "default",
        });
        reset(); // Also reset if video already exists
      }
      else {
        toast({
          title: "Error",
          description: result.error || "Failed to add video. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center">
          <PlusCircle className="mr-2 h-8 w-8 text-accent" />
          Add New Video
        </CardTitle>
        <CardDescription>
          Enter a Google Drive video link, title, and description to add it to the StreamLink library.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="googleDriveLink" className="text-lg">Google Drive Link</Label>
            <Input
              id="googleDriveLink"
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              {...register("googleDriveLink")}
              className={`bg-input text-foreground placeholder:text-muted-foreground ${errors.googleDriveLink ? "border-destructive focus:ring-destructive" : ""}`}
            />
            {errors.googleDriveLink && (
              <p className="text-sm text-destructive">{errors.googleDriveLink.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter video title"
              {...register("title")}
              className={`bg-input text-foreground placeholder:text-muted-foreground ${errors.title ? "border-destructive focus:ring-destructive" : ""}`}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter video description"
              {...register("description")}
              className={`bg-input text-foreground placeholder:text-muted-foreground min-h-[100px] ${errors.description ? "border-destructive focus:ring-destructive" : ""}`}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full text-lg py-3" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding Video...
              </>
            ) : (
              "Add Video to Library"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminForm;
