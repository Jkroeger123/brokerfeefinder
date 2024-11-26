"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function HomePage() {
  const [searching, setSearching] = React.useState(false);
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex rounded-full bg-black/60 p-2 backdrop-blur-sm"
    >
      <Input
        className="flex-1 rounded-l-full border-none bg-transparent text-white placeholder-white/50"
        placeholder="Enter location or MLS number"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        // Prevent form submission on empty input
        required
        // Disable auto-complete if desired
        autoComplete="off"
        // Better accessibility
        aria-label="Search location or MLS number"
      />
      <Button
        type="submit"
        className="rounded-full bg-teal-500 px-8 text-white hover:bg-teal-600"
        disabled={searching || !query.trim()}
      >
        {searching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          "Search Fees"
        )}
      </Button>
    </form>
  );
}
