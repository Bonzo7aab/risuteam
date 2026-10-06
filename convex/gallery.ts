import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";
import type { Doc, Id } from "./_generated/dataModel";
import { PUBLIC_GALLERY_IMAGE_MANIFEST } from "./galleryPublicManifest";

export const UNCATEGORIZED_FOLDER_SLUG = "pozostale";
export const UNCATEGORIZED_FOLDER_NAME = "Pozostałe";

const albumSummaryValidator = v.object({
  _id: v.union(v.id("galleryCategories"), v.null()),
  name: v.string(),
  slug: v.string(),
  order: v.number(),
  isActive: v.boolean(),
  imageCount: v.number(),
  videoCount: v.number(),
  publishedCount: v.number(),
  coverUrls: v.array(v.string()),
  isUncategorized: v.boolean(),
});

const galleryItemPublicValidator = v.object({
  _id: v.id("galleryItems"),
  type: v.union(v.literal("image"), v.literal("video")),
  title: v.optional(v.string()),
  categoryId: v.optional(v.id("galleryCategories")),
  imageUrl: v.optional(v.string()),
  thumbnailUrl: v.optional(v.string()),
  videoUrl: v.optional(v.string()),
  order: v.number(),
});

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

function itemCoverUrl(item: Doc<"galleryItems">): string | null {
  if (item.type === "image") return item.imageUrl?.trim() || null;
  return item.thumbnailUrl?.trim() || item.imageUrl?.trim() || null;
}

function coverUrlsFromItems(items: Doc<"galleryItems">[], limit = 4): string[] {
  const urls: string[] = [];
  const sorted = [...items].sort((a, b) => a.order - b.order);
  for (const item of sorted) {
    const url = itemCoverUrl(item);
    if (!url) continue;
    urls.push(url);
    if (urls.length >= limit) break;
  }
  return urls;
}

