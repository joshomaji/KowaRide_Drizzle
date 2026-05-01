"use client";

/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Auth Session Provider Wrapper
 * ============================================================================
 */

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
