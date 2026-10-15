import { describe, expect, it } from "vitest";
import { pick } from "./types";
import { seatLabelKey } from "./invitation";

describe("pick", () => {
  it("returns the requested locale", () => {
    expect(pick({ en: "Hello", ur: "ہیلو" }, "ur")).toBe("ہیلو");
  });

  it("falls back to English when the locale is empty", () => {
    expect(pick({ en: "Hello", ur: "  " }, "ur")).toBe("Hello");
  });

  it("returns empty string for nullish input", () => {
    expect(pick(null, "en")).toBe("");
    expect(pick(undefined, "ur")).toBe("");
  });
});

describe("seatLabelKey", () => {
  it("maps each guest type to its seat-label key", () => {
    expect(seatLabelKey("single")).toBe("single");
    expect(seatLabelKey("couple")).toBe("couple");
    expect(seatLabelKey("family")).toBe("family");
  });
});
