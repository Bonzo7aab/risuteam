import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  classMonthlyFeeGrosze,
  ensureClassInvoiceForPeriod,
  ensureInvoicesThroughCurrentMonth,
} from "./billingHelpers";

const MOCK_EMAIL_SUFFIX = "@mock.risuteam.pl";

/**
 * Seeds the schedule: locations, coaches, classes, and timeSlots.
 * Run once from the Convex dashboard (Functions → seed:seedSchedule).
 * Skips if timeSlots already exist to avoid duplicates.
 */
export const seedSchedule = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSlots = await ctx.db.query("timeSlots").first();
    if (existingSlots) {
      return { ok: false, message: "Schedule already has data. Skip seeding." };
    }

    const locations = await ctx.db.query("locations").collect();
    if (locations.length === 0) {
      await ctx.db.insert("locations", {
        name: "Szkoła Podstawowa 340",
        address: "Jana Ciszewskiego 15",
        city: "Warszawa",
        postalCode: "02-777",
        mapsUrl: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
      });
      await ctx.db.insert("locations", {
        name: "Szkoła Podstawowa 12",
        address: "Jana Ciszewskiego 15",
        city: "Warszawa",
        postalCode: "02-777",
        mapsUrl: "https://maps.app.goo.gl/F9iebzDe8PTvdB1b9",
      });
    }

    const locs = await ctx.db.query("locations").collect();
    const locationId = locs[0]!._id;

    const coaches = await ctx.db.query("coaches").collect();
    if (coaches.length === 0) {
      await ctx.db.insert("coaches", {
        name: "Piotr Nowak",
        disciplines: ["Judo"],
        isActive: true,
      });
      await ctx.db.insert("coaches", {
        name: "Anna Kowalska",
        disciplines: ["Gimnastyka", "Judo"],
        isActive: true,
      });
      await ctx.db.insert("coaches", {
        name: "Michał Wiśniewski",
        disciplines: ["Karate"],
        isActive: true,
      });
      await ctx.db.insert("coaches", {
        name: "Katarzyna Lewandowska",
        disciplines: ["Judo"],
        isActive: true,
      });
    }

    const coachList = await ctx.db.query("coaches").collect();
    const coachById = (name: string) =>
      coachList.find((c) => c.name === name)?._id ?? coachList[0]!._id;

    const classes = await ctx.db.query("classes").collect();
    if (classes.length === 0) {
      await ctx.db.insert("classes", {
        name: "Judo maluchy",
        discipline: "Judo",
        ageGroup: "3-5 lat",
        locationId,
        coachId: coachById("Piotr Nowak"),
        maxCapacity: 12,
        monthlyFeeGrosze: 24000,
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Judo dzieci",
        discipline: "Judo",
        ageGroup: "6-9 lat",
        locationId,
        coachId: coachById("Piotr Nowak"),
        maxCapacity: 16,
        monthlyFeeGrosze: 24000,
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Karate dzieci",
        discipline: "Karate",
        ageGroup: "6-9 lat",
        locationId,
        coachId: coachById("Michał Wiśniewski"),
        maxCapacity: 14,
        monthlyFeeGrosze: 24000,
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Gimnastyka maluchy",
        discipline: "Gimnastyka",
        ageGroup: "3-5 lat",
        locationId,
        coachId: coachById("Anna Kowalska"),
        maxCapacity: 10,
        monthlyFeeGrosze: 24000,
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Judo młodzież",
        discipline: "Judo",
        ageGroup: "10-14 lat",
        locationId,
        coachId: coachById("Katarzyna Lewandowska"),
        maxCapacity: 14,
        monthlyFeeGrosze: 24000,
        isActive: true,
      });
    }

    const allClasses = await ctx.db.query("classes").collect();
    const classByName = (name: string): Id<"classes"> =>
      allClasses.find((c) => c.name === name)!._id;

    const slots: {
      classId: Id<"classes">;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[] = [
      { classId: classByName("Judo maluchy"), dayOfWeek: 1, startTime: "16:00", endTime: "16:45" },
      { classId: classByName("Judo maluchy"), dayOfWeek: 3, startTime: "16:00", endTime: "16:45" },
      { classId: classByName("Judo dzieci"), dayOfWeek: 1, startTime: "17:00", endTime: "18:00" },
      { classId: classByName("Judo dzieci"), dayOfWeek: 3, startTime: "17:00", endTime: "18:00" },
      { classId: classByName("Judo dzieci"), dayOfWeek: 5, startTime: "17:00", endTime: "18:00" },
      { classId: classByName("Karate dzieci"), dayOfWeek: 2, startTime: "17:00", endTime: "18:00" },
      { classId: classByName("Karate dzieci"), dayOfWeek: 4, startTime: "17:00", endTime: "18:00" },
      { classId: classByName("Gimnastyka maluchy"), dayOfWeek: 1, startTime: "15:00", endTime: "15:45" },
      { classId: classByName("Gimnastyka maluchy"), dayOfWeek: 4, startTime: "15:00", endTime: "15:45" },
      { classId: classByName("Judo młodzież"), dayOfWeek: 2, startTime: "18:00", endTime: "19:00" },
      { classId: classByName("Judo młodzież"), dayOfWeek: 4, startTime: "18:00", endTime: "19:00" },
    ];

    for (const slot of slots) {
      await ctx.db.insert("timeSlots", slot);
    }

    return { ok: true, message: `Seeded ${slots.length} time slots.` };
  },
});

