/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Kit Configuration
 * ============================================================================
 *
 * Configuration for `drizzle-kit` CLI commands:
 *   - drizzle-kit generate   → Generate SQL migration files
 *   - drizzle-kit push       → Push schema directly to database
 *   - drizzle-kit studio     → Open Drizzle Studio (DB GUI)
 *   - drizzle-kit migrate    → Run pending migrations
 *
 * @module drizzle.config
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
