/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * TypeScript Type Definitions
 * ============================================================================
 *
 * This file contains all TypeScript interfaces and types used across the
 * Superadmin dashboard. Types are organized by business domain for easy
 * navigation and maintainability.
 *
 * @module types/admin
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * @license Proprietary - Kowamart and Logistics Ltd
 * ============================================================================
 */

// ============================================================================
// ENUMERATIONS
// ============================================================================

/** User role types within the Kowa Ride ecosystem */
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  FLEET_MANAGER = "FLEET_MANAGER",
  FLEET_OWNER = "FLEET_OWNER",
  RIDER = "RIDER",
  COMPLIANCE_OFFICER = "COMPLIANCE_OFFICER",
}

/** KYC verification status for all user types */
export enum KycStatus {
  PENDING = "PENDING",
  IN_REVIEW = "IN_REVIEW",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

/** Rider account status */
export enum RiderStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_ONBOARDING = "PENDING_ONBOARDING",
  TERMINATED = "TERMINATED",
}

/** Fleet manager performance tiers */
export enum PerformanceTier {
  PLATINUM = "PLATINUM",
  GOLD = "GOLD",
  SILVER = "SILVER",
  BRONZE = "BRONZE",
  PROBATION = "PROBATION",
}

/** Risk assessment levels */
export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/** Asset (bike) status lifecycle */
export enum AssetStatus {
  ACTIVE = "ACTIVE",
  IDLE = "IDLE",
  IN_MAINTENANCE = "IN_MAINTENANCE",
  DECOMMISSIONED = "DECOMMISSIONED",
  REPORTED_STOLEN = "REPORTED_STOLEN",
  TOTAL_LOSS = "TOTAL_LOSS",
}

/** Transaction types for the financial ledger */
export enum TransactionType {
  DAILY_PAYMENT = "DAILY_PAYMENT",
  OWNER_PAYOUT = "OWNER_PAYOUT",
  MANAGER_FEE = "MANAGER_FEE",
  MAINTENANCE_ALLOCATION = "MAINTENANCE_ALLOCATION",
  HMO_PREMIUM = "HMO_PREMIUM",
  COMPANY_REVENUE = "COMPANY_REVENUE",
  RESERVE_FUND = "RESERVE_FUND",
  PENALTY = "PENALTY",
  BONUS = "BONUS",
  REFUND = "REFUND",
}

/** Payment status for rider daily payments */
export enum PaymentStatus {
  PAID = "Paid",
  PARTIALLY_PAID = "Partially Paid",
  PENDING = "Pending",
  OVER_DUE = "Over Due",
}

/** Unpaid days escalation action levels */
export enum UnpaidDayAction {
  NONE = "NONE",
  SMS_WARNING = "SMS_WARNING",
  FM_CALL = "FM_CALL",
  FINAL_WARNING = "FINAL_WARNING",
  SUSPENDED = "SUSPENDED",
  BIKE_RETRIEVAL = "BIKE_RETRIEVAL",
}

/** Transaction status for payout tracking */
export enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
  FLAGGED = "FLAGGED",
}

/** Alert severity levels for the risk & compliance module */
export enum AlertSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

/** Navigation sections for the admin sidebar */
export enum AdminSection {
  OVERVIEW = "OVERVIEW",
  RIDERS = "RIDERS",
  FLEET_MANAGERS = "FLEET_MANAGERS",
  FLEET_OWNERS = "FLEET_OWNERS",
  FINANCIALS = "FINANCIALS",
  TRANSACTIONS = "TRANSACTIONS",
  FLEET = "FLEET",
  ASSETS = "ASSETS",
  RISK = "RISK",
  AUDIT = "AUDIT",
  EXPENSES = "EXPENSES",
  SETTINGS = "SETTINGS",
}

// ============================================================================
// CORE ENTITY INTERFACES
// ============================================================================

/** Base user profile shared across all user types */
export interface BaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  kycStatus: KycStatus;
  createdAt: string;
  lastActiveAt: string;
}

