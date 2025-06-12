
"use client";

import Link from 'next/link';
import Logo from '@/components/common/Logo';
import SearchBar from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext'; // Import useAuth and AuthProvider
import { LogOut } from 'lucide-react';

// To use useAuth, HeaderContent needs to be a child of AuthProvider
const HeaderContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated, logout, isLoading } = useAuth(); // isLoading can be used if needed

  useEffect(() => {
    if (pathname !== '/') {
      setSearchTerm('');
    }
  }, [pathname]);

  const handleSearchSubmit = () => {
    if (pathname !== '/') {
      router.push(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      const event = new CustomEvent('searchSubmit', { detail: searchTerm });
      window.dispatchEvent(event);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirect to home page after logout
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
          <nav className="space-x-2 flex items-center">
            <Button variant="ghost" asChild className="text-foreground hover:text-accent hover:bg-transparent transition-colors duration-300">
              <Link href="/">Home</Link>
            </Button>
            {!isAuthenticated && ( // Show Admin link only if not authenticated
              <Button variant="ghost" asChild className="text-foreground hover:text-accent hover:bg-transparent transition-colors duration-300">
                <Link href="/admin">Admin</Link>
              </Button>
            )}
            {isAuthenticated && ( // Show Admin link as a direct path if authenticated, and Logout button
              <>
                <Button variant="ghost" asChild className="text-foreground hover:text-accent hover:bg-transparent transition-colors duration-300">
                  <Link href="/admin">Admin Panel</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="text-foreground hover:text-destructive hover:bg-transparent transition-colors duration-300"
                  aria-label="Logout"
                >
                  <LogOut className="mr-1 h-5 w-5" /> Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Wrap HeaderContent with AuthProvider so useAuth can be used
const Header = () => {
  return (
    <AuthProvider>
      <HeaderContent />
    </AuthProvider>
  );
};


export default Header;
