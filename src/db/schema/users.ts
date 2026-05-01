/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle Schema — Users & Authentication
 * ============================================================================
 *
 * Base user model shared across all user roles.
 * Role-specific data is stored in separate profile tables.
 *
 * @module db/schema/users
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { userRoleEnum, kycStatusEnum } from "./enums";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull(),
  kycStatus: kycStatusEnum("kyc_status").default("PENDING").notNull(),
  passwordHash: text("password_hash"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_role_idx").on(table.role),
]);