/** Seed camps so camp registration (by slug) works. Match slugs used on /obozy page.
 * Inserts letnie, zimowe, polkolonie only if a camp with that slug doesn't exist yet. Safe to run multiple times.
 */
export const seedCamps = mutation({
  args: {},
  handler: async (ctx) => {
    const locs = await ctx.db.query("locations").collect();
    const locationId = locs[0]?._id;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const mockDailySchedule = [
      { time: "08:00", activity: "Śniadanie" },
      { time: "09:30", activity: "Zajęcia sportowe" },
      { time: "12:00", activity: "Obiad" },
      { time: "14:00", activity: "Wycieczka / atrakcje" },
      { time: "18:00", activity: "Kolacja" },
      { time: "20:00", activity: "Wieczorne ognisko / gry" },
    ];
    const mockScheduleByDay = [
      {
        dayLabel: "Dzień 1",
        slots: [
          { time: "14:00", activity: "Zakwaterowanie i zapoznanie" },
          { time: "16:00", activity: "Integracja" },
        ],
      },
      {
        dayLabel: "Dzień 2",
        slots: [
          { time: "09:30", activity: "Trening" },
          { time: "14:00", activity: "Wycieczka" },
        ],
      },
    ];
    const mockIncludedItems = ["Wyżywienie (3 posiłki)", "Ubezpieczenie", "Opieka kadry", "Materiały"];
    const mockAttractions = ["Basen", "Wycieczki górskie", "Ogniska", "Gry zespołowe"];

    // Full URL for hero image so seed documents reflect complete admin-provided shape (Convex runs server-side).
    const seedHeroImageUrl =
      "https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=1200";

    let inserted = 0;

    const letnieExists = await ctx.db.query("camps").withIndex("by_slug", (q) => q.eq("slug", "letnie")).first();
    if (!letnieExists) {
      await ctx.db.insert("camps", {
        slug: "letnie",
        name: "Letni Obóz Sportowy 2024",
        description: "Tydzień pełen wrażeń w sercu gór! Codzienne treningi, wycieczki krajoznawcze i wieczorne ogniska.",
        startDate: now + 90 * day,
        endDate: now + 100 * day,
        locationId,
        maxParticipants: 30,
        price: 1800,
        isActive: true,
        isRegistrationOpen: true,
        category: "letni",
        ageGroup: "7-14 lat",
        heroImageUrl: seedHeroImageUrl,
        earlyBirdDiscountPercent: 10,
        dailySchedule: mockDailySchedule,
        scheduleByDay: mockScheduleByDay,
        includedItems: mockIncludedItems,
        generalAttractions: mockAttractions,
      });
      inserted += 1;
    }

    const zimoweExists = await ctx.db.query("camps").withIndex("by_slug", (q) => q.eq("slug", "zimowe")).first();
    if (!zimoweExists) {
      await ctx.db.insert("camps", {
        slug: "zimowe",
        name: "Rowerowe Szaleństwo",
        description: "Intensywny obóz rowerowy dla małych pasjonatów dwóch kółek.",
        startDate: now + 120 * day,
        endDate: now + 128 * day,
        locationId,
        maxParticipants: 20,
        price: 1650,
        isActive: true,
        isRegistrationOpen: true,
        category: "zimowy",
        ageGroup: "8-14 lat",
        heroImageUrl: seedHeroImageUrl,
        earlyBirdDiscountPercent: 5,
        dailySchedule: mockDailySchedule,
        scheduleByDay: mockScheduleByDay,
        includedItems: mockIncludedItems,
        generalAttractions: ["Trasy rowerowe", "Warsztaty naprawy", "Wycieczki"],
      });
      inserted += 1;
    }

    const polkolonieExists = await ctx.db.query("camps").withIndex("by_slug", (q) => q.eq("slug", "polkolonie")).first();
    if (!polkolonieExists) {
      await ctx.db.insert("camps", {
        slug: "polkolonie",
        name: "Półkolonie letnie",
        description: "Aktywne półkolonie w Warszawie — sport, zabawy i nowe znajomości.",
        startDate: now + 100 * day,
        endDate: now + 150 * day,
        locationId,
        maxParticipants: 40,
        price: 600,
        isActive: true,
        isRegistrationOpen: true,
        category: "polkolonie",
        ageGroup: "6-12 lat",
        heroImageUrl: seedHeroImageUrl,
        earlyBirdDiscountPercent: undefined,
        dailySchedule: [
          { time: "08:00", activity: "Zbiórka" },
          { time: "09:00", activity: "Zajęcia tematyczne" },
          { time: "12:00", activity: "Obiad" },
          { time: "13:00", activity: "Warsztaty / gry" },
          { time: "16:00", activity: "Odbiór" },
        ],
        scheduleByDay: mockScheduleByDay,
        includedItems: ["Obiad", "Ubezpieczenie", "Opieka"],
        generalAttractions: ["Sport", "Warsztaty", "Wycieczki po Warszawie"],
      });
      inserted += 1;
    }

    return {
      ok: true,
      message: inserted === 0
        ? "Wszystkie 3 obozy (letnie, zimowe, polkolonie) już istnieją. Nic nie dodano."
        : `Dodano ${inserted} obozów.`,
    };
  },
});

