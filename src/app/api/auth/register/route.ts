/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * User Registration API Route
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import { initDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, role } = body;

    // Validation
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
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

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const userId = createId();
    await db.insert(users).values({
      id: userId,
      email,
      firstName,
      lastName,
      phone,
      role: role || "RIDER",
      kycStatus: "PENDING",
      passwordHash,
      lastActiveAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { id: userId, email, firstName, lastName, role: role || "RIDER" },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
