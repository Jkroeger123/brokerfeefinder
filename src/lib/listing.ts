import { z } from "zod";

export const listingSchema = z.object({
  forRent: z.boolean(),
  price: z.number().min(0, "Price must be positive"),
  brokerFee: z.number().min(0).max(100, "Broker fee must be between 0-100"),
  mlsNumber: z.string().optional(),
  address: z.string().min(5, "Valid address is required"),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  squareFeet: z.number().min(0),
  propertyType: z.enum([
    "HOUSE",
    "APARTMENT",
    "CONDO",
    "TOWNHOUSE",
    "LAND",
    "COMMERCIAL",
    "OTHER",
  ]),
  description: z.string().min(1, "Description is required"),
  images: z
    .array(
      z.object({
        url: z.string().url(),
      }),
    )
    .min(1, "At least one image is required"),
});

export type ListingFormData = z.infer<typeof listingSchema>;

export interface CreateListingError {
  error: string;
  field?: string;
}

export interface CreateListingSuccess {
  success: true;
  listingId: string;
}

export interface CreateListingFailure {
  success: false;
  error: CreateListingError;
}

export type CreateListingResult = CreateListingSuccess | CreateListingFailure;

// Type for the raw query result
export type RawQueryResult = [
  {
    id: string;
  },
];
