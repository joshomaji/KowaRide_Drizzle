/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * NextAuth.js v4 Configuration
 * ============================================================================
 *
 * Credentials-based authentication using Drizzle ORM + Supabase PostgreSQL.
 * Passwords are hashed with bcryptjs.
 *
 * @module lib/auth/config
 * ============================================================================
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { initDb } from "@/lib/db";
import { users } from "@/db/schema";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@kowaride.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const db = await initDb();
          if (!db) {
            throw new Error("Database connection not available");
          }

          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Verify password
          if (!user.passwordHash) {
            throw new Error("Account not configured for login. Contact administrator.");
          }

          const isValid = await compare(credentials.password, user.passwordHash);
          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          // Update last active timestamp
          try {
            await db
              .update(users)
              .set({ lastActiveAt: new Date() })
              .where(eq(users.id, user.id));
          } catch {
            // Non-critical — don't block login if update fails
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            kycStatus: user.kycStatus,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
          };
        } catch (error: any) {
          // Log the real error for debugging
          console.error("[AUTH] Login error:", error?.message || error);
          if (error?.cause) {
            console.error("[AUTH] Cause:", error.cause);
          }
          // Re-throw with a clean message so NextAuth doesn't leak SQL details
          if (error?.message?.includes("Failed query") || error?.message?.includes("ECONNREFUSED")) {
            throw new Error("Authentication service temporarily unavailable. Please try again.");
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT on first sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.kycStatus = user.kycStatus;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session from JWT
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.kycStatus = token.kycStatus as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.avatarUrl = token.avatarUrl as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
    kycStatus?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      kycStatus: string;
      firstName: string;
      lastName: string;
      phone: string;
      avatarUrl?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    kycStatus?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string | null;
  }
}
