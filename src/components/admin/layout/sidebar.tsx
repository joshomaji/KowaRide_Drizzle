/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Sidebar Navigation Component
 * ============================================================================
 *
 * Responsive sidebar navigation with collapsible support, active state tracking,
 * section grouping, and badge indicators for alerts/notifications.
 *
 * Features:
 * - Collapsible to icon-only mode on desktop
 * - Slide-over overlay on mobile devices
 * - Section grouping with visual separators
 * - Notification badges on alert-heavy sections
 * - Smooth animations via Framer Motion
 * - Keyboard accessible navigation
 *
 * @module components/admin/layout/sidebar
 * ============================================================================
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bike,
  Users,
  UserCog,
  Crown,
  Wallet,
  ArrowLeftRight,
  ShieldAlert,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  AlertTriangle,
  X,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";
import { AdminSection } from "@/types/admin";
import { mockAlerts } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

/** Navigation item definition */
interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  /** Show a notification badge count (computed dynamically) */
  badgeCount?: number;
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
}

/**
 * Navigation items organized into logical groups.
 * Order here determines the display order in the sidebar.
 */
const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { id: AdminSection.OVERVIEW, label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    label: "User Management",
    items: [
      { id: AdminSection.RIDERS, label: "Riders", icon: Bike },
      { id: AdminSection.FLEET_MANAGERS, label: "Fleet Managers", icon: UserCog },
      { id: AdminSection.FLEET_OWNERS, label: "Fleet Owners", icon: Crown },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        id: AdminSection.FINANCIALS,
        label: "Financials",
        icon: Wallet,
      },
      {
        id: AdminSection.TRANSACTIONS,
        label: "Transactions",
        icon: ArrowLeftRight,
      },
      {
        id: AdminSection.EXPENSES,
        label: "Expenses",
        icon: Receipt,
      },
      {
        id: AdminSection.FLEET,
        label: "Fleet & Assets",
        icon: Bike,
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        id: AdminSection.RISK,
        label: "Risk & Compliance",
        icon: ShieldAlert,
        badgeCount: mockAlerts.filter((a) => !a.isAcknowledged).length,
        badgeVariant: "destructive" as const,
      },
      {
        id: AdminSection.AUDIT,
        label: "Audit Logs",
        icon: FileText,
      },
    ],
  },
  {
    label: "System",
    items: [
      { id: AdminSection.SETTINGS, label: "Settings", icon: Settings },
    ],
  },
];

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export function AdminSidebar() {
  const {
    activeSection,
    sidebarCollapsed,
    mobileSidebarOpen,
    setActiveSection,
    toggleSidebar,
    setMobileSidebarOpen,
    unreadCount,
  } = useAdminStore();

  /**
   * Renders a single navigation item with proper styling, tooltips,
   * and active state indication.
   */
  const renderNavItem = (item: NavItem) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    /** Click handler: set active section and close mobile sidebar */
    const handleClick = () => {
      setActiveSection(item.id);
    };

    // Desktop collapsed mode: show icon with tooltip
    if (sidebarCollapsed && !mobileSidebarOpen) {
      return (
        <TooltipProvider delayDuration={0} key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleClick}
                className={cn(
                  "relative flex w-full items-center justify-center rounded-xl p-3 transition-all duration-200",
                  "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-400 shadow-lg shadow-emerald-500/10"
                    : "text-slate-400 hover:text-white"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {item.badgeCount && item.badgeCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {item.badgeCount > 9 ? "9+" : item.badgeCount}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
              {item.badgeCount && item.badgeCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">
                  {item.badgeCount}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Expanded mode: icon + label + optional badge
    return (
      <button
        key={item.id}
        onClick={handleClick}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
          isActive
            ? "bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-400 shadow-lg shadow-emerald-500/10"
            : "text-slate-400 hover:text-white"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.badgeCount && item.badgeCount > 0 && (
          <Badge
            variant={item.badgeVariant || "destructive"}
            className="ml-auto text-[10px] px-1.5 py-0"
          >
            {item.badgeCount}
          </Badge>
        )}
      </button>
    );
  };

  /** Sidebar content shared between desktop and mobile views */
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* ---------------------------------------------------------------
          Brand Header
          --------------------------------------------------------------- */}
      <div className="flex items-center gap-3 px-4 py-5">
        {/* Kowa Ride Logo Mark */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
          <Bike className="h-5 w-5 text-white" />
        </div>
        {/* Brand Text (hidden when collapsed) */}
        <AnimatePresence>
          {(!sidebarCollapsed || mobileSidebarOpen) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h1 className="whitespace-nowrap text-lg font-bold tracking-tight text-white">
                Kowa Ride
              </h1>
              <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-emerald-400/80">
                Superadmin
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button for mobile */}
        {mobileSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 text-slate-400 hover:text-white lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* ---------------------------------------------------------------
          Navigation Groups
          --------------------------------------------------------------- */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {/* Group Label */}
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
            )}
            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="bg-white/10" />

      {/* ---------------------------------------------------------------
          Footer Actions
          --------------------------------------------------------------- */}
      <div className="p-3 space-y-1">
        {/* Notifications Quick Access */}
        <button
          onClick={() => setActiveSection(AdminSection.RISK)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-slate-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {(!sidebarCollapsed || mobileSidebarOpen) && (
            <span className="truncate">Notifications</span>
          )}
        </button>

        {/* Collapse Toggle (desktop only) */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-slate-400 hover:bg-white/10 hover:text-white"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="truncate">Collapse</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-slate-500 hover:bg-red-500/10 hover:text-red-400"
          )}
        >
          <LogOut className="h-5 w-5" />
          {(!sidebarCollapsed || mobileSidebarOpen) && (
            <span className="truncate">Sign Out</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ==================================================================
          Desktop Sidebar (sticky, collapsible)
          ================================================================== */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 hidden h-screen flex-col border-r border-white/5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 lg:flex"
      >
        {sidebarContent}
      </motion.aside>

      {/* ==================================================================
          Mobile Sidebar (overlay)
          ================================================================== */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-white/5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