/** Rider-specific profile extending the base user */
export interface Rider extends BaseUser {
  role: UserRole.RIDER;
  status: RiderStatus;
  /** Unique rider identification number (e.g., KR-2024-00123) */
  riderId: string;
  /** Assigned bike asset ID, null if unassigned */
  assignedBikeId: string | null;
  /** Fleet manager this rider reports to */
  fleetManagerId: string;
  /** Current daily payment amount in Naira */
  dailyPaymentAmount: number;
  /** Total amount paid to date in Naira */
  totalPaidToDate: number;
  /** Number of consecutive on-time payments (streak tracking) */
  paymentStreak: number;
  /** Current month's repayment rate as percentage (0-100) */
  repaymentRate: number;
  /** HMO enrollment status */
  hmoEnrolled: boolean;
  /** Months into the ownership pathway program (0-24) */
  ownershipProgressMonths: number;
  /** GPS coordinates { latitude, longitude } of last known location */
  lastKnownLocation: { latitude: number; longitude: number } | null;
  /** Account balance for overpayment/credit */
  accountBalance: number;
  /** Number of consecutive unpaid days */
  unpaidDays: number;
  /** Current unpaid day escalation action */
  unpaidDayAction: UnpaidDayAction;
}

/** Fleet Manager profile with performance metrics */
export interface FleetManager extends BaseUser {
  role: UserRole.FLEET_MANAGER;
  /** Unique manager identification number */
  managerId: string;
  /** Current performance tier based on scoring algorithm */
  tier: PerformanceTier;
  /** Numeric performance score (0-100) */
  performanceScore: number;
  /** Total number of bikes assigned to this manager's portfolio */
  totalBikesAssigned: number;
  /** Number of currently active riders under management */
  activeRiders: number;
  /** Fleet-wide repayment rate percentage */
  portfolioRepaymentRate: number;
  /** Fleet-wide bike utilization rate percentage */
  utilizationRate: number;
  /** Total number of reported incidents in the last 30 days */
  incidentCount30d: number;
  /** Monthly management fee in Naira */
  monthlyFee: number;
  /** Fleet owner this manager is associated with */
  fleetOwnerId: string;
}

/** Fleet Owner profile with asset and ROI data */
export interface FleetOwner extends BaseUser {
  role: UserRole.FLEET_OWNER;
  /** Unique owner identification number */
  ownerId: string;
  /** Total number of bikes owned in the fleet */
  totalBikes: number;
  /** Number of bikes currently active/in-use */
  activeBikes: number;
  /** Total ROI percentage since joining the platform */
  totalRoi: number;
  /** Current monthly ROI percentage */
  monthlyRoi: number;
  /** Accumulated pending payout amount in Naira */
  pendingPayout: number;
  /** Total lifetime earnings in Naira */
  totalEarnings: number;
  /** Bank account details for payout processing */
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  /** Average days per week bikes are actively used */
  avgActiveDaysPerWeek: number;
}

// ============================================================================
// FINANCIAL INTERFACES
// ============================================================================

/** Financial transaction record for the double-entry ledger */
export interface Transaction {
  id: string;
  /** Human-readable transaction reference (e.g., TXN-20240115-AB12CD) */
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  /** Transaction amount in Naira (always positive) */
  amount: number;
  /** Brief description of the transaction purpose */
  description: string;
  /** The initiating user's ID */
  initiatedBy: string;
  /** The receiving user's ID */
  receivedBy: string;
  /** ISO 8601 timestamp of transaction creation */
  createdAt: string;
  /** ISO 8601 timestamp of transaction completion, null if pending */
  completedAt: string | null;
  /** Associated entity IDs for audit trail */
  metadata: {
    riderId?: string;
    bikeId?: string;
    allocationBatchId?: string;
    [key: string]: unknown;
  };
}

/** Weekly payout summary for fleet owners */
export interface PayoutSummary {
  id: string;
  ownerId: string;
  ownerName: string;
  /** Total payout amount for the period in Naira */
  amount: number;
  /** Number of active bike-days in the payout period */
  activeDays: number;
  /** Payout period start date */
  periodStart: string;
  /** Payout period end date */
  periodEnd: string;
  status: TransactionStatus;
  processedAt: string | null;
}

