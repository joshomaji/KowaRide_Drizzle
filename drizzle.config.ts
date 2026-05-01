/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Kit Configuration
 * ============================================================================
 *
 * Uses the pooled connection (port 6543) for schema introspection.
 * The direct connection (port 5432) may not be available in all environments.
 *
 * IMPORTANT: If a stale DATABASE_URL (e.g., file: SQLite path) is set in the
 * system environment, it will override the .env file value. Always ensure
 * the correct PostgreSQL URL is active before running drizzle-kit commands.
 *
 * @module drizzle.config
 * @version 5.1.0 (Drizzle ORM — node-postgres)
 * ============================================================================
 */

import { defineConfig } from "drizzle-kit";

// Resolve the correct DATABASE_URL — prefer .env over system env if system env is a file: URL
const systemUrl = process.env.DATABASE_URL;
const isFileUrl = systemUrl?.startsWith("file:");

// If system env is a stale SQLite path, don't use it (drizzle-kit will read .env)
const dbUrl = isFileUrl ? undefined : systemUrl;

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: dbUrl
    ? { url: dbUrl }
    : {
        // drizzle-kit reads .env automatically when url is not provided
        url: process.env.DATABASE_URL!,
      },
  verbose: true,
  strict: true,
});
