import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import type { Id } from "./_generated/dataModel";
import { PUBLIC_GALLERY_IMAGE_MANIFEST } from "./galleryPublicManifest";

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function assertUrlLike(url: string, fieldName: string): void {
  const s = url.trim();
  if (!s) throw new Error(`${fieldName} jest wymagany.`);
  // Minimal validation, avoid rejecting valid deep links.
  if (!/^https?:\/\//i.test(s)) {
    throw new Error(`${fieldName} musi zaczynać się od http:// lub https://`);
  }
}

async function nextOrderForCategory(
  ctx: QueryCtx | MutationCtx,
  categoryId: Id<"galleryCategories"> | undefined
): Promise<number> {
  // If categoryId is unset, avoid relying on querying optional index values.
  if (!categoryId) {
    const items = await ctx.db.query("galleryItems").collect();
    const max = items.reduce((m, i) => (i.order > m ? i.order : m), 0);
    return max + 1;
  }
  const last = await ctx.db
    .query("galleryItems")
    .withIndex("by_category_order", (q) => q.eq("categoryId", categoryId))
    .order("desc")
    .first();
  return (last?.order ?? 0) + 1;
}

export const listCategoriesPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("galleryCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()
      .then((cats) => cats.sort((a, b) => a.order - b.order));
  },
});

export const listGalleryPublic = query({
  args: {
    categorySlug: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 200, 500));

    let categoryId: Id<"galleryCategories"> | undefined;
    if (args.categorySlug) {
      const slug = args.categorySlug.trim();
      if (slug) {
        const cat = await ctx.db
          .query("galleryCategories")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
        if (!cat || !cat.isActive) return [];
        categoryId = cat._id;
      }
    }

    let items;
    if (categoryId) {
      // Use index for category + order, then filter published (no composite index available).
      items = await ctx.db
        .query("galleryItems")
        .withIndex("by_category_order", (q) => q.eq("categoryId", categoryId))
        .collect();
      items = items.filter((i) => i.isPublished);
      items.sort((a, b) => a.order - b.order);
      return items.slice(0, limit);
    }

    items = await ctx.db
      .query("galleryItems")
      .withIndex("by_published_order", (q) => q.eq("isPublished", true))
      .collect();
    items.sort((a, b) => a.order - b.order);
    return items.slice(0, limit);
  },
});

export const listCategoriesForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const cats = await ctx.db.query("galleryCategories").collect();
    return cats.sort((a, b) => a.order - b.order);
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Nazwa kategorii jest wymagana.");
    const slug = (args.slug?.trim() || slugify(name)).trim();
    if (!slug) throw new Error("Slug jest wymagany.");
    const existing = await ctx.db
      .query("galleryCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("Kategoria z tym slug już istnieje.");

    const last = await ctx.db
      .query("galleryCategories")
      .withIndex("by_order")
      .order("desc")
      .first();
    const nextOrder = args.order ?? (last?.order ?? 0) + 1;

    return await ctx.db.insert("galleryCategories", {
      name,
      slug,
      order: nextOrder,
      isActive: args.isActive ?? true,
    });
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("galleryCategories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("galleryCategories", args.id);
    if (!existing) throw new Error("Nie znaleziono kategorii.");
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Nazwa kategorii jest wymagana.");
      updates.name = name;
    }
    if (args.slug !== undefined) {
      const slug = args.slug.trim();
      if (!slug) throw new Error("Slug jest wymagany.");
      const other = await ctx.db
        .query("galleryCategories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (other && other._id !== args.id) throw new Error("Kategoria z tym slug już istnieje.");
      updates.slug = slug;
    }
    if (args.order !== undefined) updates.order = args.order;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (Object.keys(updates).length > 0) await ctx.db.patch(args.id, updates);
  },
});

