"use client";

import * as React from "react";
import { type ParsedListing } from "~/lib/types/listing";
import { SearchHeader } from "./search-header";
import { ListingCard } from "~/components/listing-card";

interface SearchResultsProps {
  query: string;
  listings: ParsedListing[];
}

export function SearchResults({ query, listings }: SearchResultsProps) {
  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <SearchHeader currentQuery={query} totalResults={listings.length} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </main>
  );
}
