"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UploadDropzone as FileUploadDropzone } from "~/lib/uploadthing";
import { listingSchema, type ListingFormData } from "~/lib/listing";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { updateListing } from "~/server/listing";
import { cn } from "~/lib/utils";
import { useDebounce } from "~/hooks/use-debounce";
import { isValidAddress } from "~/lib/geocoding-public";
import { X, Loader2 } from "lucide-react";
import { type ParsedListing } from "~/lib/types/listing";

interface EditListingComponentProps {
  listing: ParsedListing;
}

export function EditListingComponent({ listing }: EditListingComponentProps) {
  const [images, setImages] = React.useState<{ url: string; id?: string }[]>(
    listing.images.map((img) => ({ url: img.url, id: img.id })),
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = React.useState(false);
  const [addressError, setAddressError] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      price: Number(listing.price),
      brokerFee: Number(listing.brokerFee),
      mlsNumber: listing.mlsNumber ?? "",
      address: listing.address,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareFeet: listing.squareFeet,
      propertyType: listing.propertyType,
      description: listing.description,
      images: listing.images,
    },
  });

  const debouncedAddress = useDebounce(watch("address"), 500);

  React.useEffect(() => {
    async function validateAddress() {
      if (!debouncedAddress || debouncedAddress.length < 5) return;
      if (debouncedAddress === listing.address) return; // Skip validation if address hasn't changed

      setIsValidatingAddress(true);
      setAddressError(null);

      try {
        if (!isValidAddress(debouncedAddress)) {
          setAddressError("Please enter a valid address");
          return;
        }
      } catch (error) {
        console.error(error);
        setAddressError("Failed to validate address");
      } finally {
        setIsValidatingAddress(false);
      }
    }

    void validateAddress();
  }, [debouncedAddress, listing.address]);

  const onSubmit = async (data: ListingFormData) => {
    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      data.images = images;

      const result = await updateListing(listing.id, data);

      if (!result.success) {
        if (result.error.field === "address") {
          setAddressError(result.error.error);
          return;
        }

        toast({
          title: "Error",
          description: result.error.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Listing updated successfully",
      });
      router.push(`/listing/${listing.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update listing ${error instanceof Error && error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 bg-gray-50 p-4 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-semibold">Edit Listing</h1>
          <p className="text-gray-600">
            Update your property listing information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Listing</CardTitle>
            <CardDescription>
              Modify the details of your property listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Property Images</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {images.map((image, idx) => (
                    <div
                      key={image.id ?? idx}
                      className="group relative aspect-square"
                    >
                      <img
                        src={image.url}
                        alt={`Property ${idx + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => {
                          const filteredImages = images.filter(
                            (_, i) => i !== idx,
                          );
                          setImages(filteredImages);
                          setValue("images", filteredImages, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <FileUploadDropzone
                  endpoint="listingImage"
                  onClientUploadComplete={(res) => {
                    if (res) {
                      const newImages = res.map((r) => ({ url: r.url }));
                      setImages((prev) => [...prev, ...newImages]);
                      setValue("images", [...images, ...newImages], {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      title: "Error",
                      description: error.message,
                      variant: "destructive",
                    });
                  }}
                  className={cn(
                    "ut-label:text-sm ut-label:font-medium",
                    "ut-allowed-content:text-xs ut-allowed-content:text-gray-500",
                    "ut-button:bg-primary ut-button:text-primary-foreground",
                    "ut-upload-icon:h-10 ut-upload-icon:w-10 ut-upload-icon:text-gray-400",
                  )}
                />
                {errors.images && (
                  <p className="text-sm text-destructive">
                    {errors.images.message}
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="forRent">Listing Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("forRent", value === "rent")
                    }
                    defaultValue={
                      listing ? (listing.forRent ? "rent" : "sale") : "sale"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select listing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="Enter price"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Broker Fee and MLS */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brokerFee">Buyer Broker Fee (%)</Label>
                  <Input
                    id="brokerFee"
                    type="number"
                    step="0.01"
                    {...register("brokerFee", { valueAsNumber: true })}
                    placeholder="Enter broker fee percentage"
                  />
                  {errors.brokerFee && (
                    <p className="text-sm text-destructive">
                      {errors.brokerFee.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mlsNumber">MLS Number</Label>
                  <Input
                    id="mlsNumber"
                    {...register("mlsNumber")}
                    placeholder="Enter MLS number"
                  />
                  {errors.mlsNumber && (
                    <p className="text-sm text-destructive">
                      {errors.mlsNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Enter full address"
                    className={cn(
                      addressError && "border-destructive",
                      isValidatingAddress && "pr-10",
                    )}
                  />
                  {isValidatingAddress && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {addressError && (
                  <p className="text-sm text-destructive">{addressError}</p>
                )}
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    {...register("bedrooms", { valueAsNumber: true })}
                    placeholder="Number of bedrooms"
                  />
                  {errors.bedrooms && (
                    <p className="text-sm text-destructive">
                      {errors.bedrooms.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    {...register("bathrooms", { valueAsNumber: true })}
                    placeholder="Number of bathrooms"
                  />
                  {errors.bathrooms && (
                    <p className="text-sm text-destructive">
                      {errors.bathrooms.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squareFeet">Square Feet</Label>
                  <Input
                    id="squareFeet"
                    type="number"
                    {...register("squareFeet", { valueAsNumber: true })}
                    placeholder="Total square feet"
                  />
                  {errors.squareFeet && (
                    <p className="text-sm text-destructive">
                      {errors.squareFeet.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  onValueChange={(value) =>
                    setValue(
                      "propertyType",
                      value as ListingFormData["propertyType"],
                    )
                  }
                  defaultValue={listing.propertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="CONDO">Condo</SelectItem>
                    <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                    <SelectItem value="LAND">Land</SelectItem>
                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyType && (
                  <p className="text-sm text-destructive">
                    {errors.propertyType.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter property description"
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Listing"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
