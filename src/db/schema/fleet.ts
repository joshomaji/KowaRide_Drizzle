/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — Fleet / Bike Assets & Maintenance
 * ============================================================================
 *
 * Bike asset records with GPS tracking, maintenance scheduling,
 * and lifecycle management.
 *
 * @module db/schema/fleet
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
import { assetStatusEnum } from "./enums";
import { fleetManagers } from "./fleet-managers";
import { fleetOwners } from "./fleet-owners";

// ─── Bike Assets ─────────────────────────────────────────────────────────────

export const bikeAssets = pgTable("bike_assets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  assetId: text("asset_id").notNull().unique(),
  makeModel: text("make_model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  plateNumber: text("plate_number").notNull().unique(),
  vinNumber: text("vin_number").notNull().unique(),
  status: assetStatusEnum("status").default("ACTIVE").notNull(),
  assignedRiderId: text("assigned_rider_id").unique(),
  fleetManagerId: text("fleet_manager_id")
    .notNull()
    .references(() => fleetManagers.id),
  fleetOwnerId: text("fleet_owner_id")
    .notNull()
    .references(() => fleetOwners.id),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).default("0").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).default("0").notNull(),
  odometerKm: integer("odometer_km").default(0).notNull(),
  lastGpsLatitude: decimal("last_gps_latitude", { precision: 9, scale: 6 }),
  lastGpsLongitude: decimal("last_gps_longitude", { precision: 9, scale: 6 }),
  lastGpsSpeed: decimal("last_gps_speed", { precision: 6, scale: 1 }),
  lastGpsPingAt: timestamp("last_gps_ping_at", { withTimezone: true }),
  maintenanceCount: integer("maintenance_count").default(0).notNull(),
  lastMaintenanceDate: timestamp("last_maintenance_date", { withTimezone: true }),
  nextMaintenanceDate: timestamp("next_maintenance_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("bike_assets_status_idx").on(table.status),
  index("bike_assets_fleet_manager_id_idx").on(table.fleetManagerId),
  index("bike_assets_fleet_owner_id_idx").on(table.fleetOwnerId),
]);

// ─── Bike Maintenance Records ────────────────────────────────────────────────

export const bikeMaintenanceRecords = pgTable("bike_maintenance_records", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  bikeId: text("bike_id")
    .notNull()
    .references(() => bikeAssets.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 12, scale: 2 }).notNull(),
  vendorName: text("vendor_name").notNull(),
  performedAt: timestamp("performed_at", { withTimezone: true }).notNull(),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("bike_maintenance_records_bike_id_idx").on(table.bikeId),
]);

// ─── Relations ───────────────────────────────────────────────────────────────

export const bikeAssetsRelations = relations(bikeAssets, ({ one, many }) => ({
  assignedRider: one(ridersLate, {
    fields: [bikeAssets.assignedRiderId],
    references: [ridersLate.id],
    relationName: "RiderAssignedBike",
  }),
  fleetManager: one(fleetManagers, {
    fields: [bikeAssets.fleetManagerId],
    references: [fleetManagers.id],
  }),
  fleetOwner: one(fleetOwners, {
    fields: [bikeAssets.fleetOwnerId],
    references: [fleetOwners.id],
  }),
  maintenanceRecords: many(bikeMaintenanceRecords),
  alerts: many(systemAlertsLate),
}));

export const bikeMaintenanceRecordsRelations = relations(bikeMaintenanceRecords, ({ one }) => ({
  bike: one(bikeAssets, {
    fields: [bikeMaintenanceRecords.bikeId],
    references: [bikeAssets.id],
  }),
}));

// Late imports for circular dependency resolution
import { riders as ridersLate } from "./riders";
import { systemAlerts as systemAlertsLate } from "./risk";
