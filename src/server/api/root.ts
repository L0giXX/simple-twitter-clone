import { postRouter } from "~/server/api/routers/posts";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  posts: postRouter,
});

export type AppRouter = typeof appRouter;
