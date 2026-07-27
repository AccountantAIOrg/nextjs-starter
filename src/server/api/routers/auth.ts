import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createDeletedSessionCookie,
  createSessionCookie,
  SESSION_COOKIE,
} from "../cookies";
import { createTRPCRouter, publicProcedure } from "../trpc";

const signInInput = z.object({
  email: z.string().trim().min(1, "Email is required."),
  password: z.string().min(1, "Password is required."),
});

const signUpInput = signInInput.extend({
  name: z.string().trim().min(1, "Name is required."),
});

function toTRPCError(error: unknown, fallbackMessage: string) {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : fallbackMessage,
    cause: error,
  });
}

export const authRouter = createTRPCRouter({
  session: publicProcedure.query(async ({ ctx }) => {
    return ctx.getSession();
  }),

  signIn: publicProcedure.input(signInInput).mutation(async ({ ctx, input }) => {
    try {
      const auth = await ctx.getAuth();
      const result = await auth.signInEmail(input);
      const session = await auth.getSession(result.token);

      ctx.resHeaders.append(
        "Set-Cookie",
        createSessionCookie(result.token, session.session.expiresAt)
      );

      return { session };
    } catch (error) {
      throw toTRPCError(error, "Unable to sign in.");
    }
  }),

  signUp: publicProcedure.input(signUpInput).mutation(async ({ ctx, input }) => {
    try {
      const auth = await ctx.getAuth();
      const result = await auth.signUpEmail(input);
      const session = await auth.getSession(result.token);

      ctx.resHeaders.append(
        "Set-Cookie",
        createSessionCookie(result.token, session.session.expiresAt)
      );

      return { session };
    } catch (error) {
      throw toTRPCError(error, "Unable to sign up.");
    }
  }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    try {
      if (ctx.token) {
        const auth = await ctx.getAuth();
        await auth.signOut(ctx.token);
      }

      ctx.resHeaders.append("Set-Cookie", createDeletedSessionCookie());

      return { ok: true };
    } catch (error) {
      ctx.resHeaders.append("Set-Cookie", createDeletedSessionCookie());

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Unable to sign out.",
        cause: error,
      });
    }
  }),
});

export { SESSION_COOKIE };
