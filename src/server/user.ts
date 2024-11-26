"user server";

import { auth } from "@clerk/nextjs/server";
import { db as prisma } from "./db";

const MAX_RETRIES = 5;
const RETRY_DELAY = 100; // milliseconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getOrCreateUser(retryCount = 0) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  try {
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
      },
    });

    return user;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retry attempt ${retryCount + 1} for user ${userId}`);
      await sleep(RETRY_DELAY);
      return getOrCreateUser(retryCount + 1);
    }
    throw error;
  }
}
