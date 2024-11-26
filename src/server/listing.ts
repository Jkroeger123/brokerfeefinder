"use server";

import { z } from "zod";
import { db as prisma } from "~/server/db";
import { getOrCreateUser } from "~/server/user";
import { geocodeAddress, type GeocodeResult } from "~/lib/geocoding";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type {
  ListingFormData,
  CreateListingResult,
  RawQueryResult,
} from "~/lib/listing";
import { v4 as uuid } from "uuid";

export async function createListing(
  data: ListingFormData,
): Promise<CreateListingResult> {
  try {
    const user = await getOrCreateUser();

    // Geocode the address
    let geocodeResult: GeocodeResult;
    try {
      geocodeResult = await geocodeAddress(data.address);
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: {
          error:
            "Failed to validate address. Please check the address and try again.",
          field: "address",
        },
      };
    }

    // Create the listing with geocoded data
    const result = await prisma.$transaction(
      async (tx) => {
        const rawQuery = await tx.$queryRaw<RawQueryResult>`
        INSERT INTO "Listing" (
          "id",
          "title",
          "price",
          "brokerFee",
          "mlsNumber",
          "address",
          "formattedAddress",
          "city",
          "state",
          "zipCode",
          "location",
          "bedrooms",
          "bathrooms",
          "squareFeet",
          "propertyType",
          "description",
          "userId",
          "status",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${uuid()},
          ${data.title},
          ${new Prisma.Decimal(data.price)},
          ${new Prisma.Decimal(data.brokerFee)},
          ${data.mlsNumber},
          ${data.address},
          ${geocodeResult.formattedAddress},
          ${geocodeResult.city},
          ${geocodeResult.state},
          ${geocodeResult.zipCode},
          ST_SetSRID(ST_MakePoint(${geocodeResult.longitude}, ${geocodeResult.latitude}), 4326),
          ${data.bedrooms},
          ${data.bathrooms},
          ${data.squareFeet},
          ${data.propertyType}::"PropertyType",
          ${data.description},
          ${user.id},
          'ACTIVE'::"ListingStatus",
          NOW(),
          NOW()
        )
        RETURNING "id"
      `;

        if (!rawQuery?.[0]?.id) {
          throw new Error("Failed to create listing record");
        }

        const listingId = rawQuery[0].id;

        // Create images in the same transaction
        if (data.images.length > 0) {
          await tx.$executeRaw`
          INSERT INTO "Image" ("id", "url", "listingId")
          VALUES ${Prisma.join(
            data.images.map(
              (image) => Prisma.sql`(${uuid()}, ${image.url}, ${listingId})`,
            ),
          )}
        `;
        }

        return listingId;
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
    // Revalidate the listings page
    revalidatePath("/listings");

    return {
      success: true,
      listingId: result,
    };
  } catch (error) {
    console.error("Failed to create listing:", error);

    // Type guard for Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case "P2002":
          return {
            success: false,
            error: {
              error: "A listing with this MLS number already exists.",
              field: "mlsNumber",
            },
          };
        case "P2003":
          return {
            success: false,
            error: {
              error: "Invalid user reference.",
            },
          };
        default:
          return {
            success: false,
            error: {
              error: "Database error occurred. Please try again.",
            },
          };
      }
    }

    return {
      success: false,
      error: {
        error: "Failed to create listing. Please try again later.",
      },
    };
  }
}

// Helper function to validate database connection
export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

export async function deleteListing(id: string) {
  const user = await getOrCreateUser();

  const listing = await prisma.listing.findUnique({
    where: {
      id: id,
    },
    include: {
      images: true,
    },
  });

  if (!listing || listing.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction(async (tx) => {
    await tx.image.deleteMany({
      where: {
        listingId: id,
      },
    });

    await tx.listing.delete({
      where: {
        id: id,
      },
    });
  });

  revalidatePath("/listings");
}
