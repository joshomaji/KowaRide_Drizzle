/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Main Entry Point (Single Page Application with Auth)
 * ============================================================================
 *
 * This is the root page of the Superadmin dashboard. It checks authentication
 * status and shows either the Login page or the Dashboard.
 *
 * Navigation is handled entirely client-side via the AdminSection enum
 * stored in the admin Zustand store.
 *
 * @module app/page
 * @version 2.0.0 (with authentication)
 * ============================================================================
 */

"use client";

import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { useAdminStore } from "@/store/admin-store";
import { AdminSection } from "@/types/admin";
import LoginPage from "@/components/auth/login-page";
import { Loader2 } from "lucide-react";

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

import { DashboardOverview } from "@/components/admin/dashboard/overview";
import { RidersPage } from "@/components/admin/users/riders-page";
import { FleetManagersPage } from "@/components/admin/users/fleet-managers-page";
import { FleetOwnersPage } from "@/components/admin/users/fleet-owners-page";
import { FinancialPage } from "@/components/admin/financial/financial-page";
import { TransactionsPage } from "@/components/admin/financial/transactions-page";
import { ExpensesPage } from "@/components/admin/financial/expenses-page";
import { FleetPage } from "@/components/admin/fleet/fleet-page";
import { RiskPage } from "@/components/admin/risk/risk-page";
import { AuditPage } from "@/components/admin/audit/audit-page";
import { SettingsPage } from "@/components/admin/settings/settings-page";
import { ProfilePage } from "@/components/admin/settings/profile-page";

// ============================================================================
// SECTION RENDERER MAP
// ============================================================================

const sectionComponents: Record<AdminSection, React.ComponentType> = {
  [AdminSection.OVERVIEW]: DashboardOverview,
  [AdminSection.RIDERS]: RidersPage,
  [AdminSection.FLEET_MANAGERS]: FleetManagersPage,
  [AdminSection.FLEET_OWNERS]: FleetOwnersPage,
  [AdminSection.FINANCIALS]: FinancialPage,
  [AdminSection.TRANSACTIONS]: TransactionsPage,
  [AdminSection.EXPENSES]: ExpensesPage,
  [AdminSection.FLEET]: FleetPage,
  [AdminSection.ASSETS]: FleetPage,
  [AdminSection.RISK]: RiskPage,
  [AdminSection.AUDIT]: AuditPage,
  [AdminSection.SETTINGS]: SettingsPage,
  [AdminSection.PROFILE]: ProfilePage,
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const { data: session, status } = useSession();
  const activeSection = useAdminStore((state) => state.activeSection);

  // Show loading spinner while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (status === "unauthenticated" || !session) {
    return <LoginPage />;
  }

  // Show dashboard for authenticated users
  const ActiveSectionComponent = sectionComponents[activeSection] || DashboardOverview;

  return (
    <AdminLayout>
      <div key={activeSection} className="p-4 md:p-6">
        <ActiveSectionComponent />
      </div>
    </AdminLayout>
  );
}
