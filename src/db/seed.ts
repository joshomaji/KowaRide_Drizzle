/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Drizzle ORM — Database Seed Script
 * ============================================================================
 *
 * Seeds the database with initial data for development and testing.
 * Run with: bun run db:seed
 *
 * @module db/seed
 * @version 3.0.0 (Drizzle ORM)
 * ============================================================================
 */

import { db } from "@/lib/db";
import {
  users,
  riders,
  fleetManagers,
  fleetOwners,
  ownerBankDetails,
  bikeAssets,
  bikeMaintenanceRecords,
  transactions,
  dailyPayments,
  payoutSummaries,
  expenses,
  payoutRecords,
  systemAlerts,
  riskAssessments,
  riskFactors,
  auditLogEntries,
  systemConfigs,
  platformKpiSnapshots,
  chartDataPoints,
  activityItems,
} from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

// ─── Helper ─────────────────────────────────────────────────────────────────

function genId(): string {
  return createId();
}

function riderRef(n: number): string {
  return `KR-2024-${String(n).padStart(5, "0")}`;
}

function managerRef(n: number): string {
  return `FM-2024-${String(n).padStart(4, "0")}`;
}

function ownerRef(n: number): string {
  return `FO-2024-${String(n).padStart(4, "0")}`;
}

function bikeRef(n: number): string {
  return `KR-BIKE-${String(n).padStart(5, "0")}`;
}

