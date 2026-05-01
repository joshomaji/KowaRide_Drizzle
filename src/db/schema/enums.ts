/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — PostgreSQL Enums
 * ============================================================================
 *
 * All enum types used across the Kowa Ride platform.
 * Mapped to native PostgreSQL enums for type safety at the database level.
 *
 * @module db/schema/enums
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import { pgEnum } from "drizzle-orm/pg-core";

// ─── User & Authentication ───────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "FLEET_MANAGER",
  "FLEET_OWNER",
  "RIDER",
  "COMPLIANCE_OFFICER",
]);

export const kycStatusEnum = pgEnum("kyc_status", [
  "PENDING",
  "IN_REVIEW",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
]);

// ─── Rider ───────────────────────────────────────────────────────────────────

export const riderStatusEnum = pgEnum("rider_status", [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_ONBOARDING",
  "TERMINATED",
]);

export const unpaidDayActionEnum = pgEnum("unpaid_day_action", [
  "NONE",
  "SMS_WARNING",
  "FM_CALL",
  "FINAL_WARNING",
  "SUSPENDED",
  "BIKE_RETRIEVAL",
]);

// ─── Fleet Manager ───────────────────────────────────────────────────────────

export const performanceTierEnum = pgEnum("performance_tier", [
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
  "PROBATION",
]);

// ─── Assets / Fleet ──────────────────────────────────────────────────────────

export const assetStatusEnum = pgEnum("asset_status", [
  "ACTIVE",
  "IDLE",
  "IN_MAINTENANCE",
  "DECOMMISSIONED",
  "REPORTED_STOLEN",
  "TOTAL_LOSS",
]);

// ─── Financial ───────────────────────────────────────────────────────────────

export const transactionTypeEnum = pgEnum("transaction_type", [
  "DAILY_PAYMENT",
  "OWNER_PAYOUT",
  "MANAGER_FEE",
  "MAINTENANCE_ALLOCATION",
  "HMO_PREMIUM",
  "COMPANY_REVENUE",
  "RESERVE_FUND",
  "PENALTY",
  "BONUS",
  "REFUND",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REVERSED",
  "FLAGGED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PAID",
  "PARTIALLY_PAID",
  "PENDING",
  "OVER_DUE",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "MAINTENANCE",
  "FUEL",
  "SALARY",
  "OFFICE",
  "INSURANCE",
  "EQUIPMENT",
  "LOGISTICS",
  "HMO",
  "UTILITIES",
  "MISCELLANEOUS",
]);

export const payoutRecipientTypeEnum = pgEnum("payout_recipient_type", [
  "FLEET_OWNER",
  "FLEET_MANAGER",
  "HMO",
  "STAFF",
]);

export const payoutApprovalStatusEnum = pgEnum("payout_approval_status", [
  "APPROVED",
  "PENDING",
  "REJECTED",
]);

// ─── Risk & Compliance ───────────────────────────────────────────────────────

export const riskLevelEnum = pgEnum("risk_level", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "INFO",
  "WARNING",
  "ERROR",
  "CRITICAL",
]);

export const alertEntityTypeEnum = pgEnum("alert_entity_type", [
  "RIDER",
  "FLEET_MANAGER",
  "FLEET_OWNER",
  "ASSET",
  "SYSTEM",
  "FINANCIAL",
]);

export const riskEntityTypeEnum = pgEnum("risk_entity_type", [
  "RIDER",
  "FLEET_MANAGER",
  "FLEET_OWNER",
]);

// ─── Audit ───────────────────────────────────────────────────────────────────

export const auditCategoryEnum = pgEnum("audit_category", [
  "AUTH",
  "FINANCIAL",
  "USER_MGMT",
  "CONFIG",
  "ENFORCEMENT",
  "OPERATIONS",
  "SYSTEM",
]);

// ─── System Configuration ────────────────────────────────────────────────────

export const configTypeEnum = pgEnum("config_type", [
  "STRING",
  "NUMBER",
  "BOOLEAN",
  "JSON",
]);

export const configCategoryEnum = pgEnum("config_category", [
  "FINANCIAL",
  "OPERATIONS",
  "COMPLIANCE",
  "NOTIFICATION",
  "SECURITY",
]);
