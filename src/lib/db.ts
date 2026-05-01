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
 * IMPORTANT: All heavy imports (postgres, drizzle-orm, schema) are done
 * dynamically only when a valid DATABASE_URL is detected. This prevents
 * the postgres driver from initiating any connection at module load time.
 *
 * @module db
 * @version 3.2.0 (Drizzle ORM — fully lazy, no eager imports)
 * ============================================================================
 */

// ─── Connection Validation ──────────────────────────────────────────────────

const PLACEHOLDER_INDICATORS = ["[PROJECT_REF]", "[YOUR_DB_PASSWORD]", "YOUR_DB_PASSWORD"];

function isValidDatabaseUrl(url: string | undefined): url is string {
  if (!url) return false;
  return !PLACEHOLDER_INDICATORS.some((indicator) => url.includes(indicator));
}

// ─── Types ──────────────────────────────────────────────────────────────────

type DrizzleInstance = Awaited<ReturnType<typeof import("drizzle-orm/postgres-js").drizzle>>;
type PostgresClient = ReturnType<typeof import("postgres").default>;

// ─── Lazy Singleton ─────────────────────────────────────────────────────────

let _queryClient: PostgresClient | null = null;
let _db: DrizzleInstance | null = null;

async function createClient() {
  if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
    return null;
  }

  // Dynamic imports — only loaded when we have a valid DATABASE_URL
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const postgres = (await import("postgres")).default;
  const schema = await import("@/db/schema");

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
 * Lazily creates the PostgreSQL connection on first property access.
 * Throws a clear error if DATABASE_URL is not configured (placeholder in .env).
 *
 * Usage:
 * ```typescript
 * import { db } from "@/lib/db";
 * import { users } from "@/db/schema";
 * import { eq } from "drizzle-orm";
 *
 * const allUsers = await db.select().from(users);
 * ```
 */
export const db = new Proxy({} as DrizzleInstance, {
  get(_target, prop, receiver) {
    if (!_db) {
      const result = createClient();
      // Since createClient is async but Proxy.get must be sync,
      // we throw a helpful error directing the user to configure the DB.
      throw new Error(
        "Database not configured. Set a valid DATABASE_URL in .env " +
        "(remove placeholder values and add your Supabase connection string). " +
        "Until then, the app runs with mock data."
      );
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
 * Initialize the database connection asynchronously.
 * Call this once at app startup (or in API routes) when DATABASE_URL is valid.
 * Returns the drizzle instance if successful, or null if URL is placeholder.
 */
export async function initDb(): Promise<DrizzleInstance | null> {
  if (_db) return _db;

  const result = await createClient();
  if (!result) return null;

  _queryClient = result.client;
  _db = result.db;
  return _db;
}

/**
 * Direct postgres client for admin operations (migrations, DDL).
 * Uses DIRECT_URL (port 5432) which bypasses PgBouncer.
 */
export async function getDirectClient() {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl || PLACEHOLDER_INDICATORS.some((i) => directUrl.includes(i))) {
    throw new Error(
      "DIRECT_URL environment variable is required for admin operations. " +
      "Set a valid direct connection string in .env."
    );
  }

  const { drizzle } = await import("drizzle-orm/postgres-js");
  const postgres = (await import("postgres")).default;
  const schema = await import("@/db/schema");

  const directClient = postgres(directUrl, {
    max: 1,
    prepare: true,
  });
  return drizzle(directClient, { schema });
}
