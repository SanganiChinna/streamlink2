import VideoGrid from '@/components/video/VideoGrid';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl font-bold text-foreground mb-2">
          Video Library
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse and watch your curated collection of videos.
        </p>
      </div>
      <VideoGrid />
    </div>
  );
}
