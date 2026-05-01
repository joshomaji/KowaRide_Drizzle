/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Admin User Seeding Script
 * ============================================================================
 *
 * Creates the initial superadmin user in the database.
 * Run with: bun run db:seed
 *
 * Default login credentials:
 *   Email:    admin@kowaride.com
 *   Password: KowaR1d3@2024!
 *
 * ============================================================================
 */

import { hash } from "bcryptjs";
import { initDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@kowaride.com";
const ADMIN_PASSWORD = "KowaR1d3@2024!";

async function seedAdmin() {
  console.log("🌱 Seeding admin user...\n");

  const db = await initDb();
  if (!db) {
    console.error("❌ Database connection not available. Check your .env file.");
    process.exit(1);
  }

  try {
    // Check if admin already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existing) {
      console.log("⚠️  Admin user already exists, skipping creation.");
      console.log(`   Email: ${ADMIN_EMAIL}`);
      return;
    }

    // Hash password
    const passwordHash = await hash(ADMIN_PASSWORD, 12);

    // Create admin user
    await db.insert(users).values({
      id: "admin_super_001",
      email: ADMIN_EMAIL,
      firstName: "Super",
      lastName: "Admin",
      phone: "+2348012345678",
      role: "SUPER_ADMIN",
      kycStatus: "VERIFIED",
      passwordHash,
      lastActiveAt: new Date(),
    });

    console.log("✅ Admin user created successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 LOGIN CREDENTIALS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("⚠️  IMPORTANT: Change this password after first login!");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedAdmin();
