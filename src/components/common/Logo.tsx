import Link from 'next/link';
import { Clapperboard } from 'lucide-react';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Clapperboard className="h-8 w-8 text-accent group-hover:animate-pulse transition-transform duration-300 ease-in-out transform group-hover:scale-110" />
      <span className="font-headline text-2xl font-bold text-foreground group-hover:text-accent transition-colors duration-300">
        StreamLink
      </span>
    </Link>
  );
};

export default Logo;
