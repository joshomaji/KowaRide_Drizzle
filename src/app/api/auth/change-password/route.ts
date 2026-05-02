/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Change Password API Route (POST)
 * ============================================================================
 *
 * Allows authenticated users to change their password.
 * Validates current password, hashes new password with bcryptjs,
 * and updates the passwordHash in the users table.
 *
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword, confirmPassword }
 *
 * @module app/api/auth/change-password
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { authOptions } from "@/lib/auth/config";
import { initDb } from "@/lib/db";
import { users } from "@/db/schema";

// ============================================================================
// POST — Change user password
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate all fields are provided
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 }
      );
    }

    // Validate new password matches confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const db = await initDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    // Fetch current user with password hash
    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Account not configured for password login. Contact administrator." },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await hash(newPassword, saltRounds);

    // Update password in database
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("[CHANGE PASSWORD] Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
