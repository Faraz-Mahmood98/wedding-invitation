import { Prisma, PrismaClient, GuestType, RsvpStatus, Side } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_THEME } from "../src/lib/theme";
import { DEFAULT_OPENING_IMAGE } from "../src/lib/images";

const prisma = new PrismaClient();

const WEDDING_SLUG = "ahmad-mawra";

type Bi = { en: string; ur: string };

const t = (en: string, ur: string): Bi => ({ en, ur });

async function main() {
  // Idempotent: remove the wedding (children cascade) before reseeding.
  await prisma.wedding.deleteMany({ where: { slug: WEDDING_SLUG } });

  const sharedPasswordHash = await bcrypt.hash("changeme123", 10);

  const wedding = await prisma.wedding.create({
    data: {
      slug: WEDDING_SLUG,
      coupleNameEn: "Ahmad & Mawra",
      coupleNameUr: "احمد اور ماورہ",
      theme: DEFAULT_THEME as unknown as Prisma.InputJsonValue,
      bismillahEnabled: true,
      musicUrl: null,
      openingImage: DEFAULT_OPENING_IMAGE,
      bgImages: [],
      timezone: "Asia/Karachi",
      defaultLang: "en",
      personalMessageEn:
        "With hearts full of joy, we invite you to share in the celebration of our union. Your presence would mean the world to us.",
      personalMessageUr:
        "خوشی سے بھرے دلوں کے ساتھ، ہم آپ کو اپنی شادی کی خوشی میں شریک ہونے کی دعوت دیتے ہیں۔ آپ کی موجودگی ہمارے لیے بہت قیمتی ہوگی۔",
      adminEmail: "ahmad.mawra@example.com",
      passwordHash: sharedPasswordHash,

      events: {
        create: [
          {
            order: 1,
            titleEn: "Mehendi",
            titleUr: "مہندی",
            date: new Date("2026-12-04T00:00:00.000Z"),
            startTime: "19:00",
            venueName: "The Grand Marquee",
            address: "Main Boulevard, Gulberg III, Lahore",
            mapsUrl: "https://maps.google.com/?q=Grand+Marquee+Lahore",
            hostedByEn: "Ahmed Family",
            hostedByUr: "احمد خاندان",
            posterImage: null,
            dressNote: "Vibrant yellows and greens",
          },
          {
            order: 2,
            titleEn: "Baraat",
            titleUr: "بارات",
            date: new Date("2026-12-05T00:00:00.000Z"),
            startTime: "19:30",
            venueName: "Ahmed Residence",
            address: "House 12, DHA Phase 5, Lahore",
            mapsUrl: "https://maps.google.com/?q=DHA+Phase+5+Lahore",
            hostedByEn: "Ahmed Family",
            hostedByUr: "احمد خاندان",
            posterImage: null,
            dressNote: "Traditional festive wear",
          },
          {
            order: 3,
            titleEn: "Walima",
            titleUr: "ولیمہ",
            date: new Date("2026-12-06T00:00:00.000Z"),
            startTime: "20:00",
            venueName: "Pearl Continental Hotel",
            address: "Mall Road, Lahore",
            mapsUrl: "https://maps.google.com/?q=Pearl+Continental+Lahore",
            hostedByEn: "Malik Family",
            hostedByUr: "ملک خاندان",
            posterImage: null,
            dressNote: "Formal elegance",
          },
        ],
      },

      families: {
        create: [
          {
            side: Side.groom,
            order: 1,
            headNameEn: "Mr. & Mrs. Ahmed",
            headNameUr: "محترم و محترمہ احمد",
            memberNames: [
              t("Hamza Ahmed", "حمزہ احمد"),
              t("Zain Ahmed", "زین احمد"),
              t("Hira Ahmed", "حرا احمد"),
            ],
          },
          {
            side: Side.bride,
            order: 1,
            headNameEn: "Mr. & Mrs. Malik",
            headNameUr: "محترم و محترمہ ملک",
            memberNames: [
              t("Mawra Malik", "ماورہ ملک"),
              t("Faizan Malik", "فیضان ملک"),
              t("Noor Malik", "نور ملک"),
            ],
          },
        ],
      },

      faqs: {
        create: [
          {
            order: 1,
            questionEn: "What should I wear?",
            questionUr: "مجھے کیا پہننا چاہیے؟",
            answerEn: "Traditional festive wear is perfect.",
            answerUr: "روایتی اور تہوار کا لباس موزوں ہے۔",
          },
          {
            order: 2,
            questionEn: "Can I bring my family?",
            questionUr: "کیا میں اپنے اہل خانہ کو لا سکتا ہوں؟",
            answerEn:
              "Your invitation shows how many places are held for you.",
            answerUr:
              "آپ کے دعوت نامے میں آپ کے لیے مختص نشستوں کی تعداد درج ہے۔",
          },
          {
            order: 3,
            questionEn: "Where do I park?",
            questionUr: "پارکنگ کہاں ہے؟",
            answerEn: "Valet parking is available at the main entrance.",
            answerUr: "مرکزی دروازے پر ویلیٹ پارکنگ دستیاب ہے۔",
          },
          {
            order: 4,
            questionEn: "Are children welcome?",
            questionUr: "کیا بچوں کو لا سکتے ہیں؟",
            answerEn: "Yes, children are welcome at all events.",
            answerUr: "جی ہاں، تمام تقریبات میں بچوں کا خیرمقدم ہے۔",
          },
          {
            order: 5,
            questionEn: "Will photography be allowed?",
            questionUr: "کیا تصویر کشی کی اجازت ہے؟",
            answerEn: "Yes, but please be mindful of other guests.",
            answerUr: "جی ہاں، مگر دوسرے مہمانوں کا خیال رکھیں۔",
          },
        ],
      },
    },
    include: { events: true },
  });

  const [mehendi, baraat, walima] = wedding.events.sort((a, b) => a.order - b.order);

  // --- Guests -------------------------------------------------------------
  const guestSeeds: Array<{
    slug: string;
    displayNameEn: string;
    displayNameUr?: string;
    type: GuestType;
    phone?: string;
    lang: string;
    invite: Array<{ eventId: string; seatsAllowed: number | null }>;
  }> = [
    {
      slug: "imran-ali",
      displayNameEn: "Imran Ali",
      displayNameUr: "عمران علی",
      type: GuestType.single,
      phone: "+923001234567",
      lang: "en",
      invite: [
        { eventId: mehendi.id, seatsAllowed: 1 },
        { eventId: baraat.id, seatsAllowed: 1 },
      ],
    },
    {
      slug: "sara-hassan",
      displayNameEn: "Sara & Hassan",
      displayNameUr: "سارہ اور حسن",
      type: GuestType.couple,
      phone: "+923009876543",
      lang: "ur",
      invite: [
        { eventId: mehendi.id, seatsAllowed: 2 },
        { eventId: baraat.id, seatsAllowed: 2 },
        { eventId: walima.id, seatsAllowed: 2 },
      ],
    },
    {
      slug: "khan-family",
      displayNameEn: "The Khan Family",
      displayNameUr: "خان خاندان",
      type: GuestType.family,
      lang: "en",
      invite: [
        { eventId: baraat.id, seatsAllowed: null },
        { eventId: walima.id, seatsAllowed: null },
      ],
    },
    {
      slug: "ayesha-noor",
      displayNameEn: "Ayesha Noor",
      displayNameUr: "عائشہ نور",
      type: GuestType.single,
      lang: "ur",
      invite: [{ eventId: walima.id, seatsAllowed: 1 }],
    },
    {
      slug: "bilal-fatima",
      displayNameEn: "Dr. Bilal & Fatima",
      displayNameUr: "ڈاکٹر بلال اور فاطمہ",
      type: GuestType.couple,
      lang: "en",
      invite: [
        { eventId: mehendi.id, seatsAllowed: 2 },
        { eventId: walima.id, seatsAllowed: 2 },
      ],
    },
  ];

  for (const g of guestSeeds) {
    await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        slug: g.slug,
        displayNameEn: g.displayNameEn,
        displayNameUr: g.displayNameUr,
        type: g.type,
        phone: g.phone,
        lang: g.lang,
        guestEvents: { create: g.invite },
      },
    });
  }

  // One pre-filled RSVP so the admin dashboard has data in phase 5.
  const sara = await prisma.guest.findUniqueOrThrow({
    where: { weddingId_slug: { weddingId: wedding.id, slug: "sara-hassan" } },
  });
  await prisma.rsvp.create({
    data: {
      guestId: sara.id,
      eventId: mehendi.id,
      status: RsvpStatus.yes,
      seatsConfirmed: 2,
      dietaryNotes: "One vegetarian plate",
      message: "So excited for you both!",
    },
  });

  // --- Admins -------------------------------------------------------------
  await prisma.adminUser.createMany({
    data: [
      {
        email: "super@example.com",
        passwordHash: sharedPasswordHash,
        role: "super_admin",
      },
      {
        email: wedding.adminEmail,
        passwordHash: sharedPasswordHash,
        role: "wedding_admin",
        weddingId: wedding.id,
      },
    ],
  });

  console.log(`Seeded wedding "${wedding.coupleNameEn}" (${wedding.slug}).`);
  console.log(`  Events: ${wedding.events.length}`);
  console.log(`  Guests: ${guestSeeds.length}`);
  console.log(`  Admins: 2 (password: changeme123)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
