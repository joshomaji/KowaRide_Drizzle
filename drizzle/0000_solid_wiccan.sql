CREATE TYPE "public"."alert_entity_type" AS ENUM('RIDER', 'FLEET_MANAGER', 'FLEET_OWNER', 'ASSET', 'SYSTEM', 'FINANCIAL');--> statement-breakpoint
CREATE TYPE "public"."alert_severity" AS ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('ACTIVE', 'IDLE', 'IN_MAINTENANCE', 'DECOMMISSIONED', 'REPORTED_STOLEN', 'TOTAL_LOSS');--> statement-breakpoint
CREATE TYPE "public"."audit_category" AS ENUM('AUTH', 'FINANCIAL', 'USER_MGMT', 'CONFIG', 'ENFORCEMENT', 'OPERATIONS', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."config_category" AS ENUM('FINANCIAL', 'OPERATIONS', 'COMPLIANCE', 'NOTIFICATION', 'SECURITY');--> statement-breakpoint
CREATE TYPE "public"."config_type" AS ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('MAINTENANCE', 'FUEL', 'SALARY', 'OFFICE', 'INSURANCE', 'EQUIPMENT', 'LOGISTICS', 'HMO', 'UTILITIES', 'MISCELLANEOUS');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PAID', 'PARTIALLY_PAID', 'PENDING', 'OVER_DUE');--> statement-breakpoint
CREATE TYPE "public"."payout_approval_status" AS ENUM('APPROVED', 'PENDING', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."payout_recipient_type" AS ENUM('FLEET_OWNER', 'FLEET_MANAGER', 'HMO', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."performance_tier" AS ENUM('PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'PROBATION');--> statement-breakpoint
CREATE TYPE "public"."rider_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ONBOARDING', 'TERMINATED');--> statement-breakpoint
CREATE TYPE "public"."risk_entity_type" AS ENUM('RIDER', 'FLEET_MANAGER', 'FLEET_OWNER');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED', 'FLAGGED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('DAILY_PAYMENT', 'OWNER_PAYOUT', 'MANAGER_FEE', 'MAINTENANCE_ALLOCATION', 'HMO_PREMIUM', 'COMPANY_REVENUE', 'RESERVE_FUND', 'PENALTY', 'BONUS', 'REFUND');--> statement-breakpoint
CREATE TYPE "public"."unpaid_day_action" AS ENUM('NONE', 'SMS_WARNING', 'FM_CALL', 'FINAL_WARNING', 'SUSPENDED', 'BIKE_RETRIEVAL');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER', 'FLEET_OWNER', 'RIDER', 'COMPLIANCE_OFFICER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"avatar_url" text,
	"role" "user_role" NOT NULL,
	"kyc_status" "kyc_status" DEFAULT 'PENDING' NOT NULL,
	"password_hash" text,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "riders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"rider_id" text NOT NULL,
	"fleet_manager_id" text NOT NULL,
	"daily_payment_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_paid_to_date" numeric(15, 2) DEFAULT '0' NOT NULL,
	"payment_streak" integer DEFAULT 0 NOT NULL,
	"repayment_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"hmo_enrolled" boolean DEFAULT false NOT NULL,
	"ownership_progress_months" integer DEFAULT 0 NOT NULL,
	"last_known_latitude" numeric(9, 6),
	"last_known_longitude" numeric(9, 6),
	"last_gps_ping_at" timestamp with time zone,
	"account_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"unpaid_days" integer DEFAULT 0 NOT NULL,
	"unpaid_day_action" "unpaid_day_action" DEFAULT 'NONE' NOT NULL,
	"status" "rider_status" DEFAULT 'PENDING_ONBOARDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "riders_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "riders_rider_id_unique" UNIQUE("rider_id")
);
--> statement-breakpoint
CREATE TABLE "fleet_managers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"manager_id" text NOT NULL,
	"tier" "performance_tier" DEFAULT 'BRONZE' NOT NULL,
	"performance_score" integer DEFAULT 0 NOT NULL,
	"total_bikes_assigned" integer DEFAULT 0 NOT NULL,
	"active_riders" integer DEFAULT 0 NOT NULL,
	"portfolio_repayment_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"utilization_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"incident_count_30d" integer DEFAULT 0 NOT NULL,
	"monthly_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"fleet_owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fleet_managers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "fleet_managers_manager_id_unique" UNIQUE("manager_id")
);
--> statement-breakpoint
CREATE TABLE "fleet_owners" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"total_bikes" integer DEFAULT 0 NOT NULL,
	"active_bikes" integer DEFAULT 0 NOT NULL,
	"total_roi" numeric(5, 2) DEFAULT '0' NOT NULL,
	"monthly_roi" numeric(5, 2) DEFAULT '0' NOT NULL,
	"pending_payout" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_earnings" numeric(15, 2) DEFAULT '0' NOT NULL,
	"avg_active_days_per_week" numeric(3, 1) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fleet_owners_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "fleet_owners_owner_id_unique" UNIQUE("owner_id")
);
--> statement-breakpoint
CREATE TABLE "owner_bank_details" (
	"id" text PRIMARY KEY NOT NULL,
	"fleet_owner_id" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "owner_bank_details_fleet_owner_id_unique" UNIQUE("fleet_owner_id")
);
--> statement-breakpoint
CREATE TABLE "bike_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"make_model" text NOT NULL,
	"year" integer NOT NULL,
	"color" text NOT NULL,
	"plate_number" text NOT NULL,
	"vin_number" text NOT NULL,
	"status" "asset_status" DEFAULT 'ACTIVE' NOT NULL,
	"assigned_rider_id" text,
	"fleet_manager_id" text NOT NULL,
	"fleet_owner_id" text NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"current_value" numeric(12, 2) DEFAULT '0' NOT NULL,
	"purchase_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"odometer_km" integer DEFAULT 0 NOT NULL,
	"last_gps_latitude" numeric(9, 6),
	"last_gps_longitude" numeric(9, 6),
	"last_gps_speed" numeric(6, 1),
	"last_gps_ping_at" timestamp with time zone,
	"maintenance_count" integer DEFAULT 0 NOT NULL,
	"last_maintenance_date" timestamp with time zone,
	"next_maintenance_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bike_assets_asset_id_unique" UNIQUE("asset_id"),
	CONSTRAINT "bike_assets_plate_number_unique" UNIQUE("plate_number"),
	CONSTRAINT "bike_assets_vin_number_unique" UNIQUE("vin_number"),
	CONSTRAINT "bike_assets_assigned_rider_id_unique" UNIQUE("assigned_rider_id")
);
--> statement-breakpoint
CREATE TABLE "bike_maintenance_records" (
	"id" text PRIMARY KEY NOT NULL,
	"bike_id" text NOT NULL,
	"description" text NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"vendor_name" text NOT NULL,
	"performed_at" timestamp with time zone NOT NULL,
	"next_due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"rider_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"expected_amount" numeric(12, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"paid_at" timestamp with time zone,
	"due_date" timestamp with time zone NOT NULL,
	"transaction_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"category" "expense_category" NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"payee" text NOT NULL,
	"approved_by" text,
	"date" timestamp with time zone NOT NULL,
	"receipt_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expenses_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "payout_records" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"recipient_type" "payout_recipient_type" NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_id" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"period" text NOT NULL,
	"bank_details" text NOT NULL,
	"processed_at" timestamp with time zone,
	"approval_status" "payout_approval_status" DEFAULT 'PENDING' NOT NULL,
	"approved_by" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payout_records_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "payout_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"fleet_owner_id" text NOT NULL,
	"owner_name" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"active_days" integer NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"description" text NOT NULL,
	"initiated_by" text NOT NULL,
	"received_by" text NOT NULL,
	"completed_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "audit_log_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"actor_role" "user_role" NOT NULL,
	"action" text NOT NULL,
	"category" "audit_category" NOT NULL,
	"target_entity" text NOT NULL,
	"target_id" text NOT NULL,
	"details" text NOT NULL,
	"ip_address" text NOT NULL,
	"previous_entry_hash" text NOT NULL,
	"entry_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_log_entries_entry_hash_unique" UNIQUE("entry_hash")
);
--> statement-breakpoint
CREATE TABLE "risk_assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_id" text NOT NULL,
	"entity_type" "risk_entity_type" NOT NULL,
	"risk_level" "risk_level" NOT NULL,
	"risk_score" integer NOT NULL,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_factors" (
	"id" text PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"name" text NOT NULL,
	"score" integer NOT NULL,
	"value" text NOT NULL,
	"is_acceptable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"entity_type" "alert_entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"is_acknowledged" boolean DEFAULT false NOT NULL,
	"acknowledged_by" text,
	"acknowledged_at" timestamp with time zone,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"recommended_action" text,
	"bike_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_items" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"requires_attention" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chart_data_points" (
	"id" text PRIMARY KEY NOT NULL,
	"chart_type" text NOT NULL,
	"label" text NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"secondary_value" numeric(15, 2),
	"period" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_kpi_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"total_riders" integer NOT NULL,
	"active_riders" integer NOT NULL,
	"total_fleet_managers" integer NOT NULL,
	"total_fleet_owners" integer NOT NULL,
	"total_bikes" integer NOT NULL,
	"active_bikes" integer NOT NULL,
	"fleet_utilization_rate" numeric(5, 2) NOT NULL,
	"avg_repayment_rate" numeric(5, 2) NOT NULL,
	"today_revenue" numeric(15, 2) NOT NULL,
	"monthly_revenue" numeric(15, 2) NOT NULL,
	"total_outstanding_payments" numeric(15, 2) NOT NULL,
	"unresolved_alerts" integer NOT NULL,
	"critical_risk_items" integer NOT NULL,
	"pending_payouts" numeric(15, 2) NOT NULL,
	"snapshot_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"value" text NOT NULL,
	"type" "config_type" NOT NULL,
	"category" "config_category" NOT NULL,
	"is_editable" boolean DEFAULT true NOT NULL,
	"last_modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_modified_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_fleet_manager_id_fleet_managers_id_fk" FOREIGN KEY ("fleet_manager_id") REFERENCES "public"."fleet_managers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_managers" ADD CONSTRAINT "fleet_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_managers" ADD CONSTRAINT "fleet_managers_fleet_owner_id_fleet_owners_id_fk" FOREIGN KEY ("fleet_owner_id") REFERENCES "public"."fleet_owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_owners" ADD CONSTRAINT "fleet_owners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_bank_details" ADD CONSTRAINT "owner_bank_details_fleet_owner_id_fleet_owners_id_fk" FOREIGN KEY ("fleet_owner_id") REFERENCES "public"."fleet_owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_assets" ADD CONSTRAINT "bike_assets_fleet_manager_id_fleet_managers_id_fk" FOREIGN KEY ("fleet_manager_id") REFERENCES "public"."fleet_managers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_assets" ADD CONSTRAINT "bike_assets_fleet_owner_id_fleet_owners_id_fk" FOREIGN KEY ("fleet_owner_id") REFERENCES "public"."fleet_owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_maintenance_records" ADD CONSTRAINT "bike_maintenance_records_bike_id_bike_assets_id_fk" FOREIGN KEY ("bike_id") REFERENCES "public"."bike_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_payments" ADD CONSTRAINT "daily_payments_rider_id_riders_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_payments" ADD CONSTRAINT "daily_payments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_summaries" ADD CONSTRAINT "payout_summaries_fleet_owner_id_fleet_owners_id_fk" FOREIGN KEY ("fleet_owner_id") REFERENCES "public"."fleet_owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log_entries" ADD CONSTRAINT "audit_log_entries_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_factors" ADD CONSTRAINT "risk_factors_assessment_id_risk_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_bike_id_bike_assets_id_fk" FOREIGN KEY ("bike_id") REFERENCES "public"."bike_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "riders_fleet_manager_id_idx" ON "riders" USING btree ("fleet_manager_id");--> statement-breakpoint
CREATE INDEX "riders_status_idx" ON "riders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "riders_rider_id_idx" ON "riders" USING btree ("rider_id");--> statement-breakpoint
CREATE INDEX "fleet_managers_fleet_owner_id_idx" ON "fleet_managers" USING btree ("fleet_owner_id");--> statement-breakpoint
CREATE INDEX "fleet_managers_tier_idx" ON "fleet_managers" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "fleet_owners_owner_id_idx" ON "fleet_owners" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "bike_assets_status_idx" ON "bike_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bike_assets_fleet_manager_id_idx" ON "bike_assets" USING btree ("fleet_manager_id");--> statement-breakpoint
CREATE INDEX "bike_assets_fleet_owner_id_idx" ON "bike_assets" USING btree ("fleet_owner_id");--> statement-breakpoint
CREATE INDEX "bike_maintenance_records_bike_id_idx" ON "bike_maintenance_records" USING btree ("bike_id");--> statement-breakpoint
CREATE INDEX "daily_payments_rider_id_idx" ON "daily_payments" USING btree ("rider_id");--> statement-breakpoint
CREATE INDEX "daily_payments_status_idx" ON "daily_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "daily_payments_due_date_idx" ON "daily_payments" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "expenses_status_idx" ON "expenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expenses_date_idx" ON "expenses" USING btree ("date");--> statement-breakpoint
CREATE INDEX "payout_records_recipient_type_idx" ON "payout_records" USING btree ("recipient_type");--> statement-breakpoint
CREATE INDEX "payout_records_recipient_id_idx" ON "payout_records" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "payout_records_approval_status_idx" ON "payout_records" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "payout_summaries_fleet_owner_id_idx" ON "payout_summaries" USING btree ("fleet_owner_id");--> statement-breakpoint
CREATE INDEX "payout_summaries_status_idx" ON "payout_summaries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_initiated_by_idx" ON "transactions" USING btree ("initiated_by");--> statement-breakpoint
CREATE INDEX "transactions_received_by_idx" ON "transactions" USING btree ("received_by");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_log_entries_actor_id_idx" ON "audit_log_entries" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_entries_category_idx" ON "audit_log_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "audit_log_entries_target_entity_idx" ON "audit_log_entries" USING btree ("target_entity");--> statement-breakpoint
CREATE INDEX "audit_log_entries_target_id_idx" ON "audit_log_entries" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "audit_log_entries_created_at_idx" ON "audit_log_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "risk_assessments_entity_type_idx" ON "risk_assessments" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "risk_assessments_risk_level_idx" ON "risk_assessments" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "risk_assessments_assessed_at_idx" ON "risk_assessments" USING btree ("assessed_at");--> statement-breakpoint
CREATE INDEX "risk_factors_assessment_id_idx" ON "risk_factors" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "system_alerts_severity_idx" ON "system_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "system_alerts_entity_type_idx" ON "system_alerts" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "system_alerts_is_acknowledged_idx" ON "system_alerts" USING btree ("is_acknowledged");--> statement-breakpoint
CREATE INDEX "system_alerts_is_resolved_idx" ON "system_alerts" USING btree ("is_resolved");--> statement-breakpoint
CREATE INDEX "system_alerts_created_at_idx" ON "system_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_items_type_idx" ON "activity_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "activity_items_timestamp_idx" ON "activity_items" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "activity_items_requires_attention_idx" ON "activity_items" USING btree ("requires_attention");--> statement-breakpoint
CREATE INDEX "chart_data_points_chart_type_idx" ON "chart_data_points" USING btree ("chart_type");--> statement-breakpoint
CREATE INDEX "chart_data_points_period_idx" ON "chart_data_points" USING btree ("period");--> statement-breakpoint
CREATE INDEX "chart_data_points_recorded_at_idx" ON "chart_data_points" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "platform_kpi_snapshots_snapshot_date_idx" ON "platform_kpi_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "system_configs_category_idx" ON "system_configs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "system_configs_key_idx" ON "system_configs" USING btree ("key");