/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle ORM — Database Client
 * ============================================================================
 *
 * PostgreSQL connection via the `postgres` driver with Drizzle ORM.
 * Uses pooled connection for queries and direct connection for migrations.
 *
 * @module db
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ─── Connection Setup ────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL!;

/**
 * Pooled postgres client for runtime queries.
 * In Supabase, this uses PgBouncer (port 6543) for connection pooling.
 */
const queryClient = postgres(connectionString, {
  // Prepare mode works with PgBouncer transaction mode
  prepare: false,
  // Connection pool settings
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

/**
 * Drizzle ORM database instance with full schema awareness.
 *
 * Usage:
 * ```typescript
 * import { db } from "@/lib/db";
 * import { users } from "@/db/schema";
 * import { eq } from "drizzle-orm";
 *
 * const allUsers = await db.select().from(users);
 * const user = await db.select().from(users).where(eq(users.email, "admin@kowa.ng"));
 * ```
 */
export const db = drizzle(queryClient, { schema });

/**
 * Direct postgres client for admin operations (migrations, DDL).
 * Uses DIRECT_URL (port 5432) which bypasses PgBouncer.
 */
export const getDirectClient = () => {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    throw new Error("DIRECT_URL environment variable is required for admin operations");
  }
  const directClient = postgres(directUrl, {
    max: 1,
    prepare: true,
  });
  return drizzle(directClient, { schema });
};
