/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Prisma Database Client
 * ============================================================================
 *
 * Singleton Prisma client configured for Supabase PostgreSQL.
 * Uses the global pattern to prevent multiple client instances during
 * hot module reloading in development.
 *
 * Connection details:
 * - DATABASE_URL: Pooled connection via PgBouncer (port 6543) for runtime queries
 * - DIRECT_URL: Direct connection (port 5432) for Prisma Migrate operations
 *
 * @module lib/db
 * @version 2.0.0
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
