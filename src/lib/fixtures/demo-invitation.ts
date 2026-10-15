import { DEFAULT_THEME } from "../theme";
import { DEFAULT_OPENING_IMAGE } from "../images";
import type {
  Invitation,
  InvitationEvent,
  InvitationFamily,
  InvitationFaq,
  InvitationGuest,
  InvitationRsvp,
  InvitationWedding,
} from "../invitation";

/**
 * Static fixture used by the phase-2 preview and until the DB layer lands in
 * phase 4. Mirrors prisma/seed.ts exactly.
 */

const wedding: InvitationWedding = {
  slug: "bilal-sara",
  coupleName: { en: "Syed Bilal Zaidi & Sara Javed", ur: "سید بلال زیدی اور سارہ جاوید" },
  theme: DEFAULT_THEME,
  bismillahEnabled: true,
  // Placeholder audio (SoundHelix test track) so the music toggle is testable.
  // Real weddings provide their own uploaded track via Wedding.musicUrl.
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  openingImage: DEFAULT_OPENING_IMAGE,
  bgImages: [],
  timezone: "Asia/Karachi",
  defaultLang: "en",
  personalMessage: {
    en: "With hearts full of joy, we invite you to share in the celebration of our union. Your presence would mean the world to us.",
    ur: "خوشی سے بھرے دلوں کے ساتھ، ہم آپ کو اپنی شادی کی خوشی میں شریک ہونے کی دعوت دیتے ہیں۔ آپ کی موجودگی ہمارے لیے بہت قیمتی ہوگی۔",
  },
};

const events: InvitationEvent[] = [
  {
    id: "evt-mehendi",
    order: 1,
    title: { en: "Mehendi", ur: "مہندی" },
    date: "2026-12-04",
    startTime: "19:00",
    venueName: "The Grand Marquee",
    address: "Main Boulevard, Gulberg III, Lahore",
    mapsUrl: "https://maps.google.com/?q=Grand+Marquee+Lahore",
    hostedBy: { en: "Zaidi Family", ur: "زیدی خاندان" },
    posterImage: null,
    dressNote: "Vibrant yellows and greens",
    seatsAllowed: null,
    rsvp: null,
  },
  {
    id: "evt-baraat",
    order: 2,
    title: { en: "Baraat", ur: "بارات" },
    date: "2026-12-05",
    startTime: "19:30",
    venueName: "Zaidi Residence",
    address: "House 12, DHA Phase 5, Lahore",
    mapsUrl: "https://maps.google.com/?q=DHA+Phase+5+Lahore",
    hostedBy: { en: "Zaidi Family", ur: "زیدی خاندان" },
    posterImage: null,
    dressNote: "Traditional festive wear",
    seatsAllowed: null,
    rsvp: null,
  },
  {
    id: "evt-walima",
    order: 3,
    title: { en: "Walima", ur: "ولیمہ" },
    date: "2026-12-06",
    startTime: "20:00",
    venueName: "Pearl Continental Hotel",
    address: "Mall Road, Lahore",
    mapsUrl: "https://maps.google.com/?q=Pearl+Continental+Lahore",
    hostedBy: { en: "Javed Family", ur: "جاوید خاندان" },
    posterImage: null,
    dressNote: "Formal elegance",
    seatsAllowed: null,
    rsvp: null,
  },
];

const families: InvitationFamily[] = [
  {
    id: "fam-groom",
    side: "groom",
    headName: { en: "Mr. & Mrs. Zaidi", ur: "محترم و محترمہ زیدی" },
    memberNames: [
      { en: "Hamza Zaidi", ur: "حمزہ زیدی" },
      { en: "Zain Zaidi", ur: "زین زیدی" },
      { en: "Hira Zaidi", ur: "حرا زیدی" },
    ],
    figureImage: null,
  },
  {
    id: "fam-bride",
    side: "bride",
    headName: { en: "Farheena Javed", ur: "فرحینہ جاوید" },
    memberNames: [
      { en: "Sara Javed", ur: "سارہ جاوید" },
      { en: "Faizan Javed", ur: "فیضان جاوید" },
      { en: "Noor Javed", ur: "نور جاوید" },
    ],
    figureImage: null,
  },
];

