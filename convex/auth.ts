import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { auth, signOut, store, isAuthenticated } from "./authImpl";

export { auth, signOut, store, isAuthenticated };

type SignInResult =
  | { redirect?: string; verifier?: string }
  | { tokens?: { token: string; refreshToken: string } | null }
  | { started?: boolean };

const signInArgs = {
  provider: v.optional(v.string()),
  params: v.optional(v.any()),
  verifier: v.optional(v.string()),
  refreshToken: v.optional(v.string()),
  calledBy: v.optional(v.string()),
};

export const signIn = action({
  args: signInArgs,
  handler: async (ctx, args): Promise<SignInResult> => {
    try {
      return await ctx.runAction(api.authImpl.signIn, args);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.toLowerCase().includes("already exists")
      ) {
        return { tokens: null };
      }
      throw e;
    }
  },
});
