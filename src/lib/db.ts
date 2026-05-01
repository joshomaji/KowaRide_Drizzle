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
 * still a placeholder, queries will throw a clear error. This allows the
 * dashboard to run with mock data until real Supabase credentials are provided.
 *
 * IMPORTANT: All heavy imports (postgres, drizzle-orm, schema) are done
 * dynamically only when a valid DATABASE_URL is detected. This prevents
 * the postgres driver from initiating any connection at module load time.
 *
 * @module db
 * @version 3.3.0 (Drizzle ORM — fully lazy, async-safe)
 * ============================================================================
 */

// ─── Connection Validation ──────────────────────────────────────────────────

const PLACEHOLDER_INDICATORS = ["[PROJECT_REF]", "[YOUR_DB_PASSWORD]", "YOUR_DB_PASSWORD"];

function isValidDatabaseUrl(url: string | undefined): url is string {
  if (!url) return false;
  return !PLACEHOLDER_INDICATORS.some((indicator) => url.includes(indicator));
}

// ─── Types ──────────────────────────────────────────────────────────────────

type DrizzleInstance = ReturnType<typeof import("drizzle-orm/postgres-js").drizzle>;
type PostgresClient = ReturnType<typeof import("postgres").default>;

// ─── Lazy Singleton ─────────────────────────────────────────────────────────

let _queryClient: PostgresClient | null = null;
let _db: DrizzleInstance | null = null;
let _initPromise: Promise<DrizzleInstance | null> | null = null;

async function createClient(): Promise<{ client: PostgresClient; db: DrizzleInstance } | null> {
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
    connect_timeout: 15,
  });

  return { client, db: drizzle(client, { schema }) };
}

/**
 * Initialize the database connection asynchronously.
 * Call this once at app startup (or in API routes) when DATABASE_URL is valid.
 * Returns the drizzle instance if successful, or null if URL is placeholder.
 *
 * This is the ONLY way to get a working db instance.
 * The `db` Proxy export will auto-initialize on first use.
 */
export async function initDb(): Promise<DrizzleInstance | null> {
  if (_db) return _db;

  // Prevent concurrent initialization
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const result = await createClient();
    if (!result) return null;

    _queryClient = result.client;
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
export const db = new Proxy({} as DrizzleInstance, {
  get(_target, prop, _receiver) {
    // Synchronous access — auto-initialize and throw helpful error if not ready
    if (!_db) {
      // Trigger async init in background
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
