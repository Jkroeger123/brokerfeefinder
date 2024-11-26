import type { Image, Listing, User } from "@prisma/client";

export type ListingWithRelations = Listing & {
  user: User;
  images: Image[];
};

// Type for the parsed listing that's passed to the client component
export type ParsedListing = Omit<
  ListingWithRelations,
  "price" | "brokerFee"
> & {
  price: string;
  brokerFee: string;
};
