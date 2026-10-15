import { describe, expect, it } from "vitest";
import {
  eventSchema,
  newWeddingSchema,
  parseGuestCsv,
  passwordResetSchema,
  rsvpSchema,
  slugify,
  superWeddingUpdateSchema,
  weddingSettingsSchema,
  zipMembers,
} from "./validation";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Imran Ali")).toBe("imran-ali");
  });

  it("strips punctuation and trims hyphens", () => {
    expect(slugify("  Dr. Bilal & Fatima  ")).toBe("dr-bilal-fatima");
  });

  it("falls back to a generated slug when nothing remains", () => {
    expect(slugify("مہندی")).toMatch(/^guest-/);
  });
});

describe("zipMembers", () => {
  it("zips parallel en/ur lists", () => {
    expect(zipMembers("A, B", "الف, ب")).toEqual([
      { en: "A", ur: "الف" },
      { en: "B", ur: "ب" },
    ]);
  });

  it("drops empty pairs and tolerates mismatched lengths", () => {
    expect(zipMembers("A", "")).toEqual([{ en: "A", ur: "" }]);
    expect(zipMembers("", "")).toEqual([]);
  });
});

describe("rsvpSchema", () => {
  it("coerces seats and trims empty optional text to undefined", () => {
    const parsed = rsvpSchema.parse({
      weddingSlug: "w",
      guestSlug: "g",
      eventId: "e",
      status: "yes",
      seatsConfirmed: "2",
      dietaryNotes: "",
      message: "",
    });
    expect(parsed.seatsConfirmed).toBe(2);
    expect(parsed.dietaryNotes).toBeUndefined();
  });

  it("rejects an unknown status", () => {
    expect(
      rsvpSchema.safeParse({
        weddingSlug: "w",
        guestSlug: "g",
        eventId: "e",
        status: "perhaps",
      }).success,
    ).toBe(false);
  });
});

describe("eventSchema", () => {
  const valid = {
    order: "1",
    titleEn: "Mehendi",
    titleUr: "مہندی",
    date: "2026-12-04",
    startTime: "19:00",
    venueName: "Marquee",
    address: "Lahore",
  };

  it("accepts a valid event", () => {
    expect(eventSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a bad date format", () => {
    expect(eventSchema.safeParse({ ...valid, date: "04-12-2026" }).success).toBe(false);
  });
});

describe("weddingSettingsSchema", () => {
  const base = {
    coupleNameEn: "A & B",
    coupleNameUr: "ا اور ب",
    defaultLang: "en",
    timezone: "Asia/Karachi",
    personalMessageEn: "",
    personalMessageUr: "",
    blush: "#ffffff",
    cream: "#fff8f3",
    rose: "#d98e8e",
    deepRose: "#a8505a",
    gold: "#c9a35b",
    ink: "#4a2c2f",
  };

  it("parses a checkbox 'on' as true", () => {
    expect(weddingSettingsSchema.parse({ ...base, bismillahEnabled: "on" }).bismillahEnabled).toBe(
      true,
    );
  });

  it("rejects a non-hex colour", () => {
    expect(weddingSettingsSchema.safeParse({ ...base, gold: "gold" }).success).toBe(false);
  });
});

describe("parseGuestCsv", () => {
  it("parses a header row with event invites", () => {
    const csv = [
      "name_en,name_ur,type,phone,lang,slug,events",
      "Ali Khan,علی خان,couple,03001234567,ur,ali-khan,1:2;3:full",
    ].join("\n");

    const [row] = parseGuestCsv(csv);
    expect(row.displayNameEn).toBe("Ali Khan");
    expect(row.displayNameUr).toBe("علی خان");
    expect(row.type).toBe("couple");
    expect(row.lang).toBe("ur");
    expect(row.slug).toBe("ali-khan");
    expect(row.events).toEqual([
      { order: 1, seats: 2 },
      { order: 3, seats: null },
    ]);
  });

  it("defaults missing columns and skips blanks", () => {
    const csv = ["name_en", "Sara", "", "  "].join("\n");
    const rows = parseGuestCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe("single");
    expect(rows[0].slug).toBe("sara");
  });
});

describe("media URLs in weddingSettingsSchema", () => {
  const base = {
    coupleNameEn: "A & B",
    coupleNameUr: "X",
    timezone: "Asia/Karachi",
    bismillahEnabled: "on",
    blush: "#ffffff",
    cream: "#fff8f3",
    rose: "#d98e8e",
    deepRose: "#a8505a",
    gold: "#c9a35b",
    ink: "#4a2c2f",
  };

  it("keeps https and site-relative paths", () => {
    const parsed = weddingSettingsSchema.parse({
      ...base,
      openingImage: "https://images.unsplash.com/photo-1",
      musicUrl: "/uploads/2026/01/song.mp3",
    });
    expect(parsed.openingImage).toBe("https://images.unsplash.com/photo-1");
    expect(parsed.musicUrl).toBe("/uploads/2026/01/song.mp3");
  });

  it("drops unsafe or malformed values to empty", () => {
    const parsed = weddingSettingsSchema.parse({
      ...base,
      openingImage: "javascript:alert(1)",
      musicUrl: "data:text/html;base64,xx",
    });
    expect(parsed.openingImage).toBe("");
    expect(parsed.musicUrl).toBe("");
  });
});

describe("newWeddingSchema", () => {
  const valid = {
    coupleNameEn: "Imran & Zara",
    coupleNameUr: "X",
    adminEmail: "Admin@Example.COM",
    password: "supersecret",
  };

  it("lowercases the email and derives a slug", () => {
    const parsed = newWeddingSchema.parse({ ...valid, slug: "Imran & Zara" });
    expect(parsed.adminEmail).toBe("admin@example.com");
    expect(parsed.slug).toBe("imran-zara");
  });

  it("leaves slug blank when omitted so the action can derive it", () => {
    expect(newWeddingSchema.parse(valid).slug).toBe("");
  });

  it("rejects short passwords", () => {
    expect(newWeddingSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });

  it("rejects invalid emails", () => {
    expect(newWeddingSchema.safeParse({ ...valid, adminEmail: "nope" }).success).toBe(false);
  });
});

describe("superWeddingUpdateSchema", () => {
  it("slugifies the provided slug", () => {
    const parsed = superWeddingUpdateSchema.parse({
      coupleNameEn: "A",
      coupleNameUr: "B",
      slug: "My Wedding!",
      adminEmail: "a@b.com",
    });
    expect(parsed.slug).toBe("my-wedding");
    expect(parsed.adminEmail).toBe("a@b.com");
  });

  it("rejects a blank slug", () => {
    expect(
      superWeddingUpdateSchema.safeParse({
        coupleNameEn: "A",
        coupleNameUr: "B",
        slug: "",
        adminEmail: "a@b.com",
      }).success,
    ).toBe(false);
  });
});

describe("passwordResetSchema", () => {
  it("accepts eight or more characters", () => {
    expect(passwordResetSchema.safeParse({ password: "12345678" }).success).toBe(true);
  });

  it("rejects shorter passwords", () => {
    expect(passwordResetSchema.safeParse({ password: "1234567" }).success).toBe(false);
  });
});
