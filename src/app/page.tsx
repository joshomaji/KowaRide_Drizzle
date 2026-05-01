/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Main Entry Point (Single Page Application)
 * ============================================================================
 *
 * This is the root page of the Superadmin dashboard. It renders the
 * AdminLayout shell (sidebar + header) and conditionally displays
 * the active section based on Zustand store state.
 *
 * Navigation is handled entirely client-side via the AdminSection enum
 * stored in the admin Zustand store.
 *
 * Architecture Note:
 * In production, each section would be a lazy-loaded route via Next.js
 * dynamic imports. For this implementation, all sections are rendered
 * conditionally within a single page component.
 *
 * @module app/page
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

"use client";

import { AdminLayout } from "@/components/admin/layout/admin-layout";
import { useAdminStore } from "@/store/admin-store";
import { AdminSection } from "@/types/admin";

// ============================================================================
// SECTION COMPONENTS
// ============================================================================
// Each page section is a self-contained module that handles its own
// data fetching (from mock data) and rendering logic.

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

// ============================================================================
// SECTION RENDERER MAP
// ============================================================================
// Maps each AdminSection enum value to its corresponding React component.
// This pattern enables clean, maintainable section switching without
// long conditional chains.

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
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  /** Read the active section from global Zustand store */
  const activeSection = useAdminStore((state) => state.activeSection);

  /**
   * Resolve the component to render for the current section.
   * Falls back to DashboardOverview if section is somehow invalid.
   */
  const ActiveSectionComponent = sectionComponents[activeSection] || DashboardOverview;

  return (
    /**
     * AdminLayout provides:
     * - Collapsible sidebar navigation (desktop)
     * - Mobile sidebar overlay
     * - Fixed top header bar
     * - Scrollable content area
     */
    <AdminLayout>
      {/*
        Key prop ensures React remounts the section component
        when the active section changes, triggering entrance
        animations and resetting local state.
      */}
      <div key={activeSection} className="p-4 md:p-6">
        <ActiveSectionComponent />
      </div>
    </AdminLayout>
  );
}