function summarizeAlbum(
  items: Doc<"galleryItems">[],
  folder: {
    _id: Id<"galleryCategories"> | null;
    name: string;
    slug: string;
    order: number;
    isActive: boolean;
    isUncategorized: boolean;
  },
  publishedOnly: boolean,
) {
  const visible = publishedOnly ? items.filter((item) => item.isPublished) : items;
  return {
    _id: folder._id,
    name: folder.name,
    slug: folder.slug,
    order: folder.order,
    isActive: folder.isActive,
    imageCount: visible.filter((item) => item.type === "image").length,
    videoCount: visible.filter((item) => item.type === "video").length,
    publishedCount: items.filter((item) => item.isPublished).length,
    coverUrls: coverUrlsFromItems(
      publishedOnly ? visible : [...visible].sort((a, b) => {
        if (a.isPublished !== b.isPublished) return a.isPublished ? -1 : 1;
        return a.order - b.order;
      }),
    ),
    isUncategorized: folder.isUncategorized,
  };
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

function toPublicItem(item: Doc<"galleryItems">) {
  return {
    _id: item._id,
    type: item.type,
    title: item.title,
    categoryId: item.categoryId,
    imageUrl: item.imageUrl,
    thumbnailUrl: item.thumbnailUrl,
    videoUrl: item.videoUrl,
    order: item.order,
  };
}

export const listPublicAlbums = query({
  args: {},
  returns: v.array(albumSummaryValidator),
  handler: async (ctx) => {
    const cats = await ctx.db
      .query("galleryCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    cats.sort((a, b) => a.order - b.order);
    const items = await ctx.db
      .query("galleryItems")
      .withIndex("by_published_order", (q) => q.eq("isPublished", true))
      .collect();

    const byCategory = new Map<string, Doc<"galleryItems">[]>();
    const uncategorized: Doc<"galleryItems">[] = [];
    for (const item of items) {
      if (!item.categoryId) {
        uncategorized.push(item);
        continue;
      }
      const key = item.categoryId;
      const list = byCategory.get(key) ?? [];
      list.push(item);
      byCategory.set(key, list);
    }

    const albums = cats
      .map((cat) =>
        summarizeAlbum(byCategory.get(cat._id) ?? [], {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          order: cat.order,
          isActive: cat.isActive,
          isUncategorized: false,
        }, true),
      )
      .filter((album) => album.publishedCount > 0);

    if (uncategorized.length > 0) {
      albums.push(
        summarizeAlbum(uncategorized, {
          _id: null,
          name: UNCATEGORIZED_FOLDER_NAME,
          slug: UNCATEGORIZED_FOLDER_SLUG,
          order: Number.MAX_SAFE_INTEGER,
          isActive: true,
          isUncategorized: true,
        }, true),
      );
    }
    return albums;
  },
});

export const listAdminAlbums = query({
  args: {},
  returns: v.array(albumSummaryValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const cats = await ctx.db.query("galleryCategories").collect();
    cats.sort((a, b) => a.order - b.order);
    const items = await ctx.db.query("galleryItems").collect();

    const byCategory = new Map<string, Doc<"galleryItems">[]>();
    const uncategorized: Doc<"galleryItems">[] = [];
    for (const item of items) {
      if (!item.categoryId) {
        uncategorized.push(item);
        continue;
      }
      const key = item.categoryId;
      const list = byCategory.get(key) ?? [];
      list.push(item);
      byCategory.set(key, list);
    }

    const albums = cats.map((cat) =>
      summarizeAlbum(byCategory.get(cat._id) ?? [], {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        isActive: cat.isActive,
        isUncategorized: false,
      }, false),
    );
    albums.push(
      summarizeAlbum(uncategorized, {
        _id: null,
        name: UNCATEGORIZED_FOLDER_NAME,
        slug: UNCATEGORIZED_FOLDER_SLUG,
        order: Number.MAX_SAFE_INTEGER,
        isActive: true,
        isUncategorized: true,
      }, false),
    );
    return albums;
  },
});

export const getPublicAlbum = query({
  args: { slug: v.string() },
  returns: v.union(albumSummaryValidator, v.null()),
  handler: async (ctx, args) => {
    const slug = args.slug.trim();
    if (!slug) return null;
    const items = await ctx.db
      .query("galleryItems")
      .withIndex("by_published_order", (q) => q.eq("isPublished", true))
      .collect();

    if (slug === UNCATEGORIZED_FOLDER_SLUG) {
      const uncategorized = items.filter((item) => !item.categoryId);
      if (uncategorized.length === 0) return null;
      return summarizeAlbum(uncategorized, {
        _id: null,
        name: UNCATEGORIZED_FOLDER_NAME,
        slug: UNCATEGORIZED_FOLDER_SLUG,
        order: Number.MAX_SAFE_INTEGER,
        isActive: true,
        isUncategorized: true,
      }, true);
    }

    const cat = await ctx.db
      .query("galleryCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!cat || !cat.isActive) return null;
    const inFolder = items.filter((item) => item.categoryId === cat._id);
    if (inFolder.length === 0) return null;
    return summarizeAlbum(inFolder, {
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      order: cat.order,
      isActive: cat.isActive,
      isUncategorized: false,
    }, true);
  },
});

export const getAdminAlbum = query({
  args: { slug: v.string() },
  returns: v.union(albumSummaryValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const slug = args.slug.trim();
    if (!slug) return null;
    const items = await ctx.db.query("galleryItems").collect();

    if (slug === UNCATEGORIZED_FOLDER_SLUG) {
      const uncategorized = items.filter((item) => !item.categoryId);
      return summarizeAlbum(uncategorized, {
        _id: null,
        name: UNCATEGORIZED_FOLDER_NAME,
        slug: UNCATEGORIZED_FOLDER_SLUG,
        order: Number.MAX_SAFE_INTEGER,
        isActive: true,
        isUncategorized: true,
      }, false);
    }

    const cat = await ctx.db
      .query("galleryCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!cat) return null;
    const inFolder = items.filter((item) => item.categoryId === cat._id);
    return summarizeAlbum(inFolder, {
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      order: cat.order,
      isActive: cat.isActive,
      isUncategorized: false,
    }, false);
  },
});

export const listGalleryPublic = query({
  args: {
    categorySlug: v.optional(v.string()),
    uncategorizedOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  returns: v.array(galleryItemPublicValidator),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 200, 500));

    if (args.uncategorizedOnly) {
      const items = await ctx.db
        .query("galleryItems")
        .withIndex("by_published_order", (q) => q.eq("isPublished", true))
        .collect();
      return items
        .filter((item) => !item.categoryId)
        .sort((a, b) => a.order - b.order)
        .slice(0, limit)
        .map(toPublicItem);
    }

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

    if (categoryId) {
      const items = await ctx.db
        .query("galleryItems")
        .withIndex("by_category_order", (q) => q.eq("categoryId", categoryId))
        .collect();
      return items
        .filter((item) => item.isPublished)
        .sort((a, b) => a.order - b.order)
        .slice(0, limit)
        .map(toPublicItem);
    }

    const items = await ctx.db
      .query("galleryItems")
      .withIndex("by_published_order", (q) => q.eq("isPublished", true))
      .collect();
    return items
      .sort((a, b) => a.order - b.order)
      .slice(0, limit)
      .map(toPublicItem);
  },
});

export const listCategoriesForAdmin = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("galleryCategories"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      order: v.number(),
      isActive: v.boolean(),
    }),
  ),
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
  returns: v.object({
    id: v.id("galleryCategories"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Nazwa folderu jest wymagana.");
    const slug = (args.slug?.trim() || slugify(name)).trim();
    if (!slug) throw new Error("Slug jest wymagany.");
    if (slug === UNCATEGORIZED_FOLDER_SLUG) {
      throw new Error("Ta nazwa folderu jest zarezerwowana.");
    }
    const existing = await ctx.db
      .query("galleryCategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("Folder o tej nazwie już istnieje.");

    const last = await ctx.db
      .query("galleryCategories")
      .withIndex("by_order")
      .order("desc")
      .first();
    const nextOrder = args.order ?? (last?.order ?? 0) + 1;

    const id = await ctx.db.insert("galleryCategories", {
      name,
      slug,
      order: nextOrder,
      isActive: args.isActive ?? true,
    });
    return { id, slug };
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
    if (!existing) throw new Error("Nie znaleziono folderu.");
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Nazwa folderu jest wymagana.");
      updates.name = name;
    }
    if (args.slug !== undefined) {
      const slug = args.slug.trim();
      if (!slug) throw new Error("Slug jest wymagany.");
      if (slug === UNCATEGORIZED_FOLDER_SLUG) {
        throw new Error("Ta nazwa folderu jest zarezerwowana.");
      }
      const other = await ctx.db
        .query("galleryCategories")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (other && other._id !== args.id) throw new Error("Folder o tej nazwie już istnieje.");
      updates.slug = slug;
    }
    if (args.order !== undefined) updates.order = args.order;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (Object.keys(updates).length > 0) await ctx.db.patch(args.id, updates);
  },
});