/** Financial allocation breakdown for the split engine */
export interface AllocationBreakdown {
  /** Portion allocated to company revenue */
  companyRevenue: number;
  /** Portion allocated to maintenance reserve */
  maintenanceFund: number;
  /** Portion allocated to HMO premiums */
  hmoPremium: number;
  /** Portion allocated to the reserve/escrow fund */
  reserveFund: number;
  /** Portion allocated to fleet owner payout */
  ownerPayout: number;
  /** Portion allocated to fleet manager fee */
  managerFee: number;
  /** Total daily payment amount */
  totalDailyPayment: number;
}

// ============================================================================
// ASSET & FLEET INTERFACES
// ============================================================================

/** Bike asset record with GPS and maintenance tracking */
export interface BikeAsset {
  id: string;
  /** Asset identification number (e.g., KR-BIKE-00456) */
  assetId: string;
  /** Bike make and model (e.g., "Honda CG 125") */
  makeModel: string;
  /** Year of manufacture */
  year: number;
  /** Color of the bike */
  color: string;
  /** License plate number */
  plateNumber: string;
  /** VIN / chassis number for identification */
  vinNumber: string;
  /** Current operational status */
  status: AssetStatus;
  /** Currently assigned rider ID, null if unassigned */
  assignedRiderId: string | null;
  /** Fleet manager responsible for this bike */
  fleetManagerId: string;
  /** Fleet owner who owns this asset */
  fleetOwnerId: string;
  /** Date the bike was added to the platform */
  registeredAt: string;
  /** Current estimated market value in Naira */
  currentValue: number;
  /** Original purchase price in Naira */
  purchasePrice: number;
  /** Odometer reading in kilometers */
  odometerKm: number;
  /** Last known GPS coordinates */
  lastGpsPing: {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed: number;
  } | null;
  /** Total number of maintenance events */
  maintenanceCount: number;
  /** Date of last maintenance service */
  lastMaintenanceDate: string | null;
  /** Next scheduled maintenance date */
  nextMaintenanceDate: string | null;
}

// ============================================================================
// RISK & COMPLIANCE INTERFACES
// ============================================================================

/** System alert generated by the risk engine */
export interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  /** Short title describing the alert */
  title: string;
  /** Detailed description of the alert context */
  description: string;
  /** The entity type this alert relates to */
  entityType: "RIDER" | "FLEET_MANAGER" | "FLEET_OWNER" | "ASSET" | "SYSTEM" | "FINANCIAL";
  /** The ID of the entity this alert relates to */
  entityId: string;
  /** Whether this alert has been acknowledged */
  isAcknowledged: boolean;
  /** Whether this alert has been resolved */
  isResolved: boolean;
  /** Recommended action to take */
  recommendedAction: string;
  createdAt: string;
}

/** Risk assessment for a user or entity */
export interface RiskAssessment {
  entityId: string;
  entityType: "RIDER" | "FLEET_MANAGER" | "FLEET_OWNER";
  /** Overall risk level */
  riskLevel: RiskLevel;
  /** Numeric risk score (0-100, higher = more risky) */
  riskScore: number;
  /** Breakdown of individual risk factors */
  factors: RiskFactor[];
  /** Last assessment timestamp */
  assessedAt: string;
}

/** Individual risk factor contributing to overall risk score */
export interface RiskFactor {
  name: string;
  /** Weighted score contribution (0-100) */
  score: number;
  /** Current value of this factor */
  value: string | number;
  /** Whether this factor is in an acceptable range */
  isAcceptable: boolean;
}

/** Immutable audit log entry for compliance tracking */
export interface AuditLogEntry {
  id: string;
  /** ISO 8601 timestamp of the action */
  timestamp: string;
  /** The user who performed the action */
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  /** The type of action performed */
  action: string;
  /** The category/module of the action */
  category: "AUTH" | "FINANCIAL" | "USER_MGMT" | "CONFIG" | "ENFORCEMENT" | "SYSTEM";
  /** The target entity affected */
  targetEntity: string;
  targetId: string;
  /** Detailed description of changes made */
  details: string;
  /** IP address of the actor */
  ipAddress: string;
  /** Hash of the previous entry for tamper-evident chaining */
  previousEntryHash: string;
}

