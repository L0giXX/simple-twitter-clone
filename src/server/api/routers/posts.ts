import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import type { Post } from "@prisma/client";
import { prisma } from "~/server/db";

const addUserDataToPosts = async (posts: Post[]) => {
  const userIds = posts.map((post) => post.authorId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      username: true,
      image: true,
    },
  });

  return posts.map((post) => {
    const user = users.find((u) => u.id === post.authorId);
    return { ...post, user };
  });
};

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = ctx.prisma.post.create({
        data: {
          content: input.content,
          author: { connect: { id: ctx.session!.user.id } },
        },
      });
      return post;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    return addUserDataToPosts(posts);
  }),
  getCurrentImage: protectedProcedure.query(async ({ ctx }) => {
    const image = await ctx.prisma.user.findUnique({
      where: { id: ctx.session!.user.id },
      select: { image: true },
    });
    if (!image) {
      return null;
    }
    return image;
  }),
});
