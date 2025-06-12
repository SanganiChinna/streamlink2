"use client";

import Link from 'next/link';
import Logo from '@/components/common/Logo';
import SearchBar from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Clear search term when navigating away from home
    if (pathname !== '/') {
      setSearchTerm('');
    }
  }, [pathname]);

  const handleSearchSubmit = () => {
    if (pathname !== '/') {
      router.push(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      // If already on homepage, let homepage handle search state internally
      const event = new CustomEvent('searchSubmit', { detail: searchTerm });
      window.dispatchEvent(event);
    }
  };
  
  const showSearchBar = pathname === '/' || pathname?.startsWith('/watch');

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-4">
          {showSearchBar && (
            <SearchBar 
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearchSubmit={handleSearchSubmit}
            />
          )}
          <nav className="space-x-2">
            <Button variant="ghost" asChild className="text-foreground hover:text-accent hover:bg-transparent transition-colors duration-300">
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild className="text-foreground hover:text-accent hover:bg-transparent transition-colors duration-300">
              <Link href="/admin">Admin</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
