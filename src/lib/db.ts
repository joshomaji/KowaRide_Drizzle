/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle ORM — Database Client (node-postgres)
 * ============================================================================
 *
 * PostgreSQL connection via the `pg` driver with Drizzle ORM.
 * Uses pooled connection for queries (port 6543 via PgBouncer).
 *
 * Uses node-postgres (pg) instead of postgres.js for better compatibility
 * with Next.js Turbopack runtime.
 *
 * @module db
 * @version 5.0.0 (Drizzle ORM — node-postgres driver)
 * ============================================================================
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

// ─── Connection Validation ──────────────────────────────────────────────────

const PLACEHOLDER_INDICATORS = ["[PROJECT_REF]", "[YOUR_DB_PASSWORD]", "YOUR_DB_PASSWORD"];

function isValidDatabaseUrl(url: string | undefined): url is string {
  if (!url) return false;
  if (PLACEHOLDER_INDICATORS.some((indicator) => url.includes(indicator))) return false;
  // Reject SQLite file: URLs (stale env var from old Prisma setup)
  if (url.startsWith("file:")) return false;
  return true;
}

// ─── Lazy Singleton ─────────────────────────────────────────────────────────

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;
let _initPromise: Promise<ReturnType<typeof drizzle> | null> | null = null;

async function createClient(): Promise<{ pool: Pool; db: ReturnType<typeof drizzle> } | null> {
  const url = process.env.DATABASE_URL;
  if (!isValidDatabaseUrl(url)) {
    console.warn("[DB] No valid DATABASE_URL found — running without database.");
    return null;
  }

  console.log("[DB] Creating PostgreSQL connection pool (node-postgres)...");

  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Quick connectivity test
  try {
    const client = await pool.connect();
    await client.query("SELECT 1 as health_check");
    client.release();
    console.log("[DB] ✅ Database connection established successfully.");
  } catch (err: any) {
    console.error("[DB] ❌ Database health check failed:", err?.message || err);
  }

  const db = drizzle(pool, { schema });

  return { pool, db };
}

/**
 * Initialize the database connection asynchronously.
 * Call this once at app startup (or in API routes) when DATABASE_URL is valid.
 * Returns the drizzle instance if successful, or null if URL is placeholder.
 */
export async function initDb(): Promise<ReturnType<typeof drizzle> | null> {
  if (_db) return _db;

  // Prevent concurrent initialization
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const result = await createClient();
    if (!result) return null;

    _pool = result.pool;
    _db = result.db;
    return _db;
  })();

  return _initPromise;
}

/**
 * Check if the database connection is available.
 * Useful for conditionally switching between mock and real data.
 */
export function isDbConnected(): boolean {
  return isValidDatabaseUrl(process.env.DATABASE_URL);
}

/**
 * Drizzle ORM database instance.
 *
 * Uses a Proxy to lazily initialize the connection on first method call.
 * On first access, it calls initDb() to establish the connection.
 *
 * Usage in API routes (recommended):
 * ```typescript
 * import { initDb } from "@/lib/db";
 * const db = await initDb();
 * if (!db) { /* handle no DB *\/ }
 * const users = await db.select().from(usersTable);
 * ```
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, _receiver) {
    if (!_db) {
      initDb().catch(() => {});
      throw new Error(
        "Database not yet initialized. Use `const db = await initDb()` in async contexts, " +
        "or check isDbConnected() before accessing db."
      );
    }
    const value = (_db as any)[prop];
    if (typeof value === "function") {
      return value.bind(_db);
    }
    return value;
  },
});
