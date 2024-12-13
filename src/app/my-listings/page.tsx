import { db as prisma } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MyListingsComponent } from "~/components/my-listings";

async function getUserListings() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const listings = await prisma.listing.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return listings.map((listing) => ({
    ...listing,
    price: listing.price.toString(),
    brokerFee: listing.brokerFee.toString(),
  }));
}

export default async function MyListingsPage() {
  const listings = await getUserListings();
  return <MyListingsComponent listings={listings} />;
}
