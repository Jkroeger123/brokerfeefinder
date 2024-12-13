"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, MapPin, Home } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/hooks/use-toast";
import { deleteListing } from "~/server/listing";
import { type Image as ImageType } from "@prisma/client";
import { type ParsedListing } from "~/lib/types/listing";
import { ImageCarousel } from "./ui/image-carousel";

interface ListingDetailProps {
  listing: ParsedListing; // Type this properly based on your database schema
  isOwner: boolean;
}

export function ListingDetail({ listing, isOwner }: ListingDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteListing(listing.id);
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-50 to-blue-100 p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-4 flex gap-2">
                <Badge variant="secondary" className="bg-white/90">
                  {listing.propertyType}
                </Badge>
                <Badge variant="secondary" className="bg-white/90">
                  {listing.status}
                </Badge>
              </div>
              <h1 className="mb-2 text-4xl font-normal">
                {listing.forRent ? "For Rent" : "For Sale"}
              </h1>
              <p className="flex items-center text-gray-600">
                <MapPin className="mr-2 h-4 w-4" />
                {listing.formattedAddress}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-3xl font-semibold">
                $
                {Number(listing.price).toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="font-medium text-teal-600">
                Buyer Broker Fee: {listing.brokerFee.toString()}%
              </p>
              {isOwner && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/listing/${listing.id}/edit`)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Listing
                  </Button>
                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Listing</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this listing? This
                          action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="w-full">
          <ImageCarousel images={listing.images} viewImages={2} />
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-2xl font-semibold">About This Property</h2>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex gap-6">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{listing.bedrooms} beds</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{listing.bathrooms} baths</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {listing.squareFeet.toLocaleString()} sqft
                    </p>
                    <p className="text-sm text-gray-600">Living Area</p>
                  </div>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-gray-600">
                {listing.description}
              </p>
            </CardContent>
          </Card>

          {/* Property Details Sidebar */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Property Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">MLS Number</p>
                <p className="font-medium">{listing.mlsNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Property Type</p>
                <p className="font-medium">{listing.propertyType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{listing.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">
                  {listing.city}, {listing.state}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
