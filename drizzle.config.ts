/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Kit Configuration
 * ============================================================================
 *
 * Uses the pooled connection (port 6543) for schema operations.
 * Direct connection (port 5432) is not accessible from all environments.
 *
 * @module drizzle.config
 * @version 5.2.0 (Drizzle ORM — node-postgres)
 * ============================================================================
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true,
  },
  verbose: true,
  strict: true,
});
