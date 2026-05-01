/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — Barrel Export
 * ============================================================================
 *
 * Central export point for all Drizzle schema tables and relations.
 * Import from here: `import { users, riders, ... } from "@/db/schema";`
 *
 * @module db/schema
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

// ─── Enums ───────────────────────────────────────────────────────────────────
export * from "./enums";

// ─── Tables & Relations ──────────────────────────────────────────────────────
export * from "./users";
export * from "./riders";
export * from "./fleet-managers";
export * from "./fleet-owners";
export * from "./fleet";
export * from "./financials";
export * from "./risk";
export * from "./system";