export const removeCategory = mutation({
  args: { id: v.id("galleryCategories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const used = await ctx.db
      .query("galleryItems")
      .withIndex("by_category_order", (q) => q.eq("categoryId", args.id))
      .first();
    if (used) throw new Error("Nie można usunąć kategorii — jest używana przez elementy galerii.");
    await ctx.db.delete(args.id);
  },
});

export const listItemsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const items = await ctx.db.query("galleryItems").collect();
    return items.sort((a, b) => a.order - b.order);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const createImageItemFromUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    title: v.optional(v.string()),
    categoryId: v.optional(v.id("galleryCategories")),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Nie można pobrać URL pliku.");
    const order = await nextOrderForCategory(ctx, args.categoryId);
    return await ctx.db.insert("galleryItems", {
      type: "image",
      title: args.title?.trim() || undefined,
      categoryId: args.categoryId,
      isPublished: args.isPublished ?? true,
      order,
      imageStorageId: args.storageId,
      imageUrl: url,
      createdBy: admin._id,
    });
  },
});

export const createVideoItem = mutation({
  args: {
    videoUrl: v.string(),
    title: v.optional(v.string()),
    categoryId: v.optional(v.id("galleryCategories")),
    thumbnailStorageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    assertUrlLike(args.videoUrl, "Link wideo");

    let thumbnailUrl: string | undefined;
    if (args.thumbnailStorageId) {
      const t = await ctx.storage.getUrl(args.thumbnailStorageId);
      if (!t) throw new Error("Nie można pobrać URL miniatury.");
      thumbnailUrl = t;
    }

    const order = await nextOrderForCategory(ctx, args.categoryId);
    return await ctx.db.insert("galleryItems", {
      type: "video",
      title: args.title?.trim() || undefined,
      categoryId: args.categoryId,
      isPublished: args.isPublished ?? true,
      order,
      videoUrl: args.videoUrl.trim(),
      thumbnailStorageId: args.thumbnailStorageId,
      thumbnailUrl,
      createdBy: admin._id,
    });
  },
});

export const updateItemMeta = mutation({
  args: {
    id: v.id("galleryItems"),
    title: v.optional(v.string()),
    categoryId: v.optional(v.id("galleryCategories")),
    isPublished: v.optional(v.boolean()),
    order: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("galleryItems", args.id);
    if (!existing) throw new Error("Nie znaleziono elementu.");
    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title.trim() || undefined;
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.order !== undefined) updates.order = args.order;
    if (args.videoUrl !== undefined) {
      if (existing.type !== "video") throw new Error("Tylko elementy wideo mają link wideo.");
      assertUrlLike(args.videoUrl, "Link wideo");
      updates.videoUrl = args.videoUrl.trim();
    }
    if (Object.keys(updates).length > 0) await ctx.db.patch(args.id, updates);
  },
});

