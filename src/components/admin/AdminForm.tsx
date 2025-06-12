"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { Video } from "@/lib/types";
import { extractGoogleDriveFileId } from "@/lib/utils";
import { generateVideoDetailsAction } from "@/app/actions";
import { PlusCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  googleDriveLink: z.string().url({ message: "Please enter a valid URL." })
    .refine(extractGoogleDriveFileId, { message: "Invalid Google Drive link format." }),
});

type FormData = z.infer<typeof formSchema>;

const AdminForm = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useLocalStorage<Video[]>("videos", []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    const fileId = extractGoogleDriveFileId(data.googleDriveLink);

    if (!fileId) {
      toast({
        title: "Error",
        description: "Could not extract File ID from the link.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (videos.some(v => v.id === fileId)) {
      toast({
        title: "Info",
        description: "This video already exists in the library.",
        variant: "default",
      });
      setIsSubmitting(false);
      reset();
      return;
    }

    try {
      const videoDetails = await generateVideoDetailsAction(fileId, data.googleDriveLink);
      const newVideo: Video = {
        ...videoDetails,
        createdAt: Date.now(),
      };
      
      setVideos((prevVideos) => [...prevVideos, newVideo].sort((a,b) => b.createdAt - a.createdAt));
      toast({
        title: "Success!",
        description: `Video "${videoDetails.title}" added to library.`,
      });
      reset();
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
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
          Enter a Google Drive video link to add it to the StreamLink library.
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