const DEFAULT_DAILY_SCHEDULE = [
  { time: "08:00", activity: "Śniadanie" },
  { time: "09:30", activity: "Zajęcia sportowe" },
  { time: "12:00", activity: "Obiad" },
  { time: "14:00", activity: "Wycieczka / atrakcje" },
  { time: "18:00", activity: "Kolacja" },
  { time: "20:00", activity: "Wieczorne ognisko / gry" },
];
const DEFAULT_SCHEDULE_BY_DAY = [
  {
    dayLabel: "Dzień 1",
    slots: [
      { time: "14:00", activity: "Zakwaterowanie i zapoznanie" },
      { time: "16:00", activity: "Integracja" },
    ],
  },
  {
    dayLabel: "Dzień 2",
    slots: [
      { time: "09:30", activity: "Trening" },
      { time: "14:00", activity: "Wycieczka" },
    ],
  },
];
const DEFAULT_INCLUDED_ITEMS = ["Wyżywienie (3 posiłki)", "Ubezpieczenie", "Opieka kadry", "Materiały"];
const DEFAULT_ATTRACTIONS = ["Basen", "Wycieczki górskie", "Ogniska", "Gry zespołowe"];

/**
 * Migration: backfill existing camps with new optional fields (isRegistrationOpen, category, ageGroup,
 * dailySchedule, scheduleByDay, includedItems, generalAttractions, earlyBirdDiscountPercent).
 * Only sets fields that are currently undefined. Run once from Convex dashboard (seed:migrateCampsBackfill).
 * No auth required so it can be run from the dashboard without a logged-in user.
 */
