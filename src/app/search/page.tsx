import { db as prisma } from "~/server/db";
import { SearchResults } from "~/components/search-results";
import type { ListingWithRelations, ParsedListing } from "~/lib/types/listing";
import { redirect } from "next/navigation";
import { type Image } from "@prisma/client";
import { geocodeAddress, type GeocodeResult } from "~/lib/geocoding";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchListings(query: string) {
  const listing = await prisma.listing.findFirst({
    where: {
      mlsNumber: {
        equals: query,
      },
    },
    include: {
      images: true,
    },
  });

  if (listing) {
    redirect(`/listing/${listing.id}`);
  }

  // Otherwise, search by location
  let location: GeocodeResult;
  try {
    location = await geocodeAddress(query);
  } catch (error) {
    // If geocoding fails, try searching by city/state/address fields
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { city: { contains: query, mode: "insensitive" } },
          { state: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
          { formattedAddress: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        images: true,
      },
      take: 20,
    });
    return listings as ListingWithRelations[];
  }

  // If we have coordinates, use PostGIS search
  const listings = await prisma.$queryRaw<Array<unknown>>`
    WITH LocationSearch AS (
      SELECT 
        l.*,
        ST_AsText(l.location) as location_text, -- Convert geometry to text
        ST_Distance(
          l.location::geography,
          ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
        ) as distance
      FROM "Listing" l
      WHERE 
        l.status = 'ACTIVE'
        AND (
          l.city ILIKE ${`%${location.city}%`}
          OR l.state = ${location.state}
          OR ST_DWithin(
            l.location::geography,
            ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography,
            50000  -- 50km radius
          )
        )
    )
    SELECT 
      l.id,
      l."createdAt",
      l."updatedAt",
      l.title,
      l.price,
      l."brokerFee",
      l."mlsNumber",
      l.address,
      l."formattedAddress",
      l.city,
      l.state,
      l."zipCode",
      l.location_text as location,
      l.bedrooms,
      l.bathrooms,
      l."squareFeet",
      l."propertyType",
      l.description,
      l.status,
      l."userId",
      json_agg(
        CASE 
          WHEN i.id IS NOT NULL 
          THEN json_build_object(
            'id', i.id,
            'url', i.url,
            'listingId', i."listingId"
          )
          ELSE NULL 
        END
      ) FILTER (WHERE i.id IS NOT NULL) as images
    FROM LocationSearch l
    LEFT JOIN "Image" i ON i."listingId" = l.id
    GROUP BY 
      l.id, 
      l."createdAt",
      l."updatedAt",
      l.title,
      l.price,
      l."brokerFee",
      l."mlsNumber",
      l.address,
      l."formattedAddress",
      l.city,
      l.state,
      l."zipCode",
      l.location_text,
      l.bedrooms,
      l.bathrooms,
      l."squareFeet",
      l."propertyType",
      l.description,
      l.status,
      l."userId",
      l.distance
    ORDER BY l.distance
    LIMIT 20
  `;

  return listings as ListingWithRelations[];
}

async function parseListings(
  listings: ListingWithRelations[],
): Promise<ParsedListing[]> {
  return listings.map((listing) => ({
    ...listing,
    price: listing.price.toString(),
    brokerFee: listing.brokerFee.toString(),
    images: listing.images.filter((img: Image) => img.id !== null),
    createdAt: new Date(listing.createdAt),
    updatedAt: new Date(listing.updatedAt),
  }));
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = (await searchParams).q;
  const query = q ?? "";
  const rawListings = await searchListings(query);
  const listings = await parseListings(rawListings);

  return <SearchResults query={query} listings={listings} />;
}
