
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteVideoAction, getVideosAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Trash2, Loader2, ListVideo, RefreshCcw } from 'lucide-react';

const VideoManagementSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Stores ID of video being deleted
  const { toast } = useToast();

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    const result = await getVideosAction();
    if (result.videos) {
      setVideos(result.videos);
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not fetch videos.",
        variant: "destructive",
      });
      setVideos([]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    setIsDeleting(videoId);
    const result = await deleteVideoAction(videoId);
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message || `Video "${videoTitle}" deleted.`,
      });
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete video.",
        variant: "destructive",
      });
    }
    setIsDeleting(null);
  };

  return (
    <Card className="w-full shadow-xl mt-12">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center">
          <ListVideo className="mr-2 h-8 w-8 text-accent" />
          Manage Videos
        </CardTitle>
        <CardDescription>
          Review and delete existing videos from the library.
          <Button onClick={fetchVideos} variant="outline" size="sm" className="ml-4" disabled={isLoading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh List
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !videos.length ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent mr-2" />
            <p>Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No videos found in the library.</p>
        ) : (
          <ul className="space-y-3">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex items-center justify-between p-3 bg-input rounded-md"
              >
                <span className="text-foreground truncate" title={video.title}>{video.title}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting === video.id}
                      aria-label={`Delete video ${video.title}`}
                    >
                      {isDeleting === video.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete the video titled "<strong>{video.title}</strong>". This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting === video.id}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteVideo(video.id, video.title)}
                        disabled={isDeleting === video.id}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting === video.id ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoManagementSection;
