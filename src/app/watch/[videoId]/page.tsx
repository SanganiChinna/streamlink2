
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import VideoPlayer from '@/components/video/VideoPlayer';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

export default function WatchPage() {
  const params = useParams<{ videoId: string }>(); 
  const videoId = params.videoId; 

  const [video, setVideo] = useState<Video | null | undefined>(undefined);

  useEffect(() => {
    if (!videoId) return;

    const fetchVideo = async () => {
      try {
        const videoDocRef = doc(db, "videos", videoId);
        const videoSnap = await getDoc(videoDocRef);

        if (videoSnap.exists()) {
          const data = videoSnap.data();
          let createdAtString: string;

          if (data.createdAt instanceof Timestamp) {
            createdAtString = data.createdAt.toDate().toISOString();
          } else if (data.createdAt && typeof data.createdAt.seconds === 'number' && typeof data.createdAt.nanoseconds === 'number') {
            createdAtString = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            try {
              createdAtString = new Date(data.createdAt).toISOString();
            } catch (e) {
              console.warn(`Invalid date string for createdAt: ${data.createdAt} on video ${videoSnap.id}. Falling back.`);
              createdAtString = new Date().toISOString();
            }
          } else {
            console.warn(`Missing or invalid createdAt for video ${videoSnap.id}. Falling back to current time.`);
            createdAtString = new Date().toISOString();
          }

          setVideo({
            id: videoSnap.id,
            title: data.title || 'Untitled Video',
            description: data.description || 'No description available.',
            thumbnailUrl: data.thumbnailUrl || '',
            googleDriveFileId: data.googleDriveFileId || '',
            originalLink: data.originalLink || '',
            createdAt: createdAtString,
          } as Video);
        } else {
          setVideo(null); 
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        setVideo(null); 
      }
    };

    fetchVideo();
  }, [videoId]);

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
          The video you are looking for (ID: {videoId}) does not exist or has been removed.
        </p>
        <Button asChild variant="default">
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
