/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Kit Configuration
 * ============================================================================
 *
 * Uses the pooled connection (port 6543) since direct connections
 * (port 5432) may not be available in all environments.
 * Drizzle Kit push works fine with PgBouncer in transaction mode.
 *
 * @module drizzle.config
 * @version 3.1.0 (Drizzle ORM)
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
