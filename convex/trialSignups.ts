import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createTrialSignup = mutation({
  args: {
    childName: v.string(),
    childAge: v.optional(v.string()),
    discipline: v.string(),
    parentName: v.string(),
    parentEmail: v.string(),
    parentPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.childName || !args.discipline || !args.parentName || !args.parentEmail) {
      throw new Error("Wypełnij wymagane pola");
    }
    return await ctx.db.insert("trialSignups", {
      childName: args.childName,
      childAge: args.childAge,
      discipline: args.discipline,
      parentName: args.parentName,
      parentEmail: args.parentEmail,
      parentPhone: args.parentPhone,
      notes: args.notes,
      status: "new",
    });
  },
});