const faqs: InvitationFaq[] = [
  {
    id: "faq-1",
    order: 1,
    question: { en: "What should I wear?", ur: "مجھے کیا پہننا چاہیے؟" },
    answer: {
      en: "Traditional festive wear is perfect.",
      ur: "روایتی اور تہوار کا لباس موزوں ہے۔",
    },
  },
  {
    id: "faq-2",
    order: 2,
    question: {
      en: "Can I bring my family?",
      ur: "کیا میں اپنے اہل خانہ کو لا سکتا ہوں؟",
    },
    answer: {
      en: "Your invitation shows how many places are held for you.",
      ur: "آپ کے دعوت نامے میں آپ کے لیے مختص نشستوں کی تعداد درج ہے۔",
    },
  },
  {
    id: "faq-3",
    order: 3,
    question: { en: "Where do I park?", ur: "پارکنگ کہاں ہے؟" },
    answer: {
      en: "Valet parking is available at the main entrance.",
      ur: "مرکزی دروازے پر ویلیٹ پارکنگ دستیاب ہے۔",
    },
  },
  {
    id: "faq-4",
    order: 4,
    question: { en: "Are children welcome?", ur: "کیا بچوں کو لا سکتے ہیں؟" },
    answer: {
      en: "Yes, children are welcome at all events.",
      ur: "جی ہاں، تمام تقریبات میں بچوں کا خیرمقدم ہے۔",
    },
  },
  {
    id: "faq-5",
    order: 5,
    question: {
      en: "Will photography be allowed?",
      ur: "کیا تصویر کشی کی اجازت ہے؟",
    },
    answer: {
      en: "Yes, but please be mindful of other guests.",
      ur: "جی ہاں، مگر دوسرے مہمانوں کا خیال رکھیں۔",
    },
  },
];

interface GuestSeed {
  guest: InvitationGuest;
  invites: Array<{ eventId: string; seatsAllowed: number | null }>;
  rsvps?: Array<{ eventId: string; rsvp: InvitationRsvp }>;
}

const guests: GuestSeed[] = [
  {
    guest: {
      slug: "imran-ali",
      displayName: { en: "Imran Ali", ur: "عمران علی" },
      type: "single",
      lang: "en",
    },
    invites: [
      { eventId: "evt-mehendi", seatsAllowed: 1 },
      { eventId: "evt-baraat", seatsAllowed: 1 },
    ],
  },
  {
    guest: {
      slug: "sara-hassan",
      displayName: { en: "Sara & Hassan", ur: "سارہ اور حسن" },
      type: "couple",
      lang: "ur",
    },
    invites: [
      { eventId: "evt-mehendi", seatsAllowed: 2 },
      { eventId: "evt-baraat", seatsAllowed: 2 },
      { eventId: "evt-walima", seatsAllowed: 2 },
    ],
    rsvps: [
      {
        eventId: "evt-mehendi",
        rsvp: {
          status: "yes",
          seatsConfirmed: 2,
          dietaryNotes: "One vegetarian plate",
          message: "So excited for you both!",
        },
      },
    ],
  },
  {
    guest: {
      slug: "khan-family",
      displayName: { en: "The Khan Family", ur: "خان خاندان" },
      type: "family",
      lang: "en",
    },
    invites: [
      { eventId: "evt-baraat", seatsAllowed: null },
      { eventId: "evt-walima", seatsAllowed: null },
    ],
  },
  {
    guest: {
      slug: "ayesha-noor",
      displayName: { en: "Ayesha Noor", ur: "عائشہ نور" },
      type: "single",
      lang: "ur",
    },
    invites: [{ eventId: "evt-walima", seatsAllowed: 1 }],
  },
  {
    guest: {
      slug: "bilal-fatima",
      displayName: { en: "Dr. Bilal & Fatima", ur: "ڈاکٹر بلال اور فاطمہ" },
      type: "couple",
      lang: "en",
    },
    invites: [
      { eventId: "evt-mehendi", seatsAllowed: 2 },
      { eventId: "evt-walima", seatsAllowed: 2 },
    ],
  },
];

export const DEMO_WEDDING_SLUG = wedding.slug;
export const DEMO_WEDDING_ID = "wedding-demo";
export const DEMO_GUEST_SLUGS = guests.map((g) => g.guest.slug);
export const DEMO_DEFAULT_GUEST = "sara-hassan";

function buildInvitation(seed: GuestSeed): Invitation {
  const rsvpByEvent = new Map(
    (seed.rsvps ?? []).map((entry) => [entry.eventId, entry.rsvp]),
  );

  const invitedEvents: InvitationEvent[] = seed.invites
    .map((invite) => {
      const event = events.find((e) => e.id === invite.eventId);
      if (!event) return null;
      return {
        ...event,
        seatsAllowed: invite.seatsAllowed,
        rsvp: rsvpByEvent.get(event.id) ?? null,
      };
    })
    .filter((e): e is InvitationEvent => e !== null)
    .sort((a, b) => a.order - b.order);

  return {
    wedding,
    guest: seed.guest,
    events: invitedEvents,
    families,
    faqs: [...faqs].sort((a, b) => a.order - b.order),
  };
}

/**
 * Strict lookup used by the tenant router's offline/demo fallback: unknown
 * weddings or guests return `null` instead of leaking a default invitation.
 */
export function getDemoInvitationFor(
  weddingSlug: string,
  guestSlug: string,
): Invitation | null {
  if (weddingSlug !== wedding.slug) return null;
  const seed = guests.find((g) => g.guest.slug === guestSlug);
  if (!seed) return null;
  return buildInvitation(seed);
}

/** Lenient lookup for the local preview route (falls back to a sample guest). */
export function getDemoInvitation(guestSlug: string): Invitation {
  const seed = guests.find((g) => g.guest.slug === guestSlug) ?? guests[1];
  return buildInvitation(seed);
}
