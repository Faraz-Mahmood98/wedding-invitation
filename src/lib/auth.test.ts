import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-value-1234567890";
});

async function loadAuth() {
  return import("./auth");
}

describe("session tokens", () => {
  it("round-trips a signed session", async () => {
    const { signSession, verifySession } = await loadAuth();
    const token = signSession({
      sub: "u1",
      email: "admin@example.com",
      role: "wedding_admin",
      weddingId: "w1",
    });
    const parsed = verifySession(token);
    expect(parsed?.email).toBe("admin@example.com");
    expect(parsed?.role).toBe("wedding_admin");
    expect(parsed?.weddingId).toBe("w1");
  });

  it("rejects a tampered payload", async () => {
    const { signSession, verifySession } = await loadAuth();
    const token = signSession({
      sub: "u1",
      email: "admin@example.com",
      role: "wedding_admin",
      weddingId: "w1",
    });
    const [data, signature] = token.split(".");
    const forged = `${Buffer.from('{"sub":"hacker"}').toString("base64url")}.${signature}`;
    expect(data).toBeTruthy();
    expect(verifySession(forged)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const { signSession, verifySession } = await loadAuth();
    const token = signSession({ sub: "u1", email: "a@b.c", role: "super_admin", weddingId: null });
    process.env.AUTH_SECRET = "another-secret-0000000000000000";
    expect(verifySession(token)).toBeNull();
    process.env.AUTH_SECRET = "test-secret-value-1234567890";
  });

  it("rejects an expired token", async () => {
    const { signSession, verifySession } = await loadAuth();
    const token = signSession(
      { sub: "u1", email: "a@b.c", role: "super_admin", weddingId: null },
      -1,
    );
    expect(verifySession(token)).toBeNull();
  });

  it("returns null for missing or malformed tokens", async () => {
    const { verifySession } = await loadAuth();
    expect(verifySession(null)).toBeNull();
    expect(verifySession("garbage")).toBeNull();
  });
});