export const migrateCampsBackfill = mutation({
  args: {},
  handler: async (ctx) => {
    const camps = await ctx.db.query("camps").collect();
    let updated = 0;
    const stripDiacriticsLower = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    for (const camp of camps) {
      const updates: Record<string, unknown> = {};
      if (camp.isRegistrationOpen === undefined) updates.isRegistrationOpen = true;
      // Normalize category to keys used by the app: "letni" | "zimowy" | "polkolonie".
      // Backfill if missing, and also repair older label-like values from earlier seeds/migrations.
      const existingCategory = typeof camp.category === "string" ? stripDiacriticsLower(camp.category) : "";
      const isAlreadyKey =
        existingCategory === "letni" ||
        existingCategory === "zimowy" ||
        existingCategory === "polkolonie";
      if (!isAlreadyKey) {
        if (camp.slug === "polkolonie" || existingCategory === "polkolonie" || existingCategory === "polkolonie") {
          updates.category = "polkolonie";
        } else if (
          camp.slug === "zimowe" ||
          existingCategory.includes("rower") ||
          existingCategory.includes("zimow")
        ) {
          updates.category = "zimowy";
        } else if (camp.slug === "letnie" || existingCategory.includes("sport") || existingCategory.includes("letni")) {
          updates.category = "letni";
        } else if (camp.category === undefined) {
          // Unknown camp, but keep default consistent.
          updates.category = "letni";
        }
      }
      if (camp.ageGroup === undefined) {
        if (camp.slug === "polkolonie") updates.ageGroup = "6-12 lat";
        else if (camp.slug === "zimowe") updates.ageGroup = "8-14 lat";
        else updates.ageGroup = "7-14 lat";
      }
      if (camp.earlyBirdDiscountPercent === undefined && camp.slug !== "polkolonie") {
        updates.earlyBirdDiscountPercent = camp.slug === "zimowe" ? 5 : 10;
      }
      if (camp.dailySchedule === undefined) {
        updates.dailySchedule =
          camp.slug === "polkolonie"
            ? [
                { time: "08:00", activity: "Zbiórka" },
                { time: "09:00", activity: "Zajęcia tematyczne" },
                { time: "12:00", activity: "Obiad" },
                { time: "13:00", activity: "Warsztaty / gry" },
                { time: "16:00", activity: "Odbiór" },
              ]
            : DEFAULT_DAILY_SCHEDULE;
      }
      if (camp.scheduleByDay === undefined) updates.scheduleByDay = DEFAULT_SCHEDULE_BY_DAY;
      if (camp.includedItems === undefined) {
        updates.includedItems =
          camp.slug === "polkolonie" ? ["Obiad", "Ubezpieczenie", "Opieka"] : DEFAULT_INCLUDED_ITEMS;
      }
      if (camp.generalAttractions === undefined) {
        updates.generalAttractions =
          camp.slug === "zimowe"
            ? ["Trasy rowerowe", "Warsztaty naprawy", "Wycieczki"]
            : camp.slug === "polkolonie"
              ? ["Sport", "Warsztaty", "Wycieczki po Warszawie"]
              : DEFAULT_ATTRACTIONS;
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(camp._id, updates as any);
        updated += 1;
      }
    }
    return { ok: true, message: `Backfilled ${updated} of ${camps.length} camps.` };
  },
});

