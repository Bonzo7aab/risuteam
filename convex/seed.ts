import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Judo dzieci",
        discipline: "Judo",
        ageGroup: "6-9 lat",
        locationId,
        coachId: coachById("Piotr Nowak"),
        maxCapacity: 16,
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Karate dzieci",
        discipline: "Karate",
        ageGroup: "6-9 lat",
        locationId,
        coachId: coachById("Michał Wiśniewski"),
        maxCapacity: 14,
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Gimnastyka maluchy",
        discipline: "Gimnastyka",
        ageGroup: "3-5 lat",
        locationId,
        coachId: coachById("Anna Kowalska"),
        maxCapacity: 10,
        isActive: true,
      });
      await ctx.db.insert("classes", {
        name: "Judo młodzież",
        discipline: "Judo",
        ageGroup: "10-14 lat",
        locationId,
        coachId: coachById("Katarzyna Lewandowska"),
        maxCapacity: 14,
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
