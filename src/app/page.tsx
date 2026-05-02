/**
 * ============================================================================
 * KOWA RIDE - MAIN ENTRY POINT
 * Role-Based Dashboard with Auth
 * ============================================================================
 *
 * Root page that checks authentication and renders the appropriate
 * role-specific dashboard. Each role (Super Admin, Fleet Manager,
 * Fleet Owner, Rider) gets its own unique dashboard experience.
 *
 * Navigation is handled client-side via the AdminSection enum
 * stored in the Zustand admin store.
 *
 * @module app/page
 * @version 3.0.0 (role-based dashboards)
 * ============================================================================
 */

"use client";

import { useSession } from "next-auth/react";
import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { useAdminStore } from "@/store/admin-store";
import { AdminSection, UserRole } from "@/types/admin";
import LoginPage from "@/components/auth/login-page";
import { Loader2 } from "lucide-react";

// ============================================================================
// SHARED SECTION COMPONENTS
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
// ROLE-SPECIFIC DASHBOARD OVERVIEWS
// ============================================================================

import { FleetManagerOverview } from "@/components/fleet-manager/dashboard/overview";
import { FleetOwnerOverview } from "@/components/fleet-owner/dashboard/overview";
import { RiderOverview } from "@/components/rider/dashboard/overview";

// ============================================================================
// ROLE-SPECIFIC OVERVIEW MAP (defined at module level, not during render)
// ============================================================================

const roleOverviewMap: Record<string, React.ComponentType> = {
  [UserRole.SUPER_ADMIN]: DashboardOverview,
  [UserRole.ADMIN]: DashboardOverview,
  [UserRole.FLEET_MANAGER]: FleetManagerOverview,
  [UserRole.FLEET_OWNER]: FleetOwnerOverview,
  [UserRole.RIDER]: RiderOverview,
};

// ============================================================================
// SHARED SECTION COMPONENTS MAP
// ============================================================================

const sectionComponents: Record<AdminSection, React.ComponentType> = {
  [AdminSection.OVERVIEW]: DashboardOverview, // fallback, overridden by role
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
// SECTION RENDERER COMPONENT
// ============================================================================

/** Renders the correct section based on active section and user role */
function SectionRenderer({ activeSection, userRole }: { activeSection: AdminSection; userRole: string }) {
  // For OVERVIEW, use the role-specific dashboard
  if (activeSection === AdminSection.OVERVIEW) {
    const RoleOverview = roleOverviewMap[userRole] || DashboardOverview;
    return <RoleOverview />;
  }

  // For other sections, use the shared section component
  const SectionComponent = sectionComponents[activeSection] || DashboardOverview;
  return <SectionComponent />;
}

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

  const userRole = session?.user?.role || UserRole.SUPER_ADMIN;

  return (
    <AdminLayout>
      <div key={activeSection} className="p-0 md:p-0">
        <SectionRenderer activeSection={activeSection} userRole={userRole} />
      </div>
    </AdminLayout>
  );
}
