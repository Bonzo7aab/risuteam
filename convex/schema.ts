import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()),
    onboardingCompletedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  classes: defineTable({
    name: v.string(),
    discipline: v.string(),
    description: v.optional(v.string()),
    locationId: v.id("locations"),
    coachId: v.id("coaches"),
    ageGroup: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_discipline", ["discipline"])
    .index("by_location", ["locationId"])
    .index("by_coach", ["coachId"])
    .index("by_active", ["isActive"]),

  timeSlots: defineTable({
    classId: v.id("classes"),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  })
    .index("by_class", ["classId"])
    .index("by_day", ["dayOfWeek"])
    .index("by_class_day", ["classId", "dayOfWeek"]),

  coaches: defineTable({
    name: v.string(),
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    disciplines: v.array(v.string()),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"]),

  locations: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    postalCode: v.optional(v.string()),
    mapsUrl: v.optional(v.string()),
  }).index("by_city", ["city"]),

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    locationId: v.optional(v.id("locations")),
    coachId: v.optional(v.id("coaches")),
    eventType: v.string(),
    isPublic: v.boolean(),
  })
    .index("by_start_time", ["startTime"])
    .index("by_type", ["eventType"]),

  camps: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    locationId: v.optional(v.id("locations")),
    maxParticipants: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.boolean(),
    isRegistrationOpen: v.optional(v.boolean()),
    category: v.optional(v.string()),
    ageGroup: v.optional(v.string()),
    heroImageUrl: v.optional(v.string()),
    galleryImageUrls: v.optional(v.array(v.string())),
    coachIds: v.optional(v.array(v.id("coaches"))),
    earlyBirdDiscountPercent: v.optional(v.number()),
    dailySchedule: v.optional(
      v.array(v.object({ time: v.string(), activity: v.string() }))
    ),
    scheduleByDay: v.optional(
      v.array(
        v.object({
          dayLabel: v.string(),
          slots: v.array(v.object({ time: v.string(), activity: v.string() })),
        })
      )
    ),
    includedItems: v.optional(v.array(v.string())),
    generalAttractions: v.optional(v.array(v.string())),
    updatedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_start_date", ["startDate"])
    .index("by_active", ["isActive"]),

  nocowanki: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.boolean(),
    badge: v.optional(v.string()),
    titlePart1: v.optional(v.string()),
    titlePart2: v.optional(v.string()),
    datesLabel: v.optional(v.string()),
    locationLabel: v.optional(v.string()),
    stats: v.optional(
      v.array(v.object({ value: v.string(), label: v.string() }))
    ),
    attractions: v.optional(
      v.array(
        v.object({
          icon: v.string(),
          title: v.string(),
          description: v.string(),
        })
      )
    ),
    whatToBring: v.optional(v.array(v.string())),
    priceIncluded: v.optional(v.array(v.string())),
    imageUrls: v.optional(v.array(v.string())),
    priceDisplay: v.optional(v.string()),
    availabilityPercent: v.optional(v.number()),
    schedule: v.optional(
      v.array(
        v.object({
          time: v.string(),
          title: v.string(),
          description: v.string(),
        })
      )
    ),
    updatedAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]),

  trialSignups: defineTable({
    childName: v.string(),
    childAge: v.optional(v.string()),
    discipline: v.string(),
    parentName: v.string(),
    parentEmail: v.string(),
    parentPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  })
    .index("by_parent_email", ["parentEmail"])
    .index("by_discipline", ["discipline"])
    .index("by_status", ["status"]),

  registrationFormQuestions: defineTable({
    campId: v.optional(v.id("camps")),
    nocowankaSlug: v.optional(v.string()),
    order: v.number(),
    label: v.string(),
    type: v.union(
      v.literal("short_text"),
      v.literal("long_text"),
      v.literal("checkbox"),
      v.literal("single_choice")
    ),
    required: v.boolean(),
    options: v.optional(v.array(v.string())),
  })
    .index("by_camp", ["campId"])
    .index("by_nocowanka", ["nocowankaSlug"]),

  registrations: defineTable({
    userId: v.optional(v.id("users")),
    campId: v.id("camps"),
    childName: v.string(),
    childSurname: v.string(),
    childDob: v.optional(v.string()),
    childPesel: v.optional(v.string()),
    dietary: v.optional(v.string()),
    allergies: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    parentName: v.string(),
    parentPhone: v.optional(v.string()),
    parentEmail: v.string(),
    status: v.optional(v.string()),
    paymentStatus: v.optional(
      v.union(v.literal("paid"), v.literal("partial"), v.literal("unpaid"))
    ),
    amountPaid: v.optional(v.number()),
    medicalFormStatus: v.optional(
      v.union(v.literal("complete"), v.literal("pending"))
    ),
    consent: v.optional(v.boolean()),
    customAnswers: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_camp", ["campId"])
    .index("by_user", ["userId"])
    .index("by_parent_email", ["parentEmail"])
    .index("by_status", ["status"]),

  nocowankaRegistrations: defineTable({
    userId: v.optional(v.id("users")),
    slug: v.string(),
    childName: v.string(),
    childSurname: v.string(),
    childDob: v.optional(v.string()),
    childPesel: v.optional(v.string()),
    dietary: v.optional(v.string()),
    allergies: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
    parentName: v.string(),
    parentPhone: v.optional(v.string()),
    parentEmail: v.string(),
    status: v.optional(v.string()),
    paymentStatus: v.optional(
      v.union(v.literal("paid"), v.literal("partial"), v.literal("unpaid"))
    ),
    amountPaid: v.optional(v.number()),
    medicalFormStatus: v.optional(
      v.union(v.literal("complete"), v.literal("pending"))
    ),
    consent: v.optional(v.boolean()),
    customAnswers: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_user", ["userId"])
    .index("by_parent_email", ["parentEmail"])
    .index("by_status", ["status"]),

  children: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.string()),
    pesel: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    childId: v.optional(v.id("children")),
    classId: v.id("classes"),
    status: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_class", ["classId"])
    .index("by_status", ["status"])
    .index("by_class_status", ["classId", "status"]),

  galleryCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    order: v.number(),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"])
    .index("by_active", ["isActive"]),

  galleryItems: defineTable({
    type: v.union(v.literal("image"), v.literal("video")),
    title: v.optional(v.string()),
    categoryId: v.optional(v.id("galleryCategories")),
    isPublished: v.boolean(),
    order: v.number(),

    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),

    videoUrl: v.optional(v.string()),

    thumbnailStorageId: v.optional(v.id("_storage")),
    thumbnailUrl: v.optional(v.string()),

    createdBy: v.optional(v.id("users")),
  })
    .index("by_published_order", ["isPublished", "order"])
    .index("by_category_order", ["categoryId", "order"]),

  newsletterSubscribers: defineTable({
    emailNormalized: v.string(),
    unsubscribeToken: v.string(),
    subscribed: v.boolean(),
    userId: v.optional(v.id("users")),
  })
    .index("by_email", ["emailNormalized"])
    .index("by_token", ["unsubscribeToken"])
    .index("by_subscribed", ["subscribed"]),
});
