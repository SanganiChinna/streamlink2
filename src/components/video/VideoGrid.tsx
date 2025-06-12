
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/lib/types';
import VideoCard from './VideoCard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { Loader2, Film } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const VideoGrid = () => {
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const searchParams = useSearchParams();

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const videosCollectionRef = collection(db, "videos");
      const q = query(videosCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const videosData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let createdAtString: string;

        if (data.createdAt instanceof Timestamp) {
          createdAtString = data.createdAt.toDate().toISOString();
        } else if (data.createdAt && typeof data.createdAt.seconds === 'number' && typeof data.createdAt.nanoseconds === 'number') {
          createdAtString = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
           try {
            createdAtString = new Date(data.createdAt).toISOString();
          } catch (e) {
            console.warn(`Invalid date string for createdAt: ${data.createdAt} on video ${doc.id}. Falling back.`);
            createdAtString = new Date().toISOString();
          }
        } else {
          console.warn(`Missing or invalid createdAt for video ${doc.id}. Falling back to current time.`);
          createdAtString = new Date().toISOString();
        }
        
        return {
          id: doc.id,
          title: data.title || 'Untitled Video',
          description: data.description || 'No description available.',
          thumbnailUrl: data.thumbnailUrl || '',
          googleDriveFileId: data.googleDriveFileId || '',
          originalLink: data.originalLink || '',
          createdAt: createdAtString,
        } as Video;
      });
      setAllVideos(videosData);
    } catch (error) {
      console.error("Error fetching videos from Firestore:", error);
      setAllVideos([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const filterVideos = useCallback((term: string) => {
    if (!term.trim()) {
      setDisplayedVideos(allVideos); 
    } else {
      const lowerSearchTerm = term.toLowerCase();
      const filtered = allVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(lowerSearchTerm) ||
          (video.description && video.description.toLowerCase().includes(lowerSearchTerm))
      );
      setDisplayedVideos(filtered);
    }
  }, [allVideos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const queryParamSearch = searchParams?.get('q');
    if (queryParamSearch) {
      setCurrentSearchTerm(queryParamSearch);
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (allVideos.length > 0) {
        filterVideos(currentSearchTerm);
    } else if (!isLoading) { 
        setDisplayedVideos([]);
    }
  }, [allVideos, currentSearchTerm, filterVideos, isLoading]);


  useEffect(() => {
    const handleSearchEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setCurrentSearchTerm(customEvent.detail);
    };

    window.addEventListener('searchSubmit', handleSearchEvent);
    return () => {
      window.removeEventListener('searchSubmit', handleSearchEvent);
    };
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-xl font-headline">Loading Videos...</p>
      </div>
    );
  }

  if (!allVideos.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-muted-foreground">
        <Film className="h-24 w-24 text-accent mb-6" />
        <h2 className="font-headline text-3xl mb-2">No Videos Yet</h2>
        <p className="text-lg">Head to the Admin page to add your first video!</p>
      </div>
    );
  }
  
  if (!displayedVideos.length && currentSearchTerm) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-muted-foreground">
        <Film className="h-24 w-24 text-accent mb-6" />
        <h2 className="font-headline text-3xl mb-2">No Results Found</h2>
        <p className="text-lg">Try a different search term for "{currentSearchTerm}".</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {displayedVideos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
