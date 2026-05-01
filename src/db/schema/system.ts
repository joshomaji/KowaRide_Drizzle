/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — System Config, KPI Snapshots, Chart Data, Activity Feed
 * ============================================================================
 *
 * Supporting tables for configuration, analytics caching, and activity feed.
 *
 * @module db/schema/system
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
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { configTypeEnum, configCategoryEnum } from "./enums";

// ─── System Configuration ────────────────────────────────────────────────────

export const systemConfigs = pgTable("system_configs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  value: text("value").notNull(),
  type: configTypeEnum("type").notNull(),
  category: configCategoryEnum("category").notNull(),
  isEditable: boolean("is_editable").default(true).notNull(),
  lastModifiedAt: timestamp("last_modified_at", { withTimezone: true }).defaultNow().notNull(),
  lastModifiedBy: text("last_modified_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("system_configs_category_idx").on(table.category),
  index("system_configs_key_idx").on(table.key),
]);

// ─── Platform KPI Snapshots ──────────────────────────────────────────────────

export const platformKpiSnapshots = pgTable("platform_kpi_snapshots", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  totalRiders: integer("total_riders").notNull(),
  activeRiders: integer("active_riders").notNull(),
  totalFleetManagers: integer("total_fleet_managers").notNull(),
  totalFleetOwners: integer("total_fleet_owners").notNull(),
  totalBikes: integer("total_bikes").notNull(),
  activeBikes: integer("active_bikes").notNull(),
  fleetUtilizationRate: decimal("fleet_utilization_rate", { precision: 5, scale: 2 }).notNull(),
  avgRepaymentRate: decimal("avg_repayment_rate", { precision: 5, scale: 2 }).notNull(),
  todayRevenue: decimal("today_revenue", { precision: 15, scale: 2 }).notNull(),
  monthlyRevenue: decimal("monthly_revenue", { precision: 15, scale: 2 }).notNull(),
  totalOutstandingPayments: decimal("total_outstanding_payments", { precision: 15, scale: 2 }).notNull(),
  unresolvedAlerts: integer("unresolved_alerts").notNull(),
  criticalRiskItems: integer("critical_risk_items").notNull(),
  pendingPayouts: decimal("pending_payouts", { precision: 15, scale: 2 }).notNull(),
  snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("platform_kpi_snapshots_snapshot_date_idx").on(table.snapshotDate),
]);

// ─── Chart Data Points ───────────────────────────────────────────────────────

export const chartDataPoints = pgTable("chart_data_points", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  chartType: text("chart_type").notNull(),
  label: text("label").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  secondaryValue: decimal("secondary_value", { precision: 15, scale: 2 }),
  period: text("period").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("chart_data_points_chart_type_idx").on(table.chartType),
  index("chart_data_points_period_idx").on(table.period),
  index("chart_data_points_recorded_at_idx").on(table.recordedAt),
]);

// ─── Activity Feed ───────────────────────────────────────────────────────────

export const activityItems = pgTable("activity_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiresAttention: boolean("requires_attention").default(false).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("activity_items_type_idx").on(table.type),
  index("activity_items_timestamp_idx").on(table.timestamp),
  index("activity_items_requires_attention_idx").on(table.requiresAttention),
]);
