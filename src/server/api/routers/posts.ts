import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(({ input, ctx }) => {
      const post = ctx.prisma.post.create({
        data: {
          content: input.content,
          author: { connect: { id: ctx.session!.user.id } },
        },
      });
      return post;
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
});
