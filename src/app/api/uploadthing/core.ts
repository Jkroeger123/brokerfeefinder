import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getOrCreateUser } from "~/server/user";

const f = createUploadthing();

export const ourFileRouter = {
  listingImage: f({
    image: {
      maxFileSize: "32MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      const user = await getOrCreateUser();
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
