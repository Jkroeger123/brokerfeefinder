"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { type ParsedListing } from "~/lib/types/listing";
import { cn } from "~/lib/utils";

interface ListingCardProps {
  listing: ParsedListing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((current) =>
      current === 0 ? listing.images.length - 1 : current - 1,
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((current) =>
      current === listing.images.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <Card
      className={cn("group cursor-pointer overflow-hidden", className)}
      onClick={() => router.push(`/listing/${listing.id}`)}
    >
      <CardHeader className="relative p-0">
        {/* Image with Carousel Controls */}
        <div className="relative h-[240px] w-full">
          <Image
            src={listing.images[currentImageIndex]?.url ?? "/placeholder.svg"}
            alt={listing.forRent ? "For Rent" : "For Sale"}
            fill
            className="object-cover transition-all duration-300"
          />
          {listing.images.length > 1 && (
            <>
              {/* Navigation Arrows */}
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === currentImageIndex
                        ? "w-4 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/75",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge variant="secondary" className="bg-white/90">
              {listing.propertyType}
            </Badge>
            <Badge variant="secondary" className="bg-white/90">
              {listing.status}
            </Badge>
          </div>
        </div>
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
        <h3 className="mb-1 font-medium group-hover:text-primary">
          {listing.forRent ? "For Rent" : "For Sale"}
        </h3>
        <p className="mb-1 text-sm text-gray-600">{listing.formattedAddress}</p>
        <p className="text-sm text-gray-600">MLS#: {listing.mlsNumber}</p>
      </CardContent>

      <CardFooter className="flex gap-4 p-4 pt-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{listing.bedrooms}</span>
          <span className="text-sm text-gray-600">bed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{listing.bathrooms}</span>
          <span className="text-sm text-gray-600">bath</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">
            {listing.squareFeet.toLocaleString()}
          </span>
          <span className="text-sm text-gray-600">sqft</span>
        </div>
      </CardFooter>
    </Card>
  );
}
