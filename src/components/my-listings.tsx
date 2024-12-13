"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Home, ListPlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { type ParsedListing } from "~/lib/types/listing";
import { ListingCard } from "~/components/listing-card";

interface MyListingsProps {
  listings: ParsedListing[];
}

export function MyListingsComponent({ listings }: MyListingsProps) {
  const router = useRouter();

  if (listings.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 lg:p-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gray-100 p-3">
              <Home className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-semibold">No Listings Yet</h2>
          <p className="mb-6 text-gray-600">
            Create your first property listing to start connecting with
            potential buyers.
          </p>
          <Button onClick={() => router.push("/new-listing")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Listing
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-3xl font-semibold">My Listings</h1>
            <p className="text-gray-600">
              Manage your property listings and broker fees
            </p>
          </div>
          <Button onClick={() => router.push("/new-listing")} className="gap-2">
            <ListPlus className="h-4 w-4" />
            Create New Listing
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </main>
  );
}
