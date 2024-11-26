"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface SearchHeaderProps {
  currentQuery: string;
  totalResults: number;
}

export function SearchHeader({
  currentQuery,
  totalResults,
}: SearchHeaderProps) {
  const router = useRouter();
  const [searching, setSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearching(false);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="mb-2 text-4xl font-normal">
            {currentQuery ? (
              <>
                Results for{" "}
                <span className="text-teal-600">{currentQuery}</span>
              </>
            ) : (
              "All Listings"
            )}
          </h1>
          <p className="text-gray-600">
            Found {totalResults}{" "}
            {totalResults === 1 ? "property" : "properties"} with broker fee
            information
          </p>
        </div>
        <form onSubmit={handleSearch} className="w-full lg:w-auto">
          <div className="flex rounded-full bg-white/80 p-2 backdrop-blur-sm">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location or MLS#..."
              className="flex-1 border-none bg-transparent placeholder-gray-400 shadow-none"
              required
              autoComplete="off"
              aria-label="Search location or MLS number"
            />
            <Button
              type="submit"
              className="rounded-full bg-teal-500 px-8 text-white hover:bg-teal-600"
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