function txnRef(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function expRef(): string {
  return `EXP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ─── Main Seed ──────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database with Drizzle ORM...\n");

  // ─── 1. Super Admin ──────────────────────────────────────────────────────
  const superAdminId = genId();
  await db.insert(users).values({
    id: superAdminId,
    email: "admin@kowaride.com",
    firstName: "Super",
    lastName: "Admin",
    phone: "+2348012345678",
    role: "SUPER_ADMIN",
    kycStatus: "VERIFIED",
    passwordHash: "$2b$10$placeholder_hash_for_seed_only",
    lastActiveAt: new Date(),
  }).onConflictDoNothing();
  console.log("  -> Created Super Admin");

  // ─── 2. Fleet Owners ─────────────────────────────────────────────────────
  const ownerData = [
    { firstName: "Chinedu", lastName: "Okafor", phone: "+2348023456789" },
    { firstName: "Amina", lastName: "Bello", phone: "+2348034567890" },
    { firstName: "Olumide", lastName: "Adeyemi", phone: "+2348045678901" },
  ];

  const ownerIds: string[] = [];
  for (let i = 0; i < ownerData.length; i++) {
    const userId = genId();
    const foId = genId();
    ownerIds.push(foId);

    await db.insert(users).values({
      id: userId,
      email: `${ownerData[i].firstName.toLowerCase()}.owner@kowaride.com`,
      firstName: ownerData[i].firstName,
      lastName: ownerData[i].lastName,
      phone: ownerData[i].phone,
      role: "FLEET_OWNER",
      kycStatus: "VERIFIED",
      passwordHash: "$2b$10$placeholder_hash_for_seed_only",
      lastActiveAt: new Date(),
    }).onConflictDoNothing();

    await db.insert(fleetOwners).values({
      id: foId,
      userId,
      ownerId: ownerRef(i + 1),
      totalBikes: 15 + i * 5,
      activeBikes: 12 + i * 3,
      totalRoi: "34.50",
      monthlyRoi: "8.20",
      pendingPayout: `${150000 + i * 50000}.00`,
      totalEarnings: `${2500000 + i * 800000}.00`,
      avgActiveDaysPerWeek: "5.2",
    }).onConflictDoNothing();

    await db.insert(ownerBankDetails).values({
      id: genId(),
      fleetOwnerId: foId,
      bankName: i === 0 ? "GTBank" : i === 1 ? "Access Bank" : "First Bank",
      accountNumber: `01234567${i + 1}89`,
      accountName: `${ownerData[i].firstName} ${ownerData[i].lastName}`,
    }).onConflictDoNothing();
  }
  console.log(`  -> Created ${ownerData.length} Fleet Owners with bank details`);

  // ─── 3. Fleet Managers ───────────────────────────────────────────────────
  const managerData = [
    { firstName: "Emeka", lastName: "Nwosu", tier: "GOLD" as const },
    { firstName: "Fatima", lastName: "Yusuf", tier: "SILVER" as const },
    { firstName: "Tunde", lastName: "Balogun", tier: "PLATINUM" as const },
    { firstName: "Blessing", lastName: "Eze", tier: "BRONZE" as const },
  ];

  const managerIds: string[] = [];
  for (let i = 0; i < managerData.length; i++) {
    const userId = genId();
    const fmId = genId();
    managerIds.push(fmId);

    await db.insert(users).values({
      id: userId,
      email: `${managerData[i].firstName.toLowerCase()}.manager@kowaride.com`,
      firstName: managerData[i].firstName,
      lastName: managerData[i].lastName,
      phone: `+23480${5 + i}6789012`,
      role: "FLEET_MANAGER",
      kycStatus: "VERIFIED",
      passwordHash: "$2b$10$placeholder_hash_for_seed_only",
      lastActiveAt: new Date(),
    }).onConflictDoNothing();

    await db.insert(fleetManagers).values({
      id: fmId,
      userId,
      managerId: managerRef(i + 1),
      tier: managerData[i].tier,
      performanceScore: 65 + i * 8,
      totalBikesAssigned: 10 + i * 3,
      activeRiders: 8 + i * 2,
      portfolioRepaymentRate: `${78 + i * 3}.50`,
      utilizationRate: `${82 + i * 2}.00`,
      incidentCount30d: Math.max(0, 5 - i),
      monthlyFee: `${150000 + i * 25000}.00`,
      fleetOwnerId: ownerIds[i % ownerIds.length],
    }).onConflictDoNothing();
  }
  console.log(`  -> Created ${managerData.length} Fleet Managers`);

  // ─── 4. Riders ───────────────────────────────────────────────────────────
  const riderFirstNames = ["Adebayo", "Chioma", "Danjuma", "Efe", "Gbenga", "Hauwa", "Ibrahim", "Joy", "Kunle", "Lola"];
  const riderLastNames = ["Alabi", "Chukwu", "Dantata", "Egharevba", "Fashola", "Garba", "Ibrahim", "Johnson", "Kuti", "Mbakwe"];

  const riderIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const userId = genId();
    const rId = genId();
    riderIds.push(rId);

    await db.insert(users).values({
      id: userId,
      email: `${riderFirstNames[i].toLowerCase()}.rider@kowaride.com`,
      firstName: riderFirstNames[i],
      lastName: riderLastNames[i],
      phone: `+234807${String(i).padStart(8, "0")}`,
      role: "RIDER",
      kycStatus: i < 8 ? "VERIFIED" : "PENDING",
      passwordHash: "$2b$10$placeholder_hash_for_seed_only",
      lastActiveAt: new Date(),
    }).onConflictDoNothing();

    await db.insert(riders).values({
      id: rId,
      userId,
      riderId: riderRef(i + 1),
      fleetManagerId: managerIds[i % managerIds.length],
      dailyPaymentAmount: "3500.00",
      totalPaidToDate: `${84000 + i * 12000}.00`,
      paymentStreak: 5 + i,
      repaymentRate: `${75 + i * 2}.00`,
      hmoEnrolled: i < 7,
      ownershipProgressMonths: i * 2 + 1,
      lastKnownLatitude: "6.524379",
      lastKnownLongitude: "3.379206",
      lastGpsPingAt: new Date(),
      accountBalance: `${i * 1500}.00`,
      unpaidDays: i < 5 ? 0 : i - 4,
      unpaidDayAction: i < 5 ? "NONE" : i < 7 ? "SMS_WARNING" : "FM_CALL",
      status: i < 8 ? "ACTIVE" : "PENDING_ONBOARDING",
    }).onConflictDoNothing();
  }
  console.log(`  -> Created 10 Riders`);

  // ─── 5. Bike Assets ──────────────────────────────────────────────────────
  const bikeModels = ["Honda CG 125", "Bajaj Boxer 150", "TVS HLX 125", "Haojue 125", "Suzuki GN 125"];
  const colors = ["Black", "Red", "Blue", "White", "Green"];

  const bikeIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const bId = genId();
    bikeIds.push(bId);

    await db.insert(bikeAssets).values({
      id: bId,
      assetId: bikeRef(i + 1),
      makeModel: bikeModels[i % bikeModels.length],
      year: 2020 + (i % 4),
      color: colors[i % colors.length],
      plateNumber: `LAG-${String(100 + i).padStart(3, "0")}ABC`,
      vinNumber: `VIN${Date.now()}${i}`,
      status: i < 8 ? "ACTIVE" : "IDLE",
      assignedRiderId: i < 8 ? riderIds[i] : null,
      fleetManagerId: managerIds[i % managerIds.length],
      fleetOwnerId: ownerIds[i % ownerIds.length],
      currentValue: `${350000 - i * 15000}.00`,
      purchasePrice: "450000.00",
      odometerKm: 5000 + i * 3000,
      lastGpsLatitude: "6.524379",
      lastGpsLongitude: "3.379206",
      lastGpsSpeed: "25.0",
      lastGpsPingAt: new Date(),
      maintenanceCount: i % 3,
    }).onConflictDoNothing();
  }
  console.log(`  -> Created 10 Bike Assets`);

  // ─── 6. Transactions ─────────────────────────────────────────────────────
  const txnTypes = ["DAILY_PAYMENT", "OWNER_PAYOUT", "MANAGER_FEE", "COMPANY_REVENUE"] as const;
  for (let i = 0; i < 20; i++) {
    await db.insert(transactions).values({
      id: genId(),
      reference: txnRef(),
      type: txnTypes[i % txnTypes.length],
      status: i < 15 ? "COMPLETED" : "PENDING",
      amount: `${1500 + i * 500}.00`,
      description: `Transaction ${i + 1} - ${txnTypes[i % txnTypes.length]}`,
      initiatedBy: superAdminId,
      receivedBy: ownerIds[i % ownerIds.length],
      completedAt: i < 15 ? new Date() : null,
      metadata: { batchId: `batch-${Math.floor(i / 5) + 1}` },
    }).onConflictDoNothing();
  }
  console.log(`  -> Created 20 Transactions`);

  // ─── 7. Daily Payments ───────────────────────────────────────────────────
  for (let i = 0; i < 15; i++) {
    await db.insert(dailyPayments).values({
      id: genId(),
      riderId: riderIds[i % riderIds.length],
      amount: `${3000 + i * 100}.00`,
      expectedAmount: "3500.00",
      status: i < 10 ? "PAID" : i < 12 ? "PARTIALLY_PAID" : "PENDING",
      paidAt: i < 10 ? new Date() : null,
      dueDate: new Date(),
    }).onConflictDoNothing();
  }
  console.log(`  -> Created 15 Daily Payments`);

  // ─── 8. System Alerts ────────────────────────────────────────────────────
  const alertData = [
    { severity: "CRITICAL" as const, title: "Overdue Payment - 7+ Days", entityType: "RIDER" as const },
    { severity: "WARNING" as const, title: "Bike Maintenance Due", entityType: "ASSET" as const },
    { severity: "ERROR" as const, title: "GPS Signal Lost", entityType: "ASSET" as const },
    { severity: "INFO" as const, title: "New Rider Onboarding", entityType: "RIDER" as const },
    { severity: "WARNING" as const, title: "Low Repayment Rate", entityType: "FLEET_MANAGER" as const },
  ];

  for (let i = 0; i < alertData.length; i++) {
    await db.insert(systemAlerts).values({
      id: genId(),
      severity: alertData[i].severity,
      title: alertData[i].title,
      description: `Alert description for: ${alertData[i].title}`,
      entityType: alertData[i].entityType,
      entityId: i % 2 === 0 ? riderIds[i % riderIds.length] : bikeIds[i % bikeIds.length],
      isAcknowledged: i > 2,
      isResolved: i > 3,
      recommendedAction: i < 2 ? "Immediate attention required" : "Monitor and review",
    }).onConflictDoNothing();
  }
  console.log(`  -> Created 5 System Alerts`);

  // ─── 9. Risk Assessments & Factors ───────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const assessmentId = genId();
    await db.insert(riskAssessments).values({
      id: assessmentId,
      entityId: riderIds[i % riderIds.length],
      entityType: "RIDER",
      riskLevel: i < 2 ? "LOW" : i < 4 ? "MEDIUM" : "HIGH",
      riskScore: 20 + i * 15,
    }).onConflictDoNothing();

    // Risk factors for each assessment
    const factorNames = ["Payment Consistency", "Ride Frequency", "Account Age", "Incident History"];
    for (const fname of factorNames) {
      await db.insert(riskFactors).values({
        id: genId(),
        assessmentId,
        name: fname,
        score: 15 + Math.floor(Math.random() * 40),
        value: `${Math.floor(Math.random() * 100)}%`,
        isAcceptable: Math.random() > 0.3,
      }).onConflictDoNothing();
    }
  }
  console.log(`  -> Created 5 Risk Assessments with factors`);

  // ─── 10. System Configs ──────────────────────────────────────────────────
  const configs = [
    { key: "daily_payment_default", label: "Default Daily Payment", description: "Default daily payment amount for riders", value: "3500", type: "NUMBER" as const, category: "FINANCIAL" as const },
    { key: "grace_period_days", label: "Grace Period (Days)", description: "Number of days before overdue action", value: "3", type: "NUMBER" as const, category: "OPERATIONS" as const },
    { key: "maintenance_threshold_km", label: "Maintenance Threshold (KM)", description: "Kilometers between maintenance checks", value: "5000", type: "NUMBER" as const, category: "OPERATIONS" as const },
    { key: "auto_suspend_enabled", label: "Auto-Suspend Enabled", description: "Automatically suspend riders after max unpaid days", value: "true", type: "BOOLEAN" as const, category: "COMPLIANCE" as const },
    { key: "sms_notifications", label: "SMS Notifications", description: "Enable SMS notifications for riders", value: "true", type: "BOOLEAN" as const, category: "NOTIFICATION" as const },
    { key: "max_login_attempts", label: "Max Login Attempts", description: "Maximum failed login attempts before lockout", value: "5", type: "NUMBER" as const, category: "SECURITY" as const },
  ];

  for (const cfg of configs) {
    await db.insert(systemConfigs).values({
      id: genId(),
      key: cfg.key,
      label: cfg.label,
      description: cfg.description,
      value: cfg.value,
      type: cfg.type,
      category: cfg.category,
      lastModifiedBy: superAdminId,
    }).onConflictDoNothing();
  }
  console.log(`  -> Created ${configs.length} System Configs`);

  // ─── 11. KPI Snapshot ────────────────────────────────────────────────────
  await db.insert(platformKpiSnapshots).values({
    id: genId(),
    totalRiders: 2450,
    activeRiders: 1893,
    totalFleetManagers: 48,
    totalFleetOwners: 32,
    totalBikes: 2100,
    activeBikes: 1785,
    fleetUtilizationRate: "85.00",
    avgRepaymentRate: "87.50",
    todayRevenue: "6625500.00",
    monthlyRevenue: "189450000.00",
    totalOutstandingPayments: "12450000.00",
    unresolvedAlerts: 23,
    criticalRiskItems: 5,
    pendingPayouts: "8750000.00",
    snapshotDate: new Date(),
  }).onConflictDoNothing();
  console.log(`  -> Created KPI Snapshot`);

  // ─── 12. Chart Data Points ───────────────────────────────────────────────
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    await db.insert(chartDataPoints).values([
      {
        id: genId(),
        chartType: "revenue",
        label: months[i],
        value: `${12000000 + i * 2000000 + Math.floor(Math.random() * 1000000)}.00`,
        period: `2024-${String(i + 1).padStart(2, "0")}`,
        recordedAt: new Date(2024, i, 1),
      },
      {
        id: genId(),
        chartType: "riders",
        label: months[i],
        value: `${1800 + i * 50 + Math.floor(Math.random() * 100)}.00`,
        secondaryValue: `${85 + Math.floor(Math.random() * 10)}.00`,
        period: `2024-${String(i + 1).padStart(2, "0")}`,
        recordedAt: new Date(2024, i, 1),
      },
    ]).onConflictDoNothing();
  }
  console.log(`  -> Created 24 Chart Data Points`);

  // ─── 13. Activity Items ──────────────────────────────────────────────────
  const activityData = [
    { type: "PAYMENT", title: "Daily Payment Received", desc: "Rider KR-2024-00001 made daily payment of ₦3,500", attention: false },
    { type: "ALERT", title: "Critical Alert Triggered", desc: "Overdue payment detected for rider KR-2024-00003", attention: true },
    { type: "RIDER", title: "New Rider Onboarded", desc: "Rider KR-2024-00010 completed onboarding", attention: false },
    { type: "FLEET", title: "Bike Assigned", desc: "Bike KR-BIKE-00005 assigned to rider KR-2024-00005", attention: false },
    { type: "FINANCIAL", title: "Payout Processed", desc: "Weekly payout of ₦450,000 processed for FO-2024-0001", attention: false },
    { type: "SYSTEM", title: "System Maintenance", desc: "Scheduled maintenance completed successfully", attention: false },
  ];

  for (let i = 0; i < activityData.length; i++) {
    await db.insert(activityItems).values({
      id: genId(),
      type: activityData[i].type,
      title: activityData[i].title,
      description: activityData[i].desc,
      requiresAttention: activityData[i].attention,
      timestamp: new Date(Date.now() - i * 3600000),
    }).onConflictDoNothing();
  }
  console.log(`  -> Created ${activityData.length} Activity Items`);

  // ─── 14. Audit Log Entries ───────────────────────────────────────────────
  const auditActions = [
    { action: "USER_LOGIN", category: "AUTH" as const, target: "User", details: "Super admin logged in" },
    { action: "RIDER_CREATED", category: "USER_MGMT" as const, target: "Rider", details: "New rider KR-2024-00001 created" },
    { action: "PAYMENT_RECEIVED", category: "FINANCIAL" as const, target: "DailyPayment", details: "Daily payment of ₦3,500 received" },
    { action: "CONFIG_UPDATED", category: "CONFIG" as const, target: "SystemConfig", details: "Updated daily_payment_default from 3000 to 3500" },
    { action: "RIDER_SUSPENDED", category: "ENFORCEMENT" as const, target: "Rider", details: "Rider KR-2024-00003 suspended for non-payment" },
  ];

  for (let i = 0; i < auditActions.length; i++) {
    await db.insert(auditLogEntries).values({
      id: genId(),
      actorId: superAdminId,
      actorName: "Super Admin",
      actorRole: "SUPER_ADMIN",
      action: auditActions[i].action,
      category: auditActions[i].category,
      targetEntity: auditActions[i].target,
      targetId: genId(),
      details: auditActions[i].details,
      ipAddress: "127.0.0.1",
      previousEntryHash: i === 0 ? "0000000000000000" : `hash_${i}`,
      entryHash: `hash_${i + 1}`,
    }).onConflictDoNothing();
  }
  console.log(`  -> Created ${auditActions.length} Audit Log Entries`);

  console.log("\n✅ Seed completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
