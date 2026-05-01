/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Database Seed Script
 * ============================================================================
 *
 * Seeds the Supabase PostgreSQL database with realistic mock data for
 * development and demonstration purposes.
 *
 * Run with: bunx prisma db seed
 *
 * @module prisma/seed
 * @version 1.0.0
 * ============================================================================
 */

import { PrismaClient, UserRole, KycStatus, RiderStatus, PerformanceTier, AssetStatus, TransactionType, TransactionStatus, AlertSeverity, RiskLevel, ExpenseCategory, UnpaidDayAction } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// SEED DATA
// ============================================================================

async function main() {
  console.log('🌱 Seeding Kowa Ride database...\n')

  // Clean existing data (in reverse dependency order)
  console.log('🧹 Cleaning existing data...')
  await prisma.riskFactor.deleteMany()
  await prisma.riskAssessment.deleteMany()
  await prisma.systemAlert.deleteMany()
  await prisma.auditLogEntry.deleteMany()
  await prisma.chartDataPoint.deleteMany()
  await prisma.activityItem.deleteMany()
  await prisma.platformKPISnapshot.deleteMany()
  await prisma.systemConfig.deleteMany()
  await prisma.dailyPayment.deleteMany()
  await prisma.payoutRecord.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.payoutSummary.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.bikeMaintenanceRecord.deleteMany()
  await prisma.bikeAsset.deleteMany()
  await prisma.ownerBankDetail.deleteMany()
  await prisma.rider.deleteMany()
  await prisma.fleetManager.deleteMany()
  await prisma.fleetOwner.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Cleaned existing data\n')

  // ========================================================================
  // 1. CREATE FLEET OWNERS
  // ========================================================================
  console.log('👥 Creating Fleet Owners...')

  const fleetOwnerUsers = [
    { firstName: 'Chief', lastName: 'Adeniyi', email: 'c.adeniyi@kowaride.com', phone: '+234 901 234 5678' },
    { firstName: 'Alhaji', lastName: 'Mohammed', email: 'a.mohammed@kowaride.com', phone: '+234 902 345 6789' },
    { firstName: 'Dr.', lastName: 'Okoro', email: 'd.okoro@kowaride.com', phone: '+234 903 456 7890' },
    { firstName: 'Mrs.', lastName: 'Chukwu', email: 'm.chukwu@kowaride.com', phone: '+234 904 567 8901' },
    { firstName: 'Engr.', lastName: 'Babatunde', email: 'e.babatunde@kowaride.com', phone: '+234 905 678 9012' },
  ]

  const ownerIds: string[] = []
  const foUserIds: string[] = []

  for (let i = 0; i < fleetOwnerUsers.length; i++) {
    const u = fleetOwnerUsers[i]
    const user = await prisma.user.create({
      data: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: UserRole.FLEET_OWNER,
        kycStatus: i < 4 ? KycStatus.VERIFIED : KycStatus.IN_REVIEW,
      }
    })
    foUserIds.push(user.id)

    const owner = await prisma.fleetOwner.create({
      data: {
        userId: user.id,
        ownerId: `FO-00${i + 1}`,
        totalBikes: [50, 33, 40, 25, 15][i],
        activeBikes: [47, 28, 38, 22, 13][i],
        totalRoi: [34.5, 28.7, 31.2, 22.1, 12.5][i],
        monthlyRoi: [4.2, 3.5, 3.9, 2.8, 3.1][i],
        pendingPayout: [2450000, 1680000, 1950000, 980000, 560000][i],
        totalEarnings: [34500000, 18200000, 25600000, 11200000, 3750000][i],
        avgActiveDaysPerWeek: [6.2, 5.8, 6.5, 5.4, 6.0][i],
      }
    })
    ownerIds.push(owner.id)

    // Bank details
    const banks = [
      { bankName: 'GTBank', accountNumber: '0123456789', accountName: 'Adeniyi Ventures Ltd' },
      { bankName: 'Access Bank', accountNumber: '0987654321', accountName: 'Mohammed Logistics' },
      { bankName: 'First Bank', accountNumber: '1122334455', accountName: 'Okoro Fleet Services' },
      { bankName: 'UBA', accountNumber: '2233445566', accountName: 'Chukwu Investments' },
      { bankName: 'Zenith Bank', accountNumber: '3344556677', accountName: 'Babatunde Engineering Ltd' },
    ]
    await prisma.ownerBankDetail.create({
      data: {
        fleetOwnerId: owner.id,
        ...banks[i],
      }
    })
  }
  console.log(`✅ Created ${fleetOwnerUsers.length} Fleet Owners\n`)

  // ========================================================================
  // 2. CREATE FLEET MANAGERS
  // ========================================================================
  console.log('👔 Creating Fleet Managers...')

  const fmData = [
    { firstName: 'Tunde', lastName: 'Bakare', email: 't.bakare@kowaride.com', phone: '+234 701 234 5678', tier: PerformanceTier.PLATINUM, score: 96, bikes: 28, activeRiders: 27, repayment: 94.5, utilization: 96.2, incidents: 1, fee: 84000, ownerIdx: 0 },
    { firstName: 'Ngozi', lastName: 'Anyawu', email: 'n.anyawu@kowaride.com', phone: '+234 702 345 6789', tier: PerformanceTier.GOLD, score: 88, bikes: 22, activeRiders: 20, repayment: 89.3, utilization: 90.1, incidents: 3, fee: 66000, ownerIdx: 0 },
    { firstName: 'Samuel', lastName: 'Ogundimu', email: 's.ogundimu@kowaride.com', phone: '+234 703 456 7890', tier: PerformanceTier.SILVER, score: 78, bikes: 18, activeRiders: 16, repayment: 82.1, utilization: 84.5, incidents: 5, fee: 54000, ownerIdx: 1 },
    { firstName: 'Amina', lastName: 'Dangote', email: 'a.dangote@kowaride.com', phone: '+234 704 567 8901', tier: PerformanceTier.BRONZE, score: 65, bikes: 15, activeRiders: 12, repayment: 74.8, utilization: 78.3, incidents: 8, fee: 45000, ownerIdx: 1 },
    { firstName: 'David', lastName: 'Olatunji', email: 'd.olatunji@kowaride.com', phone: '+234 705 678 9012', tier: PerformanceTier.PLATINUM, score: 94, bikes: 30, activeRiders: 29, repayment: 93.7, utilization: 95.8, incidents: 2, fee: 90000, ownerIdx: 2 },
    { firstName: 'Hauwa', lastName: 'Kwaje', email: 'h.kwaje@kowaride.com', phone: '+234 706 789 0123', tier: PerformanceTier.PROBATION, score: 45, bikes: 10, activeRiders: 7, repayment: 62.3, utilization: 68.9, incidents: 12, fee: 30000, ownerIdx: 2 },
  ]

  const fmIds: string[] = []

  for (const fm of fmData) {
    const user = await prisma.user.create({
      data: {
        email: fm.email,
        firstName: fm.firstName,
        lastName: fm.lastName,
        phone: fm.phone,
        role: UserRole.FLEET_MANAGER,
        kycStatus: KycStatus.VERIFIED,
      }
    })

    const manager = await prisma.fleetManager.create({
      data: {
        userId: user.id,
        managerId: `FM-00${fmIds.length + 1}`,
        tier: fm.tier,
        performanceScore: fm.score,
        totalBikesAssigned: fm.bikes,
        activeRiders: fm.activeRiders,
        portfolioRepaymentRate: fm.repayment,
        utilizationRate: fm.utilization,
        incidentCount30d: fm.incidents,
        monthlyFee: fm.fee,
        fleetOwnerId: ownerIds[fm.ownerIdx],
      }
    })
    fmIds.push(manager.id)
  }
  console.log(`✅ Created ${fmData.length} Fleet Managers\n`)

  // ========================================================================
  // 3. CREATE RIDERS
  // ========================================================================
  console.log('🛵 Creating Riders...')

  const riderData = [
    { firstName: 'Chukwuemeka', lastName: 'Okonkwo', email: 'c.okonkwo@email.com', phone: '+234 801 234 5678', riderId: 'KR-2024-00123', dailyPayment: 3500, totalPaid: 630000, streak: 24, rate: 98.5, hmo: true, ownershipMonths: 6, balance: 0, unpaidDays: 0, action: UnpaidDayAction.NONE, status: RiderStatus.ACTIVE, kyc: KycStatus.VERIFIED, fmIdx: 0, lat: 6.5244, lng: 3.3792 },
    { firstName: 'Aishat', lastName: 'Abubakar', email: 'a.abubakar@email.com', phone: '+234 802 345 6789', riderId: 'KR-2024-00456', dailyPayment: 3500, totalPaid: 525000, streak: 18, rate: 95.2, hmo: true, ownershipMonths: 5, balance: 3500, unpaidDays: 0, action: UnpaidDayAction.NONE, status: RiderStatus.ACTIVE, kyc: KycStatus.VERIFIED, fmIdx: 0, lat: 6.4541, lng: 3.3947 },
    { firstName: 'Olumide', lastName: 'Adeyemi', email: 'o.adeyemi@email.com', phone: '+234 803 456 7890', riderId: 'KR-2024-00789', dailyPayment: 3000, totalPaid: 360000, streak: 12, rate: 91.7, hmo: false, ownershipMonths: 4, balance: 0, unpaidDays: 2, action: UnpaidDayAction.FM_CALL, status: RiderStatus.ACTIVE, kyc: KycStatus.VERIFIED, fmIdx: 1, lat: 6.335, lng: 5.627 },
    { firstName: 'Ibrahim', lastName: 'Musah', email: 'i.musah@email.com', phone: '+234 804 567 8901', riderId: 'KR-2024-00234', dailyPayment: 3000, totalPaid: 270000, streak: 0, rate: 62.5, hmo: false, ownershipMonths: 3, balance: -10500, unpaidDays: 5, action: UnpaidDayAction.BIKE_RETRIEVAL, status: RiderStatus.SUSPENDED, kyc: KycStatus.VERIFIED, fmIdx: 1, lat: null, lng: null },
    { firstName: 'Chioma', lastName: 'Eze', email: 'c.eze@email.com', phone: '+234 805 678 9012', riderId: 'KR-2025-01001', dailyPayment: 3500, totalPaid: 0, streak: 0, rate: 0, hmo: false, ownershipMonths: 0, balance: 0, unpaidDays: 0, action: UnpaidDayAction.NONE, status: RiderStatus.PENDING_ONBOARDING, kyc: KycStatus.IN_REVIEW, fmIdx: 2, lat: null, lng: null },
    { firstName: 'Abdulahi', lastName: 'Garba', email: 'a.garba@email.com', phone: '+234 806 789 0123', riderId: 'KR-2024-00345', dailyPayment: 3000, totalPaid: 480000, streak: 30, rate: 99.1, hmo: true, ownershipMonths: 8, balance: 6000, unpaidDays: 0, action: UnpaidDayAction.NONE, status: RiderStatus.ACTIVE, kyc: KycStatus.VERIFIED, fmIdx: 2, lat: 7.4914, lng: 3.9013 },
    { firstName: 'Blessing', lastName: 'Okafor', email: 'b.okafor@email.com', phone: '+234 807 890 1234', riderId: 'KR-2024-00567', dailyPayment: 3500, totalPaid: 560000, streak: 15, rate: 93.4, hmo: true, ownershipMonths: 5, balance: 0, unpaidDays: 3, action: UnpaidDayAction.FINAL_WARNING, status: RiderStatus.ACTIVE, kyc: KycStatus.VERIFIED, fmIdx: 0, lat: 6.5955, lng: 3.342 },
    { firstName: 'Yusuf', lastName: 'Bello', email: 'y.bello@email.com', phone: '+234 808 901 2345', riderId: 'KR-2024-00678', dailyPayment: 3000, totalPaid: 180000, streak: 0, rate: 75.0, hmo: false, ownershipMonths: 2, balance: 0, unpaidDays: 4, action: UnpaidDayAction.SUSPENDED, status: RiderStatus.INACTIVE, kyc: KycStatus.PENDING, fmIdx: 3, lat: 9.0579, lng: 7.4951 },
    { firstName: 'Fatimah', lastName: 'Ibrahim', email: 'f.ibrahim@email.com', phone: '+234 809 012 3456', riderId: 'KR-2024-00890', dailyPayment: 3500, totalPaid: 420000, streak: 21, rate: 96.8, hmo: true, ownershipMonths: 4, balance: 0, unpaidDays: 1, action: UnpaidDayAction.SMS_WARNING, status: RiderStatus.ACTIVE, kyc: KycStatus.VERIFIED, fmIdx: 3, lat: 12.0022, lng: 8.592 },
    { firstName: 'Emeka', lastName: 'Nwachukwu', email: 'e.nwachukwu@email.com', phone: '+234 810 123 4567', riderId: 'KR-2024-00901', dailyPayment: 3500, totalPaid: 700000, streak: 36, rate: 100.0, hmo: true, ownershipMonths: 10, balance: 10500, unpaidDays: 0, action: UnpaidDayAction.NONE, status: RiderStatus.ACTIVE, kyc: KycStatus.VERIFIED, fmIdx: 4, lat: 5.0124, lng: 7.0123 },
  ]

  const riderIds: string[] = []

  for (const r of riderData) {
    const user = await prisma.user.create({
      data: {
        email: r.email,
        firstName: r.firstName,
        lastName: r.lastName,
        phone: r.phone,
        role: UserRole.RIDER,
        kycStatus: r.kyc,
        avatarUrl: `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70) + 1}`,
      }
    })

    const rider = await prisma.rider.create({
      data: {
        userId: user.id,
        riderId: r.riderId,
        fleetManagerId: fmIds[r.fmIdx],
        dailyPaymentAmount: r.dailyPayment,
        totalPaidToDate: r.totalPaid,
        paymentStreak: r.streak,
        repaymentRate: r.rate,
        hmoEnrolled: r.hmo,
        ownershipProgressMonths: r.ownershipMonths,
        lastKnownLatitude: r.lat,
        lastKnownLongitude: r.lng,
        accountBalance: r.balance,
        unpaidDays: r.unpaidDays,
        unpaidDayAction: r.action,
        status: r.status,
      }
    })
    riderIds.push(rider.id)
  }
  console.log(`✅ Created ${riderData.length} Riders\n`)

  // ========================================================================
  // 4. CREATE BIKE ASSETS
  // ========================================================================
  console.log('🚲 Creating Bike Assets...')

  const bikeData = [
    { assetId: 'KR-BIKE-00112', makeModel: 'Honda CG 125', year: 2023, color: 'Red', plate: 'LAG-123-AB', vin: 'VNHGJ5678N1234567', status: AssetStatus.ACTIVE, riderIdx: 0, fmIdx: 0, ownerIdx: 0, current: 850000, purchase: 1200000, odo: 23456, lat: 6.5244, lng: 3.3792, speed: 45, maintCount: 3 },
    { assetId: 'KR-BIKE-00234', makeModel: 'Bajaj Boxer 150', year: 2023, color: 'Black', plate: 'LAG-456-CD', vin: 'VNHGJ5678N2345678', status: AssetStatus.ACTIVE, riderIdx: 1, fmIdx: 0, ownerIdx: 0, current: 780000, purchase: 950000, odo: 18234, lat: 6.4541, lng: 3.3947, speed: 32, maintCount: 2 },
    { assetId: 'KR-BIKE-00345', makeModel: 'TVS Apache 200', year: 2024, color: 'Blue', plate: 'ABJ-789-EF', vin: 'VNHGJ5678N3456789', status: AssetStatus.ACTIVE, riderIdx: 2, fmIdx: 1, ownerIdx: 1, current: 1100000, purchase: 1450000, odo: 12345, lat: 6.335, lng: 5.627, speed: 55, maintCount: 1 },
    { assetId: 'KR-BIKE-00456', makeModel: 'Honda CG 125', year: 2023, color: 'Green', plate: 'IBD-012-GH', vin: 'VNHGJ5678N4567890', status: AssetStatus.IN_MAINTENANCE, riderIdx: null, fmIdx: 2, ownerIdx: 1, current: 720000, purchase: 1200000, odo: 34567, lat: null, lng: null, speed: null, maintCount: 7 },
    { assetId: 'KR-BIKE-00567', makeModel: 'Bajaj Pulsar 150', year: 2024, color: 'Silver', plate: 'LAG-345-IJ', vin: 'VNHGJ5678N5678901', status: AssetStatus.ACTIVE, riderIdx: 6, fmIdx: 0, ownerIdx: 0, current: 920000, purchase: 1100000, odo: 15678, lat: 6.5955, lng: 3.342, speed: 28, maintCount: 2 },
    { assetId: 'KR-BIKE-00678', makeModel: 'Kymco K-Piper 125', year: 2023, color: 'White', plate: 'KAD-678-KL', vin: 'VNHGJ5678N6789012', status: AssetStatus.ACTIVE, riderIdx: 8, fmIdx: 3, ownerIdx: 2, current: 680000, purchase: 900000, odo: 21098, lat: 12.0022, lng: 8.592, speed: 40, maintCount: 4 },
    { assetId: 'KR-BIKE-00789', makeModel: 'Honda CB125', year: 2023, color: 'Black', plate: 'PH-901-MN', vin: 'VNHGJ5678N7890123', status: AssetStatus.ACTIVE, riderIdx: 9, fmIdx: 4, ownerIdx: 2, current: 750000, purchase: 1150000, odo: 40123, lat: 5.0124, lng: 7.0123, speed: 35, maintCount: 5 },
    { assetId: 'KR-BIKE-00890', makeModel: 'Suzuki GS125', year: 2022, color: 'Red', plate: 'LAG-234-OP', vin: 'VNHGJ5678N8901234', status: AssetStatus.REPORTED_STOLEN, riderIdx: null, fmIdx: 1, ownerIdx: 0, current: 500000, purchase: 1000000, odo: 28901, lat: 6.4281, lng: 3.4219, speed: 0, maintCount: 3 },
  ]

  const bikeIds: string[] = []

  for (const b of bikeData) {
    const bike = await prisma.bikeAsset.create({
      data: {
        assetId: b.assetId,
        makeModel: b.makeModel,
        year: b.year,
        color: b.color,
        plateNumber: b.plate,
        vinNumber: b.vin,
        status: b.status,
        assignedRiderId: b.riderIdx !== null ? riderIds[b.riderIdx] : null,
        fleetManagerId: fmIds[b.fmIdx],
        fleetOwnerId: ownerIds[b.ownerIdx],
        currentValue: b.current,
        purchasePrice: b.purchase,
        odometerKm: b.odo,
        lastGpsLatitude: b.lat,
        lastGpsLongitude: b.lng,
        lastGpsSpeed: b.speed,
        maintenanceCount: b.maintCount,
        lastMaintenanceDate: new Date('2024-12-20'),
        nextMaintenanceDate: new Date('2025-03-20'),
      }
    })
    bikeIds.push(bike.id)

    // Update rider with assigned bike
    if (b.riderIdx !== null) {
      await prisma.rider.update({
        where: { id: riderIds[b.riderIdx] },
        data: { assignedBikeId: bike.id }
      })
    }
  }
  console.log(`✅ Created ${bikeData.length} Bike Assets\n`)

  // ========================================================================
  // 5. CREATE TRANSACTIONS
  // ========================================================================
  console.log('💰 Creating Transactions...')

  const txData = [
    { ref: 'TXN-20250115-AB12CD', type: TransactionType.DAILY_PAYMENT, status: TransactionStatus.COMPLETED, amount: 3500, desc: 'Daily payment - Chukwuemeka Okonkwo', by: 'rider-001', to: 'system', meta: { riderId: 'rider-001', bikeId: 'bike-012' } },
    { ref: 'TXN-20250115-EF34GH', type: TransactionType.DAILY_PAYMENT, status: TransactionStatus.COMPLETED, amount: 3500, desc: 'Daily payment - Aishat Abubakar', by: 'rider-002', to: 'system', meta: { riderId: 'rider-002', bikeId: 'bike-023' } },
    { ref: 'TXN-20250114-IJ56KL', type: TransactionType.OWNER_PAYOUT, status: TransactionStatus.COMPLETED, amount: 2450000, desc: 'Weekly payout - Chief Adeniyi (FO-001)', by: 'system', to: 'fo-001', meta: { allocationBatchId: 'batch-001' } },
    { ref: 'TXN-20250114-MN78OP', type: TransactionType.MAINTENANCE_ALLOCATION, status: TransactionStatus.COMPLETED, amount: 75000, desc: 'Bike KR-BIKE-00456 engine overhaul', by: 'system', to: 'vendor-maint-001', meta: { bikeId: 'bike-045' } },
    { ref: 'TXN-20250113-QR90ST', type: TransactionType.MANAGER_FEE, status: TransactionStatus.PROCESSING, amount: 84000, desc: 'Monthly manager fee - Tunde Bakare (FM-001)', by: 'system', to: 'fm-001', meta: { allocationBatchId: 'batch-002' } },
    { ref: 'TXN-20250113-UV12WX', type: TransactionType.BONUS, status: TransactionStatus.COMPLETED, amount: 7000, desc: 'Streak bonus - Abdulahi Garba (12-month streak)', by: 'system', to: 'rider-006', meta: { riderId: 'rider-006' } },
    { ref: 'TXN-20250112-YZ34AB', type: TransactionType.PENALTY, status: TransactionStatus.COMPLETED, amount: 5000, desc: 'Late payment penalty - Ibrahim Musah', by: 'system', to: 'system', meta: { riderId: 'rider-004' } },
    { ref: 'TXN-20250111-CD56EF', type: TransactionType.COMPANY_REVENUE, status: TransactionStatus.COMPLETED, amount: 1250000, desc: 'Daily platform revenue allocation', by: 'system', to: 'company', meta: { allocationBatchId: 'batch-003' } },
    { ref: 'TXN-20250110-GH78IJ', type: TransactionType.DAILY_PAYMENT, status: TransactionStatus.FAILED, amount: 3000, desc: 'Daily payment FAILED - Yusuf Bello (insufficient funds)', by: 'rider-008', to: 'system', meta: { riderId: 'rider-008', bikeId: 'bike-067' } },
    { ref: 'TXN-20250109-KL90MN', type: TransactionType.OWNER_PAYOUT, status: TransactionStatus.FLAGGED, amount: 1680000, desc: 'Weekly payout FLAGGED - Alhaji Mohammed (utilization below threshold)', by: 'system', to: 'fo-002', meta: { allocationBatchId: 'batch-004' } },
    { ref: 'TXN-20250108-OP12QR', type: TransactionType.HMO_PREMIUM, status: TransactionStatus.COMPLETED, amount: 15000, desc: 'Monthly HMO premium deduction - Tunde Bakare fleet', by: 'system', to: 'hmo-provider-001', meta: { fleetManagerId: 'fm-001' } },
    { ref: 'TXN-20250107-ST34UV', type: TransactionType.RESERVE_FUND, status: TransactionStatus.COMPLETED, amount: 350000, desc: 'Daily reserve fund allocation', by: 'system', to: 'reserve', meta: { allocationBatchId: 'batch-005' } },
  ]

  for (const tx of txData) {
    await prisma.transaction.create({
      data: {
        reference: tx.ref,
        type: tx.type,
        status: tx.status,
        amount: tx.amount,
        description: tx.desc,
        initiatedBy: tx.by,
        receivedBy: tx.to,
        completedAt: tx.status === TransactionStatus.COMPLETED ? new Date() : null,
        metadata: tx.meta,
      }
    })
  }
  console.log(`✅ Created ${txData.length} Transactions\n`)

  // ========================================================================
  // 6. CREATE PAYOUT SUMMARIES
  // ========================================================================
  console.log('📤 Creating Payout Summaries...')

  const payoutData = [
    { ownerIdx: 0, ownerName: 'Chief Adeniyi', amount: 2450000, activeDays: 42, status: TransactionStatus.COMPLETED },
    { ownerIdx: 1, ownerName: 'Alhaji Mohammed', amount: 1680000, activeDays: 28, status: TransactionStatus.FLAGGED },
    { ownerIdx: 2, ownerName: 'Dr. Okoro', amount: 1950000, activeDays: 38, status: TransactionStatus.PENDING },
    { ownerIdx: 3, ownerName: 'Mrs. Chukwu', amount: 980000, activeDays: 22, status: TransactionStatus.COMPLETED },
    { ownerIdx: 4, ownerName: 'Engr. Babatunde', amount: 560000, activeDays: 12, status: TransactionStatus.PROCESSING },
  ]

  for (const p of payoutData) {
    await prisma.payoutSummary.create({
      data: {
        fleetOwnerId: ownerIds[p.ownerIdx],
        ownerName: p.ownerName,
        amount: p.amount,
        activeDays: p.activeDays,
        periodStart: new Date('2025-01-06'),
        periodEnd: new Date('2025-01-12'),
        status: p.status,
        processedAt: p.status === TransactionStatus.COMPLETED ? new Date('2025-01-14') : null,
      }
    })
  }
  console.log(`✅ Created ${payoutData.length} Payout Summaries\n`)

  // ========================================================================
  // 7. CREATE SYSTEM ALERTS
  // ========================================================================
  console.log('🚨 Creating System Alerts...')

  const alertData = [
    { severity: AlertSeverity.CRITICAL, title: 'Stolen Asset - KR-BIKE-00890', desc: 'GPS signal lost for bike KR-BIKE-00890. Police report filed: REF-LPD-2025-0456.', entityType: 'ASSET', entityId: bikeIds[7], acknowledged: false, resolved: false, action: 'Coordinate with insurance provider for total loss claim.', bikeIdx: 7 },
    { severity: AlertSeverity.CRITICAL, title: 'Payment Fraud Pattern Detected', desc: 'Rider Ibrahim Musah flagged for potential fraud: GPS mismatch with claimed location.', entityType: 'RIDER', entityId: riderIds[3], acknowledged: true, resolved: false, action: 'Suspend account pending investigation.', bikeIdx: null },
    { severity: AlertSeverity.ERROR, title: 'Fleet Manager Below Performance Threshold', desc: 'Hauwa Kwaje performance score dropped to 45. Portfolio repayment rate at 62.3%.', entityType: 'FLEET_MANAGER', entityId: fmIds[5], acknowledged: false, resolved: false, action: 'Schedule performance review meeting.', bikeIdx: null },
    { severity: AlertSeverity.WARNING, title: 'Payout Blocked - Utilization Below Threshold', desc: 'Alhaji Mohammed weekly payout blocked. Fleet utilization below the 5-day minimum.', entityType: 'FINANCIAL', entityId: ownerIds[1], acknowledged: true, resolved: false, action: 'Notify fleet owner. Work with assigned managers.', bikeIdx: null },
    { severity: AlertSeverity.WARNING, title: 'Scheduled Maintenance Overdue', desc: '5 bikes are past their scheduled maintenance dates.', entityType: 'ASSET', entityId: 'system', acknowledged: false, resolved: false, action: 'Coordinate with maintenance vendors.', bikeIdx: null },
    { severity: AlertSeverity.INFO, title: 'New Rider Onboarding Batch', desc: '12 new riders have completed KYC verification and are pending fleet assignment.', entityType: 'RIDER', entityId: 'system', acknowledged: false, resolved: false, action: 'Review rider profiles and assign to fleet managers.', bikeIdx: null },
    { severity: AlertSeverity.WARNING, title: 'Payment Gateway Latency Spike', desc: 'Average payment processing time increased to 4.2s (SLA: <2s).', entityType: 'SYSTEM', entityId: 'payment-gateway', acknowledged: true, resolved: true, action: 'Monitor. Circuit breaker active.', bikeIdx: null },
    { severity: AlertSeverity.INFO, title: 'Monthly Compliance Report Ready', desc: 'January 2025 compliance report has been generated.', entityType: 'SYSTEM', entityId: 'compliance-report', acknowledged: false, resolved: false, action: 'Review report and submit before January 31 deadline.', bikeIdx: null },
  ]

  for (const a of alertData) {
    await prisma.systemAlert.create({
      data: {
        severity: a.severity,
        title: a.title,
        description: a.desc,
        entityType: a.entityType as any,
        entityId: a.entityId,
        isAcknowledged: a.acknowledged,
        isResolved: a.resolved,
        recommendedAction: a.action,
        bikeId: a.bikeIdx !== null ? bikeIds[a.bikeIdx] : null,
      }
    })
  }
  console.log(`✅ Created ${alertData.length} System Alerts\n`)

  // ========================================================================
  // 8. CREATE RISK ASSESSMENTS
  // ========================================================================
  console.log('⚠️ Creating Risk Assessments...')

  const riskData = [
    {
      entityId: riderIds[3], entityType: 'RIDER', riskLevel: RiskLevel.CRITICAL, riskScore: 92,
      factors: [
        { name: 'Payment History', score: 95, value: '62.5% repayment', isAcceptable: false },
        { name: 'GPS Compliance', score: 88, value: 'Last ping 5 days ago', isAcceptable: false },
        { name: 'Communication', score: 90, value: '14 days silent', isAcceptable: false },
        { name: 'Account Balance', score: 70, value: '-₦10,500', isAcceptable: false },
        { name: 'Incident Record', score: 40, value: '0 incidents', isAcceptable: true },
      ]
    },
    {
      entityId: fmIds[5], entityType: 'FLEET_MANAGER', riskLevel: RiskLevel.HIGH, riskScore: 78,
      factors: [
        { name: 'Portfolio Repayment', score: 82, value: '62.3%', isAcceptable: false },
        { name: 'Utilization Rate', score: 70, value: '68.9%', isAcceptable: false },
        { name: 'Incident Frequency', score: 85, value: '12 in 30 days', isAcceptable: false },
        { name: 'Rider Retention', score: 75, value: '70% retention', isAcceptable: false },
        { name: 'Performance Score', score: 78, value: '45/100', isAcceptable: false },
      ]
    },
    {
      entityId: ownerIds[1], entityType: 'FLEET_OWNER', riskLevel: RiskLevel.MEDIUM, riskScore: 45,
      factors: [
        { name: 'Utilization Rate', score: 55, value: '5.8 days/week', isAcceptable: true },
        { name: 'Payout Status', score: 60, value: '1 flagged payout', isAcceptable: false },
        { name: 'Asset Condition', score: 35, value: '85% active', isAcceptable: true },
        { name: 'Financial Health', score: 40, value: '28.7% ROI', isAcceptable: true },
      ]
    },
    {
      entityId: riderIds[7], entityType: 'RIDER', riskLevel: RiskLevel.MEDIUM, riskScore: 55,
      factors: [
        { name: 'Payment History', score: 60, value: '75% repayment', isAcceptable: false },
        { name: 'Activity Level', score: 65, value: 'Inactive 18 days', isAcceptable: false },
        { name: 'GPS Compliance', score: 40, value: 'No recent pings', isAcceptable: false },
        { name: 'Account Balance', score: 30, value: '₦0', isAcceptable: true },
      ]
    },
  ]

  for (const r of riskData) {
    const assessment = await prisma.riskAssessment.create({
      data: {
        entityId: r.entityId,
        entityType: r.entityType as any,
        riskLevel: r.riskLevel,
        riskScore: r.riskScore,
      }
    })

    for (const f of r.factors) {
      await prisma.riskFactor.create({
        data: {
          assessmentId: assessment.id,
          name: f.name,
          score: f.score,
          value: f.value,
          isAcceptable: f.isAcceptable,
        }
      })
    }
  }
  console.log(`✅ Created ${riskData.length} Risk Assessments\n`)

  // ========================================================================
  // 9. CREATE AUDIT LOGS
  // ========================================================================
  console.log('📋 Creating Audit Logs...')

  const auditData = [
    { actorId: 'admin-001', actorName: 'Super Admin', actorRole: UserRole.SUPER_ADMIN, action: 'SUSPEND_RIDER', category: 'ENFORCEMENT' as any, targetEntity: 'RIDER', targetId: riderIds[3], details: 'Suspended rider Ibrahim Musah for suspected fraud.', ip: '192.168.1.100', prevHash: 'a1b2c3d4e5f6' },
    { actorId: 'system', actorName: 'System', actorRole: UserRole.ADMIN, action: 'TIER_DOWNGRADE', category: 'OPERATIONS' as any, targetEntity: 'FLEET_MANAGER', targetId: fmIds[5], details: 'Automatic tier downgrade: Hauwa Kwaje moved from BRONZE to PROBATION.', ip: 'system', prevHash: 'f6e5d4c3b2a1' },
    { actorId: 'admin-002', actorName: 'Operations Lead', actorRole: UserRole.ADMIN, action: 'OVERRIDE_PAYOUT', category: 'FINANCIAL' as any, targetEntity: 'FLEET_OWNER', targetId: ownerIds[1], details: 'Approved payout override for Alhaji Mohammed pending utilization review.', ip: '192.168.1.101', prevHash: '1a2b3c4d5e6f' },
    { actorId: 'admin-001', actorName: 'Super Admin', actorRole: UserRole.SUPER_ADMIN, action: 'UPDATE_CONFIG', category: 'CONFIG' as any, targetEntity: 'SYSTEM_CONFIG', targetId: 'daily_payment_deadline', details: 'Changed daily payment deadline from 22:00 to 23:59 WAT.', ip: '192.168.1.100', prevHash: '6f5e4d3c2b1a' },
  ]

  for (const a of auditData) {
    const hash = `hash-${Date.now()}-${Math.random().toString(36).substring(7)}`
    await prisma.auditLogEntry.create({
      data: {
        actorId: a.actorId,
        actorName: a.actorName,
        actorRole: a.actorRole,
        action: a.action,
        category: a.category,
        targetEntity: a.targetEntity,
        targetId: a.targetId,
        details: a.details,
        ipAddress: a.ip,
        previousEntryHash: a.prevHash,
        entryHash: hash,
      }
    })
  }
  console.log(`✅ Created ${auditData.length} Audit Log Entries\n`)

  // ========================================================================
  // 10. CREATE SYSTEM CONFIGS
  // ========================================================================
  console.log('⚙️ Creating System Configs...')

  const configData = [
    { key: 'daily_payment_deadline', label: 'Daily Payment Deadline', description: 'Time by which riders must complete daily payments (WAT)', value: '23:59', type: 'STRING' as any, category: 'FINANCIAL' as any, isEditable: true, lastModifiedBy: 'admin-001' },
    { key: 'late_payment_grace_hours', label: 'Grace Period (Hours)', description: 'Hours after deadline before a payment is marked as overdue', value: '2', type: 'NUMBER' as any, category: 'FINANCIAL' as any, isEditable: true, lastModifiedBy: 'admin-001' },
    { key: 'max_unpaid_days_before_suspension', label: 'Max Unpaid Days (Suspension)', description: 'Consecutive unpaid days before automatic account suspension', value: '3', type: 'NUMBER' as any, category: 'OPERATIONS' as any, isEditable: true, lastModifiedBy: 'admin-001' },
    { key: 'bike_retrieval_threshold_days', label: 'Bike Retrieval Threshold', description: 'Unpaid days before bike retrieval protocol is initiated', value: '5', type: 'NUMBER' as any, category: 'OPERATIONS' as any, isEditable: true, lastModifiedBy: 'admin-001' },
    { key: 'maintenance_reserve_percentage', label: 'Maintenance Reserve %', description: 'Percentage of daily payment allocated to maintenance reserve fund', value: '5', type: 'NUMBER' as any, category: 'FINANCIAL' as any, isEditable: true, lastModifiedBy: 'admin-001' },
    { key: 'hmo_premium_monthly', label: 'Monthly HMO Premium', description: 'Monthly HMO premium amount deducted per rider (Naira)', value: '15000', type: 'NUMBER' as any, category: 'FINANCIAL' as any, isEditable: true, lastModifiedBy: 'admin-001' },
    { key: 'two_factor_required', label: 'Two-Factor Authentication', description: 'Require 2FA for all admin and manager logins', value: 'true', type: 'BOOLEAN' as any, category: 'SECURITY' as any, isEditable: true, lastModifiedBy: 'admin-001' },
    { key: 'audit_log_retention_days', label: 'Audit Log Retention', description: 'Number of days to retain audit log entries before archival', value: '365', type: 'NUMBER' as any, category: 'COMPLIANCE' as any, isEditable: false, lastModifiedBy: 'system' },
  ]

  for (const c of configData) {
    await prisma.systemConfig.create({
      data: c
    })
  }
  console.log(`✅ Created ${configData.length} System Configs\n`)

  // ========================================================================
  // 11. CREATE PLATFORM KPI SNAPSHOT
  // ========================================================================
  console.log('📊 Creating Platform KPI Snapshot...')

  await prisma.platformKPISnapshot.create({
    data: {
      totalRiders: 3847,
      activeRiders: 3214,
      totalFleetManagers: 86,
      totalFleetOwners: 23,
      totalBikes: 3456,
      activeBikes: 3198,
      fleetUtilizationRate: 92.5,
      avgRepaymentRate: 87.3,
      todayRevenue: 4872500,
      monthlyRevenue: 145200000,
      totalOutstandingPayments: 23450000,
      unresolvedAlerts: 14,
      criticalRiskItems: 3,
      pendingPayouts: 18750000,
      snapshotDate: new Date(),
    }
  })
  console.log('✅ Created Platform KPI Snapshot\n')

  // ========================================================================
  // 12. CREATE SUPER ADMIN USER
  // ========================================================================
  console.log('🔐 Creating Super Admin User...')

  await prisma.user.create({
    data: {
      email: 'admin@kowamart.com',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+234 900 000 0000',
      role: UserRole.SUPER_ADMIN,
      kycStatus: KycStatus.VERIFIED,
    }
  })
  console.log('✅ Created Super Admin User\n')

  console.log('🎉 Seeding complete!\n')
  console.log('Summary:')
  console.log(`  - Fleet Owners: ${fleetOwnerUsers.length}`)
  console.log(`  - Fleet Managers: ${fmData.length}`)
  console.log(`  - Riders: ${riderData.length}`)
  console.log(`  - Bike Assets: ${bikeData.length}`)
  console.log(`  - Transactions: ${txData.length}`)
  console.log(`  - Payout Summaries: ${payoutData.length}`)
  console.log(`  - System Alerts: ${alertData.length}`)
  console.log(`  - Risk Assessments: ${riskData.length}`)
  console.log(`  - Audit Log Entries: ${auditData.length}`)
  console.log(`  - System Configs: ${configData.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
