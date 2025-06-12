
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
        // Ensure createdAt is a Firestore Timestamp. If it's not (e.g. from older data), convert.
        // Firestore SDK usually returns Timestamp objects directly.
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()));
        return { ...data, id: doc.id, createdAt } as Video;
      });
      setAllVideos(videosData);
    } catch (error) {
      console.error("Error fetching videos from Firestore:", error);
      setAllVideos([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const filterVideos = useCallback((term: string) => {
    if (!term.trim()) {
      setDisplayedVideos(allVideos); // Sort handled by initial fetch
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
    // Handle initial search term from URL query params
    const queryParamSearch = searchParams?.get('q');
    if (queryParamSearch) {
      setCurrentSearchTerm(queryParamSearch);
      // Videos might not be loaded yet, filter will be applied once allVideos is populated
    }
  }, [searchParams]);
  
  useEffect(() => {
    // Apply filter whenever allVideos or currentSearchTerm changes
    if (allVideos.length > 0) {
        filterVideos(currentSearchTerm);
    } else if (!isLoading) { // If not loading and no videos, displayed should be empty
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
