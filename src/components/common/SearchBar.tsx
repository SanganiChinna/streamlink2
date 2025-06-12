"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { ChangeEvent, FormEvent } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearchSubmit: () => void;
}

const SearchBar = ({ searchTerm, onSearchTermChange, onSearchSubmit }: SearchBarProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="Search videos..."
        value={searchTerm}
        onChange={handleInputChange}
        className="bg-input text-foreground placeholder:text-muted-foreground flex-grow"
        aria-label="Search videos"
      />
      <Button type="submit" variant="primary" size="icon" aria-label="Submit search">
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default SearchBar;
