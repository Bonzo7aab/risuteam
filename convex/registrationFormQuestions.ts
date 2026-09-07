import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authHelpers";

const questionTypeValidator = v.union(
  v.literal("short_text"),
  v.literal("long_text"),
  v.literal("checkbox"),
  v.literal("single_choice")
);

export const listByCamp = query({
  args: { campId: v.id("camps") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const list = await ctx.db
      .query("registrationFormQuestions")
      .withIndex("by_camp", (q) => q.eq("campId", args.campId))
      .collect();
    return list.sort((a, b) => a.order - b.order);
  },
});

export const listByNocowanka = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const list = await ctx.db
      .query("registrationFormQuestions")
      .withIndex("by_nocowanka", (q) => q.eq("nocowankaSlug", args.slug))
      .collect();
    return list.sort((a, b) => a.order - b.order);
  },
});

export const listByCampPublic = query({
  args: { campId: v.id("camps") },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("registrationFormQuestions")
      .withIndex("by_camp", (q) => q.eq("campId", args.campId))
      .collect();
    return list.sort((a, b) => a.order - b.order);
  },
});

export const listByNocowankaPublic = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("registrationFormQuestions")
      .withIndex("by_nocowanka", (q) => q.eq("nocowankaSlug", args.slug))
      .collect();
    return list.sort((a, b) => a.order - b.order);
  },
});

export const add = mutation({
  args: {
    campId: v.optional(v.id("camps")),
    nocowankaSlug: v.optional(v.string()),
    label: v.string(),
    type: questionTypeValidator,
    required: v.boolean(),
    options: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const hasCamp = args.campId !== undefined && args.campId !== null;
    const hasNocowanka = args.nocowankaSlug !== undefined && args.nocowankaSlug !== "";
    if (hasCamp === hasNocowanka) {
      throw new Error("Podaj dokładnie jedno: campId lub nocowankaSlug");
    }
    if (args.type === "single_choice" && (!args.options || args.options.length === 0)) {
      throw new Error("Pytanie single_choice wymaga opcji");
    }

    const existing = hasCamp
      ? await ctx.db
          .query("registrationFormQuestions")
          .withIndex("by_camp", (q) => q.eq("campId", args.campId!))
          .collect()
      : await ctx.db
          .query("registrationFormQuestions")
          .withIndex("by_nocowanka", (q) => q.eq("nocowankaSlug", args.nocowankaSlug!))
          .collect();
    const maxOrder = existing.length === 0 ? 0 : Math.max(...existing.map((q) => q.order));
    return await ctx.db.insert("registrationFormQuestions", {
      campId: args.campId,
      nocowankaSlug: args.nocowankaSlug,
      order: maxOrder + 1,
      label: args.label.trim(),
      type: args.type,
      required: args.required,
      options: args.type === "single_choice" ? args.options : undefined,
    });
  },
});

export const update = mutation({
  args: {
    questionId: v.id("registrationFormQuestions"),
    label: v.optional(v.string()),
    type: v.optional(questionTypeValidator),
    required: v.optional(v.boolean()),
    options: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Nie znaleziono pytania");
    const updates: Record<string, unknown> = {};
    if (args.label !== undefined) updates.label = args.label.trim();
    if (args.type !== undefined) updates.type = args.type;
    if (args.required !== undefined) updates.required = args.required;
    if (args.options !== undefined) updates.options = args.options;
    if (args.order !== undefined) updates.order = args.order;
    if (Object.keys(updates).length === 0) return args.questionId;
    await ctx.db.patch(args.questionId, updates as { label?: string; type?: "short_text" | "long_text" | "checkbox" | "single_choice"; required?: boolean; options?: string[]; order?: number });
    return args.questionId;
  },
});

export const remove = mutation({
  args: { questionId: v.id("registrationFormQuestions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Nie znaleziono pytania");
    await ctx.db.delete(args.questionId);
    return undefined;
  },
});

export const reorder = mutation({
  args: {
    campId: v.optional(v.id("camps")),
    nocowankaSlug: v.optional(v.string()),
    orderedIds: v.array(v.id("registrationFormQuestions")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const hasCamp = args.campId !== undefined && args.campId !== null;
    const hasNocowanka = args.nocowankaSlug !== undefined && args.nocowankaSlug !== "";
    if (hasCamp === hasNocowanka) {
      throw new Error("Podaj dokładnie jedno: campId lub nocowankaSlug");
    }
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
    return undefined;
  },
});
