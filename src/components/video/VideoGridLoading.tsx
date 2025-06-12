
import { Loader2 } from 'lucide-react';

export default function VideoGridLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-muted-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
      <p className="text-xl font-headline">Loading Video Grid...</p>
    </div>
  );
}
