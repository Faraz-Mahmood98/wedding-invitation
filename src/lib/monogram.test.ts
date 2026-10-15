import { describe, expect, it } from "vitest";
import { initialsFromCoupleName } from "./monogram";

describe("initialsFromCoupleName", () => {
  it("splits ampersand names", () => {
    expect(initialsFromCoupleName("Ahmad & Mawra")).toEqual(["A", "M"]);
  });

  it("splits 'and' names", () => {
    expect(initialsFromCoupleName("Ahmad and Mawra")).toEqual(["A", "M"]);
  });

  it("splits Urdu names", () => {
    expect(initialsFromCoupleName("احمد اور ماورہ")).toEqual(["ا", "م"]);
  });

  it("falls back to the first character when no separator exists", () => {
    expect(initialsFromCoupleName("AhmadMawra")).toEqual(["A"]);
  });

  it("ignores extra whitespace around separators", () => {
    expect(initialsFromCoupleName("  Zahra   &   Hamza ")).toEqual(["Z", "H"]);
  });

  it("handles an empty name", () => {
    expect(initialsFromCoupleName("")).toEqual(["♥"]);
  });

  it("handles whitespace-only names", () => {
    expect(initialsFromCoupleName("   ")).toEqual(["♥"]);
  });

  it("does not split a name that merely contains the Urdu word-joiner", () => {
    expect(initialsFromCoupleName("ماورہ")).toEqual(["م"]);
  });

  it("joins ampersands without spaces", () => {
    expect(initialsFromCoupleName("Ahmad&Mawra")).toEqual(["A", "M"]);
  });
});
