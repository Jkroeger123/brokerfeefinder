import { db as prisma } from "~/server/db";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { EditListingComponent } from "~/components/edit-listing";

async function getListing(id: string) {
  const { userId } = await auth();

  let finalUserId: string | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    finalUserId = user?.id ?? null;
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: id,
    },
    include: {
      user: true,
      images: true,
    },
  });

  return { listing, isOwner: listing?.userId === finalUserId };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const { listing, isOwner } = await getListing(id);

  if (!listing || !isOwner) {
    notFound();
  }

  const parsedListing = {
    ...listing,
    price: listing.price.toString(),
    brokerFee: listing.brokerFee.toString(),
  };

  return <EditListingComponent listing={parsedListing} />;
}
