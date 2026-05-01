---
Task ID: 1
Agent: Main Agent
Task: Rewrite Prisma schema from SQLite → PostgreSQL with all KowaRiders business entities

Work Log:
- Read and analyzed all KowaRiders TypeScript types from `/home/z/my-project/KowaRiders/src/types/admin.ts`
- Read existing mock data structure from `/home/z/my-project/KowaRiders/src/lib/mock-data.ts`
- Designed comprehensive PostgreSQL schema covering all business entities
- Rewrote `prisma/schema.prisma` with 20 models and 22 enums
- Fixed Prisma relation validation errors (bidirectional relations, unique constraints, polymorphic patterns)
- Validated schema successfully with `prisma validate`
- Generated Prisma client with `prisma generate`
- Updated `.env` with Supabase PostgreSQL connection placeholders (DATABASE_URL + DIRECT_URL)
- Updated `src/lib/db.ts` with PostgreSQL-compatible Prisma client (datasourceUrl)
- Created comprehensive seed script at `prisma/seed.ts` with all mock data
- Added seed script configuration to `package.json`

Stage Summary:
- Schema: 20 models, 22 enums, full PostgreSQL with column mapping
- Key models: User, Rider, FleetManager, FleetOwner, BikeAsset, Transaction, DailyPayment, PayoutSummary, Expense, PayoutRecord, SystemAlert, RiskAssessment, RiskFactor, AuditLogEntry, SystemConfig, PlatformKPISnapshot, ChartDataPoint, ActivityItem, OwnerBankDetail, BikeMaintenanceRecord
- All models use PostgreSQL-native types (Decimal, Json, DateTime)
- Column names mapped to snake_case via @map()
- Table names use plural snake_case via @@map()
- Proper indexes on frequently queried fields
- Seed script covers all mock data (10 riders, 6 fleet managers, 5 fleet owners, 8 bikes, 12 transactions, etc.)
- Waiting for Supabase credentials to connect and push schema