const KLUBOWA_NOCOWANKA_FULL = {
  slug: "klubowa" as const,
  name: "Klubowa Nocowanka",
  description:
    "Dołącz do nas na najbardziej ekscytującą noc pełną gier, pizzy i nocnych przygód z Risu Team!",
  maxParticipants: 50,
  price: 170,
  isActive: true,
  badge: "EVENT JEDNODNIOWY",
  titlePart1: "Klubowa",
  titlePart2: "Nocowanka",
  datesLabel: "6-7 Marca",
  locationLabel: "B.P. w Zamienniku",
  stats: [
    { value: "19:00", label: "START IMPREZY" },
    { value: "14h", label: "ŚWIETNEJ ZABAWY" },
    { value: "Unlimited", label: "PIZZA I GRY" },
    { value: "170 ZŁ", label: "PEŁNA CENA" },
  ],
  attractions: [
    { icon: "sports_esports", title: "Gry i Zabawy", description: "" },
    { icon: "local_pizza", title: "Uczta Pizza", description: "" },
    { icon: "movie", title: "Seanse Kinowe", description: "" },
    { icon: "celebration", title: "Dyskoteka", description: "" },
    { icon: "nightlight", title: "Spanie na Macie", description: "" },
  ],
  whatToBring: [
    "Śpiwór",
    "Poduszka",
    "Ubranie na zmianę",
    "Przybory toaletowe",
    "Ulubiona przytulanka",
  ],
  priceIncluded: [
    "Pizza i napoje",
    "Gry i atrakcje",
    "Opieka kadry",
    "Śniadanie",
  ],
  priceDisplay: "170 PLN",
  availabilityPercent: 75,
  schedule: [
    { time: "19:00", title: "Przyjazd i Zakwaterowanie", description: "" },
    { time: "20:00", title: "Czas na Pizzę", description: "" },
    { time: "21:00", title: "Kino & Gry", description: "" },
    { time: "22:30", title: "Cisza Nocna", description: "" },
    { time: "08:00", title: "Śniadanie i Odbiór", description: "" },
  ],
};

/** Seed nocowanki so admin list and registration config work. Matches public /obozy/nocowanki/klubowa. */
export const seedNocowanki = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("nocowanki").first();
    if (existing) {
      return { ok: false, message: "Nocowanki already exist. Skip seeding." };
    }
    await ctx.db.insert("nocowanki", KLUBOWA_NOCOWANKA_FULL);
    return { ok: true, message: "Seeded 1 nocowanka (klubowa)." };
  },
});

/** Patch existing klubowa row with full content (for DB created before extended fields). */
export const backfillKlubowaNocowanka = mutation({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("nocowanki")
      .withIndex("by_slug", (q) => q.eq("slug", "klubowa"))
      .first();
    if (!doc) {
      return { ok: false, message: "No nocowanka with slug klubowa." };
    }
    const { slug: _s, ...rest } = KLUBOWA_NOCOWANKA_FULL;
    await ctx.db.patch(doc._id, rest);
    return { ok: true, message: "Patched klubowa nocowanka with full fields." };
  },
});

type MockParentSeed = {
  email: string;
  name: string;
  phone: string;
  children: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    /** Class names to enroll (matched against classes.name). */
    classNames: string[];
    /** Enrollment billing scenario */
    scenario: "paid_current" | "unpaid_current" | "mixed_months" | "cancelled_past";
  }>;
};

const MOCK_PARENTS: MockParentSeed[] = [
  {
    email: `anna.kowalska${MOCK_EMAIL_SUFFIX}`,
    name: "Anna Kowalska",
    phone: "+48 500 100 101",
    children: [
      {
        firstName: "Zosia",
        lastName: "Kowalska",
        dateOfBirth: "2018-03-12",
        classNames: ["Judo maluchy", "Gimnastyka maluchy"],
        scenario: "paid_current",
      },
      {
        firstName: "Antoni",
        lastName: "Kowalski",
        dateOfBirth: "2016-07-22",
        classNames: ["Judo dzieci"],
        scenario: "unpaid_current",
      },
    ],
  },
  {
    email: `piotr.nowak${MOCK_EMAIL_SUFFIX}`,
    name: "Piotr Nowak",
    phone: "+48 500 100 102",
    children: [
      {
        firstName: "Maja",
        lastName: "Nowak",
        dateOfBirth: "2015-11-03",
        classNames: ["Karate dzieci"],
        scenario: "mixed_months",
      },
    ],
  },
  {
    email: `magdalena.wisniewska${MOCK_EMAIL_SUFFIX}`,
    name: "Magdalena Wiśniewska",
    phone: "+48 500 100 103",
    children: [
      {
        firstName: "Jakub",
        lastName: "Wiśniewski",
        dateOfBirth: "2014-01-18",
        classNames: ["Judo młodzież"],
        scenario: "paid_current",
      },
      {
        firstName: "Lena",
        lastName: "Wiśniewska",
        dateOfBirth: "2019-09-05",
        classNames: ["Judo maluchy"],
        scenario: "unpaid_current",
      },
    ],
  },
  {
    email: `tomasz.lewandowski${MOCK_EMAIL_SUFFIX}`,
    name: "Tomasz Lewandowski",
    phone: "+48 500 100 104",
    children: [
      {
        firstName: "Oliwia",
        lastName: "Lewandowska",
        dateOfBirth: "2017-05-30",
        classNames: ["Judo dzieci", "Karate dzieci"],
        scenario: "mixed_months",
      },
    ],
  },
  {
    email: `katarzyna.zielinska${MOCK_EMAIL_SUFFIX}`,
    name: "Katarzyna Zielińska",
    phone: "+48 500 100 105",
    children: [
      {
        firstName: "Szymon",
        lastName: "Zieliński",
        dateOfBirth: "2013-12-09",
        classNames: ["Judo młodzież"],
        scenario: "cancelled_past",
      },
    ],
  },
];

