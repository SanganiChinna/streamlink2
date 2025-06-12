"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Video } from '@/lib/types';
import VideoCard from './VideoCard';
import useLocalStorage from '@/hooks/useLocalStorage';
import { searchLibraryVideosAction } from '@/app/actions';
import { Loader2, Film } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const VideoGrid = () => {
  const [allVideos] = useLocalStorage<Video[]>("videos", []);
  const [displayedVideos, setDisplayedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();

  const filterAndSetVideos = useCallback(async (currentSearchTerm: string) => {
    setIsLoading(true);
    if (!currentSearchTerm.trim()) {
      setDisplayedVideos(allVideos.sort((a, b) => b.createdAt - a.createdAt));
    } else {
      try {
        const matchingTitles = await searchLibraryVideosAction(currentSearchTerm, allVideos);
        const filtered = allVideos.filter(video => matchingTitles.includes(video.title));
        setDisplayedVideos(filtered.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Failed to search videos:", error);
        // Fallback to simple client-side filtering if server action fails
        const lowerSearchTerm = currentSearchTerm.toLowerCase();
        const filtered = allVideos.filter(
          (video) =>
            video.title.toLowerCase().includes(lowerSearchTerm) ||
            video.description.toLowerCase().includes(lowerSearchTerm)
        );
        setDisplayedVideos(filtered.sort((a, b) => b.createdAt - a.createdAt));
      }
    }
    setIsLoading(false);
  }, [allVideos]);

  useEffect(() => {
    const querySearchTerm = searchParams?.get('q');
    if (querySearchTerm) {
      setSearchTerm(querySearchTerm);
      filterAndSetVideos(querySearchTerm);
    } else {
      filterAndSetVideos(searchTerm);
    }
  }, [allVideos, filterAndSetVideos, searchParams, searchTerm]);

  useEffect(() => {
    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSearchTerm(customEvent.detail);
      filterAndSetVideos(customEvent.detail);
    };

    window.addEventListener('searchSubmit', handleSearch);
    return () => {
      window.removeEventListener('searchSubmit', handleSearch);
    };
  }, [filterAndSetVideos]);


  if (isLoading && !allVideos.length) { // Show loader only if initial load and no videos
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
  
  if (!isLoading && !displayedVideos.length && searchTerm) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-muted-foreground">
        <Film className="h-24 w-24 text-accent mb-6" />
        <h2 className="font-headline text-3xl mb-2">No Results Found</h2>
        <p className="text-lg">Try a different search term.</p>
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
