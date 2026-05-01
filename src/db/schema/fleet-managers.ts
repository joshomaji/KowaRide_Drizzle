/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — Fleet Manager Profile
 * ============================================================================
 *
 * Fleet Manager profile with performance metrics and portfolio data.
 * Each FleetManager belongs to a FleetOwner and manages riders + bikes.
 *
 * @module db/schema/fleet-managers
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { performanceTierEnum } from "./enums";
import { users } from "./users";
import { fleetOwners } from "./fleet-owners";

// ─── Table ───────────────────────────────────────────────────────────────────

export const fleetManagers = pgTable("fleet_managers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  managerId: text("manager_id").notNull().unique(),
  tier: performanceTierEnum("tier").default("BRONZE").notNull(),
  performanceScore: integer("performance_score").default(0).notNull(),
  totalBikesAssigned: integer("total_bikes_assigned").default(0).notNull(),
  activeRiders: integer("active_riders").default(0).notNull(),
  portfolioRepaymentRate: decimal("portfolio_repayment_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  utilizationRate: decimal("utilization_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  incidentCount30d: integer("incident_count_30d").default(0).notNull(),
  monthlyFee: decimal("monthly_fee", { precision: 12, scale: 2 }).default("0").notNull(),
  fleetOwnerId: text("fleet_owner_id")
    .notNull()
    .references(() => fleetOwners.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("fleet_managers_fleet_owner_id_idx").on(table.fleetOwnerId),
  index("fleet_managers_tier_idx").on(table.tier),
]);

// ─── Relations ───────────────────────────────────────────────────────────────

export const fleetManagersRelations = relations(fleetManagers, ({ one, many }) => ({
  user: one(users, {
    fields: [fleetManagers.userId],
    references: [users.id],
  }),
  fleetOwner: one(fleetOwners, {
    fields: [fleetManagers.fleetOwnerId],
    references: [fleetOwners.id],
  }),
  riders: many(riders),
  bikes: many(bikeAssets),
}));

// Late imports for circular dependency resolution
import { riders } from "./riders";
import { bikeAssets } from "./fleet";
