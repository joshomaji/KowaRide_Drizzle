/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Admin Layout Shell Component
 * ============================================================================
 *
 * Master layout shell composing the sidebar, header, main content area,
 * and mobile bottom navigation bar. Provides:
 *
 * - Collapsible sidebar navigation (desktop, lg+)
 * - Slide-over sidebar overlay (mobile, below lg)
 * - Fixed top header bar with search, notifications, and user menu
 * - Scrollable main content area with proper padding
 * - Fixed bottom tab bar (mobile, below lg) with quick navigation
 *
 * On mobile, the main content area has extra bottom padding to prevent
 * the fixed footer from overlapping page content.
 *
 * @module components/admin/layout/admin-layout
 * ============================================================================
 */

"use client";

import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";
import { MobileFooter } from "./mobile-footer";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/40 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <AdminSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <AdminHeader />

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation bar */}
      <MobileFooter />
    </div>
  );
}
