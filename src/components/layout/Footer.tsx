
"use client";

import { useState, useEffect } from 'react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setCurrentYear(new Date().getFullYear());
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <footer className="bg-card shadow-sm mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>
          &copy; {currentYear !== null ? currentYear : <span>&nbsp;</span>} StreamLink. All rights reserved.
        </p>
        <p className="text-xs mt-1">Powered by Modern Web Technologies</p>
      </div>
    </footer>
  );
};

export default Footer;