export const reorderItems = mutation({
  args: {
    orderedIds: v.array(v.id("galleryItems")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Order 1..N in the passed order.
    let n = 1;
    for (const id of args.orderedIds) {
      await ctx.db.patch(id, { order: n });
      n += 1;
    }
  },
});

export const removeItem = mutation({
  args: { id: v.id("galleryItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Note: Convex storage deletion API availability varies by version.
    // We delete the document; storage cleanup can be added once confirmed.
    await ctx.db.delete(args.id);
  },
});

/**
 * Seeds gallery with the existing mock gallery from `app/galeria/page.tsx`.
 *
 * This stores the mock URLs directly in `imageUrl`/`thumbnailUrl`/`videoUrl`
 * (does not download/upload binaries into Convex storage).
 * Use this to quickly populate the gallery UI.
 */
export const seedMockGallery = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const existingCount = await ctx.db.query("galleryItems").collect();
    if (existingCount.length > 0 && !(args.force ?? false)) {
      throw new Error("Galeria już została zaszczepiona. Użyj force=true, aby nadpisać.");
    }

    if (args.force ?? false) {
      for (const it of existingCount) {
        await ctx.db.delete(it._id);
      }
    }

    const mockCategories = [
      { name: "Judo", slug: slugify("Judo"), order: 1 },
      { name: "Karate", slug: slugify("Karate"), order: 2 },
      { name: "Gimnastyka", slug: slugify("Gimnastyka"), order: 3 },
    ] as const;

    const categoryBySlug = new Map<string, Id<"galleryCategories">>();
    for (const cat of mockCategories) {
      const existing = await ctx.db
        .query("galleryCategories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .first();
      const row =
        existing ??
        (await ctx.db.insert("galleryCategories", {
          name: cat.name,
          slug: cat.slug,
          order: cat.order,
          isActive: true,
        }));
      const rowId: Id<"galleryCategories"> =
        typeof row === "string" ? row : row._id;
      categoryBySlug.set(cat.slug, rowId);
    }

    const mockItems = [
      {
        src: "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Judo",
        title: "Trening Judo",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Gimnastyka",
        title: "Gimnastyka dzieci",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Karate",
        title: "Karate kids",
        isVideo: true,
      },
      {
        src: "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=400",
        category: "Judo",
        title: "Rzuty i technika",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Gimnastyka",
        title: "Maluszki na macie",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Karate",
        title: "Koncentracja",
        isVideo: true,
      },
      {
        src: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Judo",
        title: "Pasy i pasowanie",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Gimnastyka",
        title: "Elastyczność",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600",
        category: "Karate",
        title: "Kihon",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "Judo",
        title: "Trening w grupie",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "Gimnastyka",
        title: "Rozciąganie",
        isVideo: false,
      },
      {
        src: "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "Karate",
        title: "Kata",
        isVideo: false,
      },
    ];

    let created = 0;
    for (const it of mockItems) {
      const slug = slugify(it.category);
      const categoryId = categoryBySlug.get(slug);
      const order = await nextOrderForCategory(ctx, categoryId);
      if (!categoryId) continue;

      if (it.isVideo) {
        await ctx.db.insert("galleryItems", {
          type: "video",
          title: it.title,
          categoryId,
          isPublished: true,
          order,
          videoUrl: it.src, // mock fallback; admin UI can replace with real videoUrl
          thumbnailUrl: it.src,
          createdBy: admin._id,
        });
      } else {
        await ctx.db.insert("galleryItems", {
          type: "image",
          title: it.title,
          categoryId,
          isPublished: true,
          order,
          imageUrl: it.src,
          createdBy: admin._id,
        });
      }
      created += 1;
    }

    return { created };
  },
});

/**
 * Inserts gallery image rows for each path in `galleryPublicManifest.ts` that is not
 * already present (matched by `imageUrl`). Images are served from `public/images` via `/images/...`.
 * Idempotent — safe to run after adding new files + manifest entries.
 *
 * Auth (either works):
 * - Logged-in **admin** in the app / Dashboard identity (when available), or
 * - Set env `GALLERY_SYNC_SECRET` on the deployment, then call with `{ "secret": "<same value>" }`
 *   (CLI / Dashboard run have no user session, so this is the usual way to sync locally).
 */
export const syncPublicFolderGallery = mutation({
  args: { secret: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const envSecret = process.env.GALLERY_SYNC_SECRET?.trim() ?? "";
    const provided = args.secret?.trim() ?? "";
    const secretOk = envSecret.length > 0 && provided === envSecret;

    let createdBy: Id<"users"> | undefined;
    if (secretOk) {
      createdBy = undefined;
    } else {
      const admin = await requireAdmin(ctx);
      createdBy = admin._id;
    }

    const existing = await ctx.db.query("galleryItems").collect();
    const urls = new Set(
      existing
        .filter((i) => i.type === "image" && i.imageUrl)
        .map((i) => i.imageUrl!.trim())
    );

    let added = 0;
    let skipped = 0;
    for (const entry of PUBLIC_GALLERY_IMAGE_MANIFEST) {
      const url = entry.imageUrl.trim();
      if (urls.has(url)) {
        skipped += 1;
        continue;
      }
      const order = await nextOrderForCategory(ctx, undefined);
      await ctx.db.insert("galleryItems", {
        type: "image",
        title: entry.title,
        categoryId: undefined,
        isPublished: true,
        order,
        imageUrl: url,
        createdBy,
      });
      urls.add(url);
      added += 1;
    }

    return { added, skipped, total: PUBLIC_GALLERY_IMAGE_MANIFEST.length };
  },
});

