"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { type ParsedListing } from "~/lib/types/listing";
import { SearchHeader } from "./search-header";

interface SearchResultsProps {
  query: string;
  listings: ParsedListing[];
}

export function SearchResults({ query, listings }: SearchResultsProps) {
  const router = useRouter();

  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <SearchHeader currentQuery={query} totalResults={listings.length} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="group cursor-pointer overflow-hidden"
              onClick={() => router.push(`/listing/${listing.id}`)}
            >
              <CardHeader className="relative p-0">
                <Image
                  src={listing.images[0]?.url ?? "/placeholder.svg"}
                  alt={listing.title}
                  width={400}
                  height={300}
                  className="h-[240px] w-full object-cover"
                />
                <div className="absolute left-4 top-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {listing.propertyType}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/90">
                    {listing.status}
                  </Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-4 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add favorite functionality
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-semibold">
                      $
                      {Number(listing.price).toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="font-medium text-teal-600">
                      Buyer Broker Fee: {listing.brokerFee}%
                    </p>
                  </div>
                </div>
                <h3 className="mb-1 font-medium">{listing.title}</h3>
                <p className="mb-1 text-sm text-gray-600">
                  {listing.formattedAddress}
                </p>
                <p className="text-sm text-gray-600">
                  MLS#: {listing.mlsNumber}
                </p>
              </CardContent>
              <CardFooter className="flex gap-4 p-4 pt-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {listing.bedrooms}
                  </span>
                  <span className="text-sm text-gray-600">bed</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {listing.bathrooms}
                  </span>
                  <span className="text-sm text-gray-600">bath</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {listing.squareFeet}
                  </span>
                  <span className="text-sm text-gray-600">sqft</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
