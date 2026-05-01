/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — Fleet Owner Profile
 * ============================================================================
 *
 * Fleet Owner profile with asset portfolio and ROI tracking.
 * Owns bikes and receives periodic payouts.
 *
 * @module db/schema/fleet-owners
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
import { users } from "./users";

// ─── Fleet Owner ─────────────────────────────────────────────────────────────

export const fleetOwners = pgTable("fleet_owners", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  ownerId: text("owner_id").notNull().unique(),
  totalBikes: integer("total_bikes").default(0).notNull(),
  activeBikes: integer("active_bikes").default(0).notNull(),
  totalRoi: decimal("total_roi", { precision: 5, scale: 2 }).default("0").notNull(),
  monthlyRoi: decimal("monthly_roi", { precision: 5, scale: 2 }).default("0").notNull(),
  pendingPayout: decimal("pending_payout", { precision: 15, scale: 2 }).default("0").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 15, scale: 2 }).default("0").notNull(),
  avgActiveDaysPerWeek: decimal("avg_active_days_per_week", { precision: 3, scale: 1 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("fleet_owners_owner_id_idx").on(table.ownerId),
]);

// ─── Owner Bank Details ──────────────────────────────────────────────────────

export const ownerBankDetails = pgTable("owner_bank_details", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  fleetOwnerId: text("fleet_owner_id")
    .notNull()
    .unique()
    .references(() => fleetOwners.id, { onDelete: "cascade" }),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const fleetOwnersRelations = relations(fleetOwners, ({ one, many }) => ({
  user: one(users, {
    fields: [fleetOwners.userId],
    references: [users.id],
  }),
  bankDetail: one(ownerBankDetails, {
    fields: [fleetOwners.id],
    references: [ownerBankDetails.fleetOwnerId],
  }),
  fleetManagers: many(fleetManagersLate),
  bikes: many(bikeAssetsLate),
  payouts: many(payoutSummariesLate),
}));

export const ownerBankDetailsRelations = relations(ownerBankDetails, ({ one }) => ({
  fleetOwner: one(fleetOwners, {
    fields: [ownerBankDetails.fleetOwnerId],
    references: [fleetOwners.id],
  }),
}));

// Late imports for circular dependency resolution
import { fleetManagers as fleetManagersLate } from "./fleet-managers";
import { bikeAssets as bikeAssetsLate } from "./fleet";
import { payoutSummaries as payoutSummariesLate } from "./financials";
