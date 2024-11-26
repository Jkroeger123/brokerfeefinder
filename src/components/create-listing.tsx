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
import { createListing } from "~/server/listing";
import { cn } from "~/lib/utils";
import { useDebounce } from "~/hooks/use-debounce";
import { isValidAddress } from "~/lib/geocoding-public";
import { X, Loader2 } from "lucide-react";

export function CreateListingComponent() {
  const [images, setImages] = React.useState<{ url: string }[]>([]);
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
    control,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      images: [],
      propertyType: "HOUSE",
      brokerFee: 0,
    },
  });

  const debouncedAddress = useDebounce(watch("address"), 500);

  React.useEffect(() => {
    async function validateAddress() {
      if (!debouncedAddress || debouncedAddress.length < 5) return;

      setIsValidatingAddress(true);
      setAddressError(null);

      try {
        if (!isValidAddress(debouncedAddress)) {
          setAddressError("Please enter a valid address");
          return;
        }
      } catch (error) {
        console.log(error);
        setAddressError("Failed to validate address");
      } finally {
        setIsValidatingAddress(false);
      }
    }

    void validateAddress();
  }, [debouncedAddress]);

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

      const result = await createListing(data);

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
        description: "Listing created successfully",
      });
      router.push(`/listing/${result.listingId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing",
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
          <h1 className="mb-2 text-3xl font-semibold">Create New Listing</h1>
          <p className="text-gray-600">
            Add a new property listing with accurate broker fee information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Listing</CardTitle>
            <CardDescription>
              Enter all the details for your new property listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Property Images</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {images.map((image, idx) => (
                    <div key={idx} className="group relative aspect-square">
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
                          // Update React Hook Form's internal state
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
                      // Update React Hook Form's internal state
                      setValue("images", [...images, ...newImages], {
                        shouldValidate: true, // This triggers validation
                        shouldDirty: true, // Marks the field as "dirty" (changed)
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
                  <Label htmlFor="title">Listing Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter listing title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
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
                  defaultValue="HOUSE"
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
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
