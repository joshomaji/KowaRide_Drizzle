/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Profile API Route (GET & PUT)
 * ============================================================================
 *
 * Handles fetching and updating the authenticated user's profile.
 * Uses Drizzle ORM with Supabase PostgreSQL.
 *
 * GET  /api/auth/profile — Returns current user profile
 * PUT  /api/auth/profile — Updates firstName, lastName, phone, avatarUrl
 *
 * @module app/api/auth/profile
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth/config";
import { initDb } from "@/lib/db";
import { users } from "@/db/schema";

// ============================================================================
// GET — Fetch current user profile
// ============================================================================

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await initDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        kycStatus: users.kycStatus,
        lastActiveAt: users.lastActiveAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
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

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("[PROFILE GET] Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT — Update user profile
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, avatarUrl } = body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "First name, last name, and phone are required" },
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

    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({
        firstName,
        lastName,
        phone,
        avatarUrl: avatarUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        kycStatus: users.kycStatus,
        lastActiveAt: users.lastActiveAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("[PROFILE PUT] Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
