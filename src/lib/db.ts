/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle ORM — Database Client
 * ============================================================================
 *
 * PostgreSQL connection via the `postgres` driver with Drizzle ORM.
 * Uses pooled connection for queries and direct connection for migrations.
 *
 * The connection is lazily initialized — if DATABASE_URL is not set or is
 * still a placeholder, the db object will still be exported but queries
 * will throw a clear error. This allows the dashboard to run with mock
 * data during development until real Supabase credentials are provided.
 *
 * @module db
 * @version 3.1.0 (Drizzle ORM — lazy connection)
 * ============================================================================
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// ─── Connection Validation ──────────────────────────────────────────────────

const PLACEHOLDER_INDICATORS = ["[PROJECT_REF]", "[YOUR_DB_PASSWORD]", "YOUR_DB_PASSWORD"];

function isValidDatabaseUrl(url: string | undefined): url is string {
  if (!url) return false;
  return !PLACEHOLDER_INDICATORS.some((indicator) => url.includes(indicator));
}

// ─── Lazy Singleton ─────────────────────────────────────────────────────────

let _queryClient: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function createClient() {
  if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
    return null;
  }

  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return { client, db: drizzle(client, { schema }) };
}

/**
 * Drizzle ORM database instance with full schema awareness.
 *
 * Lazily creates the PostgreSQL connection on first access.
 * Returns `null` if DATABASE_URL is not configured (placeholder in .env).
 *
 * Usage:
 * ```typescript
 * import { db } from "@/lib/db";
 * import { users } from "@/db/schema";
 * import { eq } from "drizzle-orm";
 *
 * if (!db) throw new Error("Database not configured");
 * const allUsers = await db.select().from(users);
 * ```
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    if (!_db) {
      const result = createClient();
      if (!result) {
        throw new Error(
          "Database not configured. Set a valid DATABASE_URL in .env " +
          "(remove placeholder values and add your Supabase connection string)."
        );
      }
      _queryClient = result.client;
      _db = result.db;
    }
    return Reflect.get(_db, prop, receiver);
  },
});

/**
 * Check if the database connection is available.
 * Useful for conditionally switching between mock and real data.
 */
export function isDbConnected(): boolean {
  return isValidDatabaseUrl(process.env.DATABASE_URL);
}

/**
 * Direct postgres client for admin operations (migrations, DDL).
 * Uses DIRECT_URL (port 5432) which bypasses PgBouncer.
 */
export const getDirectClient = () => {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl || PLACEHOLDER_INDICATORS.some((i) => directUrl.includes(i))) {
    throw new Error(
      "DIRECT_URL environment variable is required for admin operations. " +
      "Set a valid direct connection string in .env."
    );
  }
  const directClient = postgres(directUrl, {
    max: 1,
    prepare: true,
  });
  return drizzle(directClient, { schema });
};
