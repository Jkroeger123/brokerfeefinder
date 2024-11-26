import { db as prisma } from "~/server/db";
import { ListingDetail } from "~/components/listing-detail";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

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
  params: { id: string };
}) {
  const { listing, isOwner } = await getListing(params.id);

  if (!listing) {
    notFound();
  }

  const parsedListing = {
    ...listing,
    price: listing.price.toString(),
    brokerFee: listing.brokerFee.toString(),
  };

  return <ListingDetail listing={parsedListing} isOwner={isOwner} />;
}
