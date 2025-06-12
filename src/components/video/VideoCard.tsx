"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Video } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useState } from 'react';

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  const [imgSrc, setImgSrc] = useState(video.thumbnailUrl);
  const placeholderImg = "https://placehold.co/320x180.png";

  return (
    <Link href={`/watch/${video.googleDriveFileId}`} passHref>
      <Card className="bg-card border-border hover:border-accent transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden group">
        <CardHeader className="p-0 relative">
          <div className="aspect-video w-full relative overflow-hidden">
            <Image
              src={imgSrc}
              alt={`Thumbnail for ${video.title}`}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 ease-in-out group-hover:scale-110"
              onError={() => setImgSrc(placeholderImg)}
              data-ai-hint="video play"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="font-headline text-lg text-foreground group-hover:text-accent transition-colors duration-300 truncate" title={video.title}>
            {video.title}
          </CardTitle>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2" title={video.description}>
            {video.description}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default VideoCard;
