import { describe, expect, it } from "vitest";
import { toInvitation, type InvitationInput } from "./map";

function baseInput(): InvitationInput {
  return {
    wedding: {
      slug: "wed-a",
      coupleNameEn: "A & B",
      coupleNameUr: "ا اور ب",
      theme: { palette: { blush: "#ffffff" } },
      bismillahEnabled: true,
      musicUrl: null,
      openingImage: null,
      bgImages: [],
      timezone: "Asia/Karachi",
      defaultLang: "en",
      personalMessageEn: "Hello",
      personalMessageUr: "ہیلو",
    },
    guest: {
      slug: "guest-1",
      displayNameEn: "Guest One",
      displayNameUr: null,
      type: "couple",
      lang: "ur",
    },
    events: [
      {
        id: "e1",
        order: 1,
        titleEn: "Mehendi",
        titleUr: "مہندی",
        date: new Date("2026-12-04T00:00:00.000Z"),
        startTime: "19:00",
        venueName: "V1",
        address: "A1",
        mapsUrl: null,
        hostedByEn: "Host",
        hostedByUr: null,
        posterImage: null,
        dressNote: null,
      },
      {
        id: "e2",
        order: 2,
        titleEn: "Baraat",
        titleUr: "بارات",
        date: new Date("2026-12-05T00:00:00.000Z"),
        startTime: "19:30",
        venueName: "V2",
        address: "A2",
        mapsUrl: null,
        hostedByEn: null,
        hostedByUr: null,
        posterImage: null,
        dressNote: null,
      },
      {
        id: "e3",
        order: 3,
        titleEn: "Walima",
        titleUr: "ولیمہ",
        date: new Date("2026-12-06T00:00:00.000Z"),
        startTime: "20:00",
        venueName: "V3",
        address: "A3",
        mapsUrl: null,
        hostedByEn: null,
        hostedByUr: null,
        posterImage: null,
        dressNote: null,
      },
    ],
    families: [
      {
        id: "f-bride",
        side: "bride",
        headNameEn: "Bride Head",
        headNameUr: "دلہن",
        memberNames: [{ en: "M1", ur: "م1" }],
        figureImage: null,
      },
      {
        id: "f-groom",
        side: "groom",
        headNameEn: "Groom Head",
        headNameUr: "دولہا",
        memberNames: "not-an-array",
        figureImage: null,
      },
    ],
    faqs: [
      {
        id: "faq-2",
        order: 2,
        questionEn: "Q2",
        questionUr: "س2",
        answerEn: "A2",
        answerUr: "ج2",
      },
      {
        id: "faq-1",
        order: 1,
        questionEn: "Q1",
        questionUr: "س1",
        answerEn: "A1",
        answerUr: "ج1",
      },
    ],
    guestEvents: [
      { eventId: "e2", seatsAllowed: 2 },
      { eventId: "e1", seatsAllowed: 2 },
    ],
    rsvps: [],
  };
}

describe("toInvitation", () => {
  it("includes only events the guest is invited to (tenant isolation)", () => {
    const invitation = toInvitation(baseInput());
    expect(invitation.events.map((event) => event.id)).toEqual(["e1", "e2"]);
  });

  it("drops invitations pointing at events outside the wedding", () => {
    const input = baseInput();
    input.guestEvents = [
      { eventId: "e1", seatsAllowed: 1 },
      { eventId: "does-not-exist", seatsAllowed: 1 },
    ];
    const invitation = toInvitation(input);
    expect(invitation.events.map((event) => event.id)).toEqual(["e1"]);
  });

  it("maps seatsAllowed per event (null = full family)", () => {
    const input = baseInput();
    input.guestEvents = [{ eventId: "e3", seatsAllowed: null }];
    const [event] = toInvitation(input).events;
    expect(event.seatsAllowed).toBeNull();
  });

  it("orders events, families (groom first) and faqs", () => {
    const invitation = toInvitation(baseInput());
    expect(invitation.events.map((event) => event.order)).toEqual([1, 2]);
    expect(invitation.families.map((family) => family.side)).toEqual([
      "groom",
      "bride",
    ]);
    expect(invitation.faqs.map((faq) => faq.order)).toEqual([1, 2]);
  });

  it("ignores malformed memberNames arrays", () => {
    const invitation = toInvitation(baseInput());
    const groom = invitation.families.find((family) => family.side === "groom");
    expect(groom?.memberNames).toEqual([]);
  });

  it("carries the guest's preferred language through", () => {
    expect(toInvitation(baseInput()).guest.lang).toBe("ur");
  });

  it("defaults event.rsvp to null when no response exists", () => {
    const invitation = toInvitation(baseInput());
    expect(invitation.events.every((event) => event.rsvp === null)).toBe(true);
  });

  it("attaches an existing RSVP to its event", () => {
    const input = baseInput();
    input.rsvps = [
      { eventId: "e2", status: "yes", seatsConfirmed: 2, dietaryNotes: null, message: "Hi" },
    ];
    const invitation = toInvitation(input);
    const baraat = invitation.events.find((event) => event.id === "e2");
    expect(baraat?.rsvp).toEqual({
      status: "yes",
      seatsConfirmed: 2,
      dietaryNotes: null,
      message: "Hi",
    });
  });
});
