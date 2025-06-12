"use client"; // Required for useLocalStorage and client-side data fetching

import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface WatchPageParams {
  params: {
    videoId: string;
  };
}

export default function WatchPage({ params }: WatchPageParams) {
  const { videoId } = params;
  const [videos] = useLocalStorage<Video[]>("videos", []);
  const [video, setVideo] = useState<Video | null | undefined>(undefined); // undefined for loading state

  useEffect(() => {
    const foundVideo = videos.find(v => v.googleDriveFileId === videoId);
    setVideo(foundVideo || null);
  }, [videos, videoId]);

  if (video === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-xl font-headline">Loading Video Details...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-10">
        <h1 className="font-headline text-3xl text-destructive mb-4">Video Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The video you are looking for does not exist or has been removed.
        </p>
        <Button asChild variant="primary">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Library
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button asChild variant="outline" className="mb-6 hover:bg-accent hover:text-accent-foreground transition-colors">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
        </Link>
      </Button>
      
      <h1 className="font-headline text-4xl font-bold text-foreground break-words">
        {video.title}
      </h1>
      
      <VideoPlayer fileId={video.googleDriveFileId} title={video.title} />
      
      <div>
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">Description</h2>
        <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {video.description}
        </p>
      </div>
    </div>
  );
}
