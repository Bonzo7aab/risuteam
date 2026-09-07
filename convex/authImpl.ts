import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import {
  convexAuth,
  type ConvexAuthConfig,
} from "@convex-dev/auth/server";
import { BrevoPasswordReset } from "./BrevoPasswordReset";
import { createOrUpdateUserWithEmailDedup } from "./authUserLifecycle";

const authCallbacks: NonNullable<ConvexAuthConfig["callbacks"]> = {
  async createOrUpdateUser(ctx, args) {
    return createOrUpdateUserWithEmailDedup(ctx, args, authCallbacks);
  },
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: BrevoPasswordReset(),
      profile: (params) => {
        const email = params.email;
        if (typeof email !== "string") throw new Error("Missing email");
        const name = typeof params.name === "string" ? params.name : "";
        return { email: email.trim().toLowerCase(), name };
      },
    }),
    Google,
  ],
  callbacks: authCallbacks,
});
