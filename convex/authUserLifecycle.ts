import type { GenericId } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type {
  AuthProviderMaterializedConfig,
  ConvexAuthConfig,
} from "@convex-dev/auth/server";

type CreateOrUpdateUserCallbackArgs = {
  existingUserId: GenericId<"users"> | null;
  type: "oauth" | "credentials" | "email" | "phone" | "verification";
  provider: AuthProviderMaterializedConfig;
  profile: Record<string, unknown> & {
    email?: string;
    phone?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  shouldLinkViaEmail?: boolean;
  shouldLinkViaPhone?: boolean;
};

async function uniqueUserWithVerifiedEmail(ctx: MutationCtx, email: string) {
  const users = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .filter((q) => q.neq(q.field("emailVerificationTime"), undefined))
    .take(2);
  return users.length === 1 ? users[0] : null;
}

async function uniqueUserWithVerifiedPhone(ctx: MutationCtx, phone: string) {
  const users = await ctx.db
    .query("users")
    .withIndex("phone", (q) => q.eq("phone", phone))
    .filter((q) => q.neq(q.field("phoneVerificationTime"), undefined))
    .take(2);
  return users.length === 1 ? users[0] : null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function anotherUserHasEmail(
  ctx: MutationCtx,
  email: string,
): Promise<boolean> {
  const n = normalizeEmail(email);
  if (!n) return false;
  const users = await ctx.db.query("users").collect();
  return users.some((u) => {
    const ue = u.email;
    return typeof ue === "string" && normalizeEmail(ue) === n;
  });
}

/** Resolve user id from linked account and/or verified-email/phone linking (Convex Auth default rules). */
async function resolveUserIdFromAccountAndProfile(
  ctx: MutationCtx,
  existingUserId: GenericId<"users"> | null,
  profile: { email?: string; phone?: string },
  shouldLinkViaEmail: boolean,
  shouldLinkViaPhone: boolean,
): Promise<GenericId<"users"> | null> {
  let userId = existingUserId;
  if (existingUserId === null) {
    const existingUserWithVerifiedEmailId =
      typeof profile.email === "string" && shouldLinkViaEmail
        ? (await uniqueUserWithVerifiedEmail(ctx, profile.email))?._id ?? null
        : null;

    const existingUserWithVerifiedPhoneId =
      typeof profile.phone === "string" && shouldLinkViaPhone
        ? (await uniqueUserWithVerifiedPhone(ctx, profile.phone))?._id ?? null
        : null;

    if (
      existingUserWithVerifiedEmailId !== null &&
      existingUserWithVerifiedPhoneId !== null
    ) {
      userId = null;
    } else if (existingUserWithVerifiedEmailId !== null) {
      userId = existingUserWithVerifiedEmailId;
    } else if (existingUserWithVerifiedPhoneId !== null) {
      userId = existingUserWithVerifiedPhoneId;
    } else {
      userId = null;
    }
  }
  return userId;
}

/**
 * Mirrors Convex Auth default user creation/linking, but blocks password (credentials)
 * sign-up when any user already has the same e-mail (case-insensitive), e.g. after
 * signing up with Google first.
 */
export async function createOrUpdateUserWithEmailDedup(
  ctx: MutationCtx,
  args: CreateOrUpdateUserCallbackArgs,
  callbacks: NonNullable<ConvexAuthConfig["callbacks"]>,
): Promise<GenericId<"users">> {
  const existingUserId = args.existingUserId ?? null;

  const {
    provider,
    profile: {
      emailVerified: profileEmailVerified,
      phoneVerified: profilePhoneVerified,
      ...profile
    },
  } = args;
  const emailVerified =
    profileEmailVerified ??
    ((provider.type === "oauth" || provider.type === "oidc") &&
      provider.allowDangerousEmailAccountLinking !== false);
  const phoneVerified = profilePhoneVerified ?? false;
  const shouldLinkViaEmail =
    args.shouldLinkViaEmail || emailVerified || provider.type === "email";
  const shouldLinkViaPhone =
    args.shouldLinkViaPhone || phoneVerified || provider.type === "phone";

  let userId = await resolveUserIdFromAccountAndProfile(
    ctx,
    existingUserId,
    profile,
    shouldLinkViaEmail,
    shouldLinkViaPhone,
  );

  // Orphaned authAccounts row: user was deleted but Google account still references old userId.
  if (userId !== null && (await ctx.db.get(userId)) === null) {
    userId = await resolveUserIdFromAccountAndProfile(
      ctx,
      null,
      profile,
      shouldLinkViaEmail,
      shouldLinkViaPhone,
    );
  }

  const userData = {
    ...(emailVerified ? { emailVerificationTime: Date.now() } : null),
    ...(phoneVerified ? { phoneVerificationTime: Date.now() } : null),
    ...profile,
  };
  const existingOrLinkedUserId = userId;
  if (userId !== null) {
    try {
      await ctx.db.patch(userId, userData);
    } catch (error) {
      throw new Error(
        `Could not update user document with ID \`${userId}\`, ` +
          `either the user has been deleted but their account has not, ` +
          `or the profile data doesn't match the \`users\` table schema: ` +
          `${(error as Error).message}`,
      );
    }
  } else {
    if (
      args.type === "credentials" &&
      typeof profile.email === "string" &&
      (await anotherUserHasEmail(ctx, profile.email))
    ) {
      throw new Error(
        "Konto z tym adresem e-mail już istnieje. Zaloguj się lub użyj resetu hasła.",
      );
    }
    userId = await ctx.db.insert("users", userData);
  }
  const afterUserCreatedOrUpdated = callbacks.afterUserCreatedOrUpdated;
  if (afterUserCreatedOrUpdated !== undefined) {
    await afterUserCreatedOrUpdated(ctx, {
      userId,
      existingUserId: existingOrLinkedUserId,
      type: args.type,
      provider: args.provider,
      profile: args.profile,
    });
  }
  return userId;
}
