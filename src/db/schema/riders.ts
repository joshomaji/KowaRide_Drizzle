/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — Rider Profile
 * ============================================================================
 *
 * Rider-specific profile extending the base User.
 * Each rider reports to a FleetManager and may be assigned a BikeAsset.
 *
 * @module db/schema/riders
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  decimal,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { riderStatusEnum, unpaidDayActionEnum } from "./enums";
import { users } from "./users";
import { fleetManagers } from "./fleet-managers";
import { dailyPayments } from "./financials";

// ─── Table ───────────────────────────────────────────────────────────────────

export const riders = pgTable("riders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  riderId: text("rider_id").notNull().unique(),
  fleetManagerId: text("fleet_manager_id")
    .notNull()
    .references(() => fleetManagers.id),
  dailyPaymentAmount: decimal("daily_payment_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalPaidToDate: decimal("total_paid_to_date", { precision: 15, scale: 2 }).default("0").notNull(),
  paymentStreak: integer("payment_streak").default(0).notNull(),
  repaymentRate: decimal("repayment_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  hmoEnrolled: boolean("hmo_enrolled").default(false).notNull(),
  ownershipProgressMonths: integer("ownership_progress_months").default(0).notNull(),
  lastKnownLatitude: decimal("last_known_latitude", { precision: 9, scale: 6 }),
  lastKnownLongitude: decimal("last_known_longitude", { precision: 9, scale: 6 }),
  lastGpsPingAt: timestamp("last_gps_ping_at", { withTimezone: true }),
  accountBalance: decimal("account_balance", { precision: 12, scale: 2 }).default("0").notNull(),
  unpaidDays: integer("unpaid_days").default(0).notNull(),
  unpaidDayAction: unpaidDayActionEnum("unpaid_day_action").default("NONE").notNull(),
  status: riderStatusEnum("status").default("PENDING_ONBOARDING").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("riders_fleet_manager_id_idx").on(table.fleetManagerId),
  index("riders_status_idx").on(table.status),
  index("riders_rider_id_idx").on(table.riderId),
]);

// ─── Relations ───────────────────────────────────────────────────────────────

export const ridersRelations = relations(riders, ({ one, many }) => ({
  user: one(users, {
    fields: [riders.userId],
    references: [users.id],
  }),
  fleetManager: one(fleetManagers, {
    fields: [riders.fleetManagerId],
    references: [fleetManagers.id],
  }),
  assignedBike: one(bikeAssets, {
    fields: [riders.id],
    references: [bikeAssets.assignedRiderId],
    relationName: "RiderAssignedBike",
  }),
  dailyPayments: many(dailyPayments),
}));

// Import bikeAssets here to avoid circular dependency — resolved by Drizzle at runtime
import { bikeAssets } from "./fleet";
