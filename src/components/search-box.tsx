"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function HomePage() {
  const router = useRouter();

  const [query, setQuery] = React.useState("");

  const onSearch = () => {
    router.push(`/search?${query}`);
  };

  return (
    <div className="flex rounded-full bg-black/60 p-2 backdrop-blur-sm">
      <Input
        className="flex-1 rounded-l-full border-none bg-transparent text-white placeholder-white/50"
        placeholder="Enter location or MLS number"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
      />
      <Button
        className="rounded-full bg-teal-500 px-8 text-white hover:bg-teal-600"
        onClick={onSearch}
      >
        Search Fees
      </Button>
    </div>
  );
}