// ============================================================================
// DASHBOARD & ANALYTICS INTERFACES
// ============================================================================

/** Platform-wide key performance indicators */
export interface PlatformKPIs {
  /** Total registered riders across all statuses */
  totalRiders: number;
  /** Riders currently active on the platform */
  activeRiders: number;
  /** Total fleet managers */
  totalFleetManagers: number;
  /** Total fleet owners */
  totalFleetOwners: number;
  /** Total registered bikes */
  totalBikes: number;
  /** Bikes currently in active use */
  activeBikes: number;
  /** Platform-wide fleet utilization rate (0-100) */
  fleetUtilizationRate: number;
  /** Average repayment rate across all riders (0-100) */
  avgRepaymentRate: number;
  /** Total daily revenue collected today in Naira */
  todayRevenue: number;
  /** Monthly revenue trend (last 30 days) in Naira */
  monthlyRevenue: number;
  /** Total outstanding payments across all riders in Naira */
  totalOutstandingPayments: number;
  /** Number of unresolved system alerts */
  unresolvedAlerts: number;
  /** Number of critical/unresolved risk items */
  criticalRiskItems: number;
  /** Total pending payouts to process in Naira */
  pendingPayouts: number;
}

/** Data point for time-series charts */
export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

/** Recent activity item for the activity feed */
export interface ActivityItem {
  id: string;
  type: "PAYMENT" | "RIDER" | "ALERT" | "SYSTEM" | "FLEET" | "FINANCIAL";
  title: string;
  description: string;
  timestamp: string;
  /** Relative time string (e.g., "2 hours ago") */
  relativeTime: string;
  /** Whether this activity requires attention */
  requiresAttention: boolean;
}

// ============================================================================
// EXPENSE INTERFACES
// ============================================================================

/** Expense record for tracking operational costs */
export interface Expense {
  id: string;
  /** Unique expense reference (e.g., EXP-20250115-001) */
  reference: string;
  /** Expense category */
  category: ExpenseCategory;
  /** Brief description */
  description: string;
  /** Amount in Naira */
  amount: number;
  /** Payment status */
  status: TransactionStatus;
  /** Vendor or payee name */
  payee: string;
  /** Who approved this expense */
  approvedBy: string;
  /** Date of the expense */
  date: string;
  /** Receipt or document URL */
  receiptUrl?: string;
  /** Additional notes */
  notes?: string;
  createdAt: string;
}

/** Expense category types */
export enum ExpenseCategory {
  MAINTENANCE = "MAINTENANCE",
  FUEL = "FUEL",
  SALARY = "SALARY",
  OFFICE = "OFFICE",
  INSURANCE = "INSURANCE",
  EQUIPMENT = "EQUIPMENT",
  LOGISTICS = "LOGISTICS",
  HMO = "HMO",
  UTILITIES = "UTILITIES",
  MISCELLANEOUS = "MISCELLANEOUS",
}

/** Payout record for tracking disbursements */
export interface PayoutRecord {
  id: string;
  /** Unique payout reference */
  reference: string;
  /** Recipient type */
  recipientType: "FLEET_OWNER" | "FLEET_MANAGER" | "HMO" | "STAFF";
  /** Recipient name */
  recipientName: string;
  /** Recipient ID */
  recipientId: string;
  /** Payout amount in Naira */
  amount: number;
  /** Payout status */
  status: TransactionStatus;
  /** Payout period description */
  period: string;
  /** Bank details */
  bankDetails: string;
  /** Processing date */
  processedAt: string | null;
  /** Approval status */
  approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
  /** Approved by */
  approvedBy: string | null;
  /** Notes */
  notes?: string;
  createdAt: string;
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

/** System configuration parameter */
export interface SystemConfig {
  key: string;
  label: string;
  description: string;
  value: string | number | boolean;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON";
  category: "FINANCIAL" | "OPERATIONS" | "COMPLIANCE" | "NOTIFICATION" | "SECURITY";
  isEditable: boolean;
  lastModifiedAt: string;
  lastModifiedBy: string;
}