export const removeCategory = mutation({
  args: {
    id: v.id("galleryCategories"),
    moveItemsToUncategorized: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const used = await ctx.db
      .query("galleryItems")
      .withIndex("by_category_order", (q) => q.eq("categoryId", args.id))
      .collect();
    if (used.length > 0 && !args.moveItemsToUncategorized) {
      throw new Error("Folder zawiera zdjęcia. Przenieś je lub usuń przed skasowaniem folderu.");
    }
    for (const item of used) {
      await ctx.db.patch(item._id, { categoryId: undefined });
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const listItemsForAdmin = query({
  args: {
    categoryId: v.optional(v.id("galleryCategories")),
    uncategorizedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.uncategorizedOnly) {
      const items = await ctx.db.query("galleryItems").collect();
      return items.filter((item) => !item.categoryId).sort((a, b) => a.order - b.order);
    }
    if (args.categoryId) {
      const items = await ctx.db
        .query("galleryItems")
        .withIndex("by_category_order", (q) => q.eq("categoryId", args.categoryId!))
        .collect();
      return items.sort((a, b) => a.order - b.order);
    }
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
    categoryId: v.optional(v.union(v.id("galleryCategories"), v.null())),
    isPublished: v.optional(v.boolean()),
    order: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("galleryItems", args.id);
    if (!existing) throw new Error("Nie znaleziono elementu.");
    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title.trim() || undefined;
    if (args.categoryId !== undefined) {
      const nextCategoryId = args.categoryId === null ? undefined : args.categoryId;
      updates.categoryId = nextCategoryId;
      if (nextCategoryId !== existing.categoryId) {
        updates.order = await nextOrderForCategory(ctx, nextCategoryId);
      }
    }
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.order !== undefined) updates.order = args.order;
    if (args.videoUrl !== undefined) {
      if (existing.type !== "video") throw new Error("Tylko elementy wideo mają link wideo.");
      assertUrlLike(args.videoUrl, "Link wideo");
      updates.videoUrl = args.videoUrl.trim();
    }
    if (Object.keys(updates).length > 0) await ctx.db.patch(args.id, updates);
    return null;
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