/**
 * Seed mock parent accounts, kids, class enrollments and monthly invoices.
 * Idempotent via `@mock.risuteam.pl` emails — skips if already present.
 *
 *   npx convex run seed:seedMockParents
 */
export const seedMockParents = mutation({
  args: {
    force: v.optional(v.boolean()),
  },
  returns: v.object({
    ok: v.boolean(),
    message: v.string(),
    usersCreated: v.number(),
    childrenCreated: v.number(),
    enrollmentsCreated: v.number(),
  }),
  handler: async (ctx, args) => {
    const existingMock = await ctx.db
      .query("users")
      .withIndex("email", (q) =>
        q.eq("email", `anna.kowalska${MOCK_EMAIL_SUFFIX}`)
      )
      .first();
    if (existingMock && !args.force) {
      return {
        ok: false,
        message:
          "Mock parents already exist. Re-run with { force: true } to add another batch (may duplicate).",
        usersCreated: 0,
        childrenCreated: 0,
        enrollmentsCreated: 0,
      };
    }

    const classes = await ctx.db.query("classes").collect();
    const activeClasses = classes.filter((c) => c.isActive);
    if (activeClasses.length === 0) {
      return {
        ok: false,
        message: "No active classes found. Create classes or run seed:seedSchedule first.",
        usersCreated: 0,
        childrenCreated: 0,
        enrollmentsCreated: 0,
      };
    }
    const classByName = new Map(classes.map((c) => [c.name, c]));
    let fallbackIdx = 0;
    const resolveClass = (className: string) => {
      const named = classByName.get(className);
      if (named?.isActive) return named;
      // Prefer another active class with the same discipline keyword
      const discHint = className.split(" ")[0]?.toLowerCase() ?? "";
      const byDisc = activeClasses.find((c) =>
        c.discipline.toLowerCase().includes(discHint)
      );
      if (byDisc) return byDisc;
      const pick = activeClasses[fallbackIdx % activeClasses.length]!;
      fallbackIdx += 1;
      return pick;
    };

    const now = Date.now();
    const msDay = 24 * 60 * 60 * 1000;
    let usersCreated = 0;
    let childrenCreated = 0;
    let enrollmentsCreated = 0;

    for (const parent of MOCK_PARENTS) {
      let user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", parent.email))
        .first();
      if (!user) {
        const userId = await ctx.db.insert("users", {
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
          emailVerificationTime: now,
          onboardingCompletedAt: now,
        });
        user = await ctx.db.get("users", userId);
        usersCreated += 1;
      }
      if (!user) continue;

      for (const childSpec of parent.children) {
        const existingChildren = await ctx.db
          .query("children")
          .withIndex("by_user", (q) => q.eq("userId", user!._id))
          .collect();
        let child =
          existingChildren.find(
            (c) =>
              c.firstName === childSpec.firstName &&
              c.lastName === childSpec.lastName
          ) ?? null;
        if (!child) {
          const childId = await ctx.db.insert("children", {
            userId: user._id,
            firstName: childSpec.firstName,
            lastName: childSpec.lastName,
            dateOfBirth: childSpec.dateOfBirth,
          });
          child = await ctx.db.get("children", childId);
          childrenCreated += 1;
        }
        if (!child) continue;

        for (const className of childSpec.classNames) {
          const cls = resolveClass(className);
          if (!cls) continue;

          const existingSubs = await ctx.db
            .query("subscriptions")
            .withIndex("by_user", (q) => q.eq("userId", user!._id))
            .collect();
          const already = existingSubs.find(
            (s) =>
              s.childId === child!._id &&
              s.classId === cls._id &&
              (s.status === "active" ||
                s.status === "pending_payment" ||
                s.status === "cancelled" ||
                s.status === "ended")
          );
          if (already && !args.force) continue;

          let startDate = now - 45 * msDay;
          let status: "active" | "pending_payment" | "cancelled" | "ended" =
            "active";
          let endDate: number | undefined;

          if (childSpec.scenario === "unpaid_current") {
            startDate = now - 10 * msDay;
            status = "pending_payment";
          } else if (childSpec.scenario === "paid_current") {
            startDate = now - 40 * msDay;
            status = "active";
          } else if (childSpec.scenario === "mixed_months") {
            startDate = now - 70 * msDay;
            status = "active";
          } else if (childSpec.scenario === "cancelled_past") {
            startDate = now - 90 * msDay;
            endDate = now - 20 * msDay;
            status = "cancelled";
          }

          const subscriptionId = await ctx.db.insert("subscriptions", {
            userId: user._id,
            childId: child._id,
            classId: cls._id,
            status,
            startDate,
            endDate,
            paymentHoldExpiresAt:
              status === "pending_payment"
                ? now + 7 * msDay
                : undefined,
          });
          enrollmentsCreated += 1;

          const fee = classMonthlyFeeGrosze(cls);
          await ensureInvoicesThroughCurrentMonth(ctx, {
            subscriptionId,
            startDate,
            endDate,
            status,
            amountGrosze: fee,
          });

          const invoices = await ctx.db
            .query("classInvoices")
            .withIndex("by_subscription", (q) =>
              q.eq("subscriptionId", subscriptionId)
            )
            .collect();
          invoices.sort(
            (a, b) => a.year - b.year || a.month - b.month
          );

          if (childSpec.scenario === "paid_current") {
            for (const inv of invoices) {
              await ctx.db.patch(inv._id, {
                paymentStatus: "paid",
                amountPaidGrosze: inv.amountGrosze,
              });
            }
          } else if (childSpec.scenario === "unpaid_current") {
            for (const inv of invoices) {
              await ctx.db.patch(inv._id, {
                paymentStatus: "unpaid",
                amountPaidGrosze: 0,
              });
            }
          } else if (childSpec.scenario === "mixed_months") {
            // Pay all but the latest month
            for (let i = 0; i < invoices.length; i++) {
              const inv = invoices[i]!;
              const isLast = i === invoices.length - 1;
              await ctx.db.patch(inv._id, {
                paymentStatus: isLast ? "unpaid" : "paid",
                amountPaidGrosze: isLast ? 0 : inv.amountGrosze,
              });
            }
          } else if (childSpec.scenario === "cancelled_past") {
            for (const inv of invoices) {
              await ctx.db.patch(inv._id, {
                paymentStatus: "paid",
                amountPaidGrosze: inv.amountGrosze,
              });
            }
          }

          // Ensure at least current-month invoice row exists for active scenarios
          if (status === "active" || status === "pending_payment") {
            await ensureClassInvoiceForPeriod(ctx, {
              subscriptionId,
              amountGrosze: fee,
            });
          }
        }
      }
    }

    return {
      ok: true,
      message: `Seeded mock parents (${MOCK_PARENTS.length} households).`,
      usersCreated,
      childrenCreated,
      enrollmentsCreated,
    };
  },
});
