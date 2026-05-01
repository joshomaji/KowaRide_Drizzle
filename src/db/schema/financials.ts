/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — Financial (Transactions, Daily Payments, Payouts, Expenses)
 * ============================================================================
 *
 * All financial records for the double-entry ledger system.
 *
 * @module db/schema/financials
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  transactionTypeEnum,
  transactionStatusEnum,
  paymentStatusEnum,
  expenseCategoryEnum,
  payoutRecipientTypeEnum,
  payoutApprovalStatusEnum,
} from "./enums";
import { riders } from "./riders";
import { fleetOwners } from "./fleet-owners";

// ─── Transactions ────────────────────────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  reference: text("reference").notNull().unique(),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").default("PENDING").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  initiatedBy: text("initiated_by").notNull(),
  receivedBy: text("received_by").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("transactions_type_idx").on(table.type),
  index("transactions_status_idx").on(table.status),
  index("transactions_initiated_by_idx").on(table.initiatedBy),
  index("transactions_received_by_idx").on(table.receivedBy),
  index("transactions_created_at_idx").on(table.createdAt),
]);

// ─── Daily Payments ──────────────────────────────────────────────────────────

export const dailyPayments = pgTable("daily_payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  riderId: text("rider_id")
    .notNull()
    .references(() => riders.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  expectedAmount: decimal("expected_amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  transactionId: text("transaction_id").references(() => transactions.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("daily_payments_rider_id_idx").on(table.riderId),
  index("daily_payments_status_idx").on(table.status),
  index("daily_payments_due_date_idx").on(table.dueDate),
]);

// ─── Payout Summaries ────────────────────────────────────────────────────────

export const payoutSummaries = pgTable("payout_summaries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  fleetOwnerId: text("fleet_owner_id")
    .notNull()
    .references(() => fleetOwners.id),
  ownerName: text("owner_name").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  activeDays: integer("active_days").notNull(),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  status: transactionStatusEnum("status").default("PENDING").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("payout_summaries_fleet_owner_id_idx").on(table.fleetOwnerId),
  index("payout_summaries_status_idx").on(table.status),
]);

// ─── Expenses ────────────────────────────────────────────────────────────────

export const expenses = pgTable("expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  reference: text("reference").notNull().unique(),
  category: expenseCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").default("PENDING").notNull(),
  payee: text("payee").notNull(),
  approvedBy: text("approved_by"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("expenses_category_idx").on(table.category),
  index("expenses_status_idx").on(table.status),
  index("expenses_date_idx").on(table.date),
]);

// ─── Payout Records ──────────────────────────────────────────────────────────

export const payoutRecords = pgTable("payout_records", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  reference: text("reference").notNull().unique(),
  recipientType: payoutRecipientTypeEnum("recipient_type").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientId: text("recipient_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").default("PENDING").notNull(),
  period: text("period").notNull(),
  bankDetails: text("bank_details").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  approvalStatus: payoutApprovalStatusEnum("approval_status").default("PENDING").notNull(),
  approvedBy: text("approved_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("payout_records_recipient_type_idx").on(table.recipientType),
  index("payout_records_recipient_id_idx").on(table.recipientId),
  index("payout_records_approval_status_idx").on(table.approvalStatus),
]);

// ─── Relations ───────────────────────────────────────────────────────────────

export const transactionsRelations = relations(transactions, ({ many }) => ({
  dailyPayments: many(dailyPayments),
}));

export const dailyPaymentsRelations = relations(dailyPayments, ({ one }) => ({
  rider: one(riders, {
    fields: [dailyPayments.riderId],
    references: [riders.id],
  }),
  transaction: one(transactions, {
    fields: [dailyPayments.transactionId],
    references: [transactions.id],
  }),
}));

export const payoutSummariesRelations = relations(payoutSummaries, ({ one }) => ({
  fleetOwner: one(fleetOwners, {
    fields: [payoutSummaries.fleetOwnerId],
    references: [fleetOwners.id],
  }),
}));
