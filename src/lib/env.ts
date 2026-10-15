import { z } from "zod";

/**
 * Server-side environment contract. Validated once at import time so a
 * misconfigured deployment fails fast instead of at the first request.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.url("DATABASE_URL must be a valid connection string"),

  /** Used to sign the httpOnly admin session cookie. */
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),

  /** Wildcard root domain, e.g. "mydomain.com" (no scheme). */
  APP_ROOT_DOMAIN: z.string().min(1).default("localhost:3000"),

  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

  /** Vercel Blob read/write token (uploads). Optional in phase 1. */
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  /** Public base URL used for storage of uploads (Supabase/Vercel Blob). */
  STORAGE_PUBLIC_BASE_URL: z.url().optional(),

  /** Serve invitation fixtures without a database (local dev / demos). */
  INVITATION_DEMO: z.string().optional(),

  RSVP_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(10),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
export type Env = typeof env;
