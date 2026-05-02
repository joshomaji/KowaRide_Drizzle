/**
 * ============================================================================
 * KOWA RIDE - ROLE-BASED MOBILE FOOTER
 * Mobile Bottom Navigation Bar
 * ============================================================================
 *
 * Fixed bottom navigation bar visible only on mobile screens (below lg breakpoint).
 * Shows role-specific quick access items plus a "More" menu that opens the
 * full sidebar navigation drawer.
 *
 * Each role sees different quick access items:
 * - SUPER_ADMIN/ADMIN: Dashboard, Riders, Payments, Bikes, More
 * - FLEET_MANAGER: Dashboard, My Riders, Payments, Bikes, More
 * - FLEET_OWNER: Dashboard, My Fleet, Payouts, More
 * - RIDER: Dashboard, My Payments, My Bike, More
 *
 * @module components/admin/layout/mobile-footer
 * @version 2.0.0 (role-based navigation)
 * ============================================================================
 */

"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bike,
  Wallet,
  MoreHorizontal,
  Gauge,
  CreditCard,
  Users,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";
import { AdminSection, UserRole } from "@/types/admin";

// ============================================================================
// NAVIGATION ITEMS PER ROLE
// ============================================================================

interface MobileNavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
}

const ROLE_MOBILE_NAV: Record<string, MobileNavItem[]> = {
  [UserRole.SUPER_ADMIN]: [
    { id: AdminSection.OVERVIEW, label: "Dashboard", icon: LayoutDashboard },
    { id: AdminSection.RIDERS, label: "Riders", icon: Bike },
    { id: AdminSection.FINANCIALS, label: "Payments", icon: Wallet },
    { id: AdminSection.FLEET, label: "Bikes", icon: Gauge },
  ],
  [UserRole.ADMIN]: [
    { id: AdminSection.OVERVIEW, label: "Dashboard", icon: LayoutDashboard },
    { id: AdminSection.RIDERS, label: "Riders", icon: Bike },
    { id: AdminSection.FINANCIALS, label: "Payments", icon: Wallet },
    { id: AdminSection.FLEET, label: "Bikes", icon: Gauge },
  ],
  [UserRole.FLEET_MANAGER]: [
    { id: AdminSection.OVERVIEW, label: "Dashboard", icon: LayoutDashboard },
    { id: AdminSection.RIDERS, label: "My Riders", icon: Users },
    { id: AdminSection.FINANCIALS, label: "Payments", icon: Wallet },
    { id: AdminSection.FLEET, label: "Bikes", icon: Gauge },
  ],
  [UserRole.FLEET_OWNER]: [
    { id: AdminSection.OVERVIEW, label: "Dashboard", icon: LayoutDashboard },
    { id: AdminSection.FLEET, label: "My Fleet", icon: Bike },
    { id: AdminSection.FINANCIALS, label: "Payouts", icon: Crown },
  ],
  [UserRole.RIDER]: [
    { id: AdminSection.OVERVIEW, label: "Dashboard", icon: LayoutDashboard },
    { id: AdminSection.FINANCIALS, label: "Payments", icon: CreditCard },
    { id: AdminSection.FLEET, label: "My Bike", icon: Bike },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export function MobileFooter() {
  const { data: session } = useSession();
  const { activeSection, setActiveSection, setMobileSidebarOpen } =
    useAdminStore();

  const userRole = session?.user?.role || UserRole.SUPER_ADMIN;
  const mobileNavItems = ROLE_MOBILE_NAV[userRole] || ROLE_MOBILE_NAV[UserRole.SUPER_ADMIN];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-16 items-center justify-around px-1">
        {mobileNavItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors duration-200",
                "active:scale-95 transition-transform duration-100",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="mobile-footer-active"
                  className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-emerald-500"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <Icon
                className={cn(
                  "size-5 transition-colors duration-200",
                  isActive && "drop-shadow-sm"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight font-medium",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More button — opens sidebar */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors duration-200",
            "active:scale-95 transition-transform duration-100",
            "text-muted-foreground"
          )}
        >
          <div className="flex size-5 items-center justify-center">
            <MoreHorizontal className="size-5" strokeWidth={2} />
          </div>
          <span className="text-[10px] leading-tight font-medium text-muted-foreground">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
