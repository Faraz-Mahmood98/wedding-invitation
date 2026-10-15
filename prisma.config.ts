import path from "node:path";
import { defineConfig } from "prisma/config";

// A Prisma config file disables Prisma's implicit .env loading, so load it
// ourselves (Node >= 20.12). Missing file is fine on CI/Vercel where real env
// vars are injected.
try {
  process.loadEnvFile?.(path.join(process.cwd(), ".env"));
} catch {
  // no .env file present — rely on process environment
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
