"use server";

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
          "forRent",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${uuid()},
          ${"title"},
          ${new Prisma.Decimal(data.price)},
          ${new Prisma.Decimal(data.brokerFee)},
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
          ${data.forRent},
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

    revalidatePath("/listings");

    return {
      success: true,
      listingId: result,
    };
  } catch (error) {
    console.error("Failed to create listing:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
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

export async function updateListing(
  id: string,
  data: ListingFormData,
): Promise<CreateListingResult> {
  try {
    const user = await getOrCreateUser();

    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingListing) {
      return {
        success: false,
        error: {
          error: "Listing not found",
        },
      };
    }

    if (existingListing.userId !== user.id) {
      return {
        success: false,
        error: {
          error: "Unauthorized to update this listing",
        },
      };
    }

    let geocodeResult: GeocodeResult | null = null;
    if (data.address !== existingListing.address) {
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
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const locationUpdate = geocodeResult
          ? Prisma.sql`
              "location" = ST_SetSRID(ST_MakePoint(${geocodeResult.longitude}, ${geocodeResult.latitude}), 4326),
              "formattedAddress" = ${geocodeResult.formattedAddress},
              "city" = ${geocodeResult.city},
              "state" = ${geocodeResult.state},
              "zipCode" = ${geocodeResult.zipCode},
            `
          : Prisma.sql``;

        const rawQuery = await tx.$queryRaw<RawQueryResult>`
          UPDATE "Listing"
          SET
            "title" = ${"title"},
            "price" = ${new Prisma.Decimal(data.price)},
            "brokerFee" = ${new Prisma.Decimal(data.brokerFee)},
            "address" = ${data.address},
            "forRent" = ${data.forRent},
            ${locationUpdate}
            "bedrooms" = ${data.bedrooms},
            "bathrooms" = ${data.bathrooms},
            "squareFeet" = ${data.squareFeet},
            "propertyType" = ${data.propertyType}::"PropertyType",
            "description" = ${data.description},
            "updatedAt" = NOW()
          WHERE "id" = ${id} AND "userId" = ${user.id}
          RETURNING "id"
        `;

        if (!rawQuery?.[0]?.id) {
          throw new Error("Failed to update listing record");
        }

        const existingImageIds = new Set(
          existingListing.images.map((img) => img.id),
        );
        const updatedImageIds = new Set(
          data.images.filter((img) => "id" in img).map((img) => img.id),
        );

        const imagesToDelete = [...existingImageIds].filter(
          (id) => !updatedImageIds.has(id),
        );
        if (imagesToDelete.length > 0) {
          await tx.image.deleteMany({
            where: {
              id: {
                in: imagesToDelete,
              },
            },
          });
        }

        const newImages = data.images.filter((img) => !("id" in img));
        if (newImages.length > 0) {
          await tx.$executeRaw`
            INSERT INTO "Image" ("id", "url", "listingId")
            VALUES ${Prisma.join(
              newImages.map(
                (image) => Prisma.sql`(${uuid()}, ${image.url}, ${id})`,
              ),
            )}
          `;
        }

        return id;
      },
      {
        maxWait: 5000,
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/listings");
    revalidatePath(`/listing/${id}`);

    return {
      success: true,
      listingId: result,
    };
  } catch (error) {
    console.error("Failed to update listing:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
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
        error: "Failed to update listing. Please try again later.",
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
