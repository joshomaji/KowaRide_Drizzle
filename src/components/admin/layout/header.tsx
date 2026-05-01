/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Top Header Bar Component
 * ============================================================================
 *
 * Responsive header with global search, notification center, user menu,
 * and breadcrumb navigation. Stays fixed at the top on scroll.
 *
 * @module components/admin/layout/header
 * ============================================================================
 */

"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";
import { mockAlerts } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertSeverity, AdminSection } from "@/types/admin";
import { format } from "date-fns";

// ============================================================================
// SECTION TITLE MAP
// ============================================================================

/** Maps admin sections to display-friendly titles and descriptions */
const sectionMeta: Record<string, { title: string; description: string }> = {
  OVERVIEW: {
    title: "Dashboard Overview",
    description: "Platform-wide metrics and key performance indicators",
  },
  RIDERS: {
    title: "Rider Management",
    description: "Manage rider onboarding, profiles, and performance",
  },
  FLEET_MANAGERS: {
    title: "Fleet Managers",
    description: "Monitor manager performance and portfolio health",
  },
  FLEET_OWNERS: {
    title: "Fleet Owners",
    description: "Owner ROI tracking, payouts, and asset oversight",
  },
  FINANCIALS: {
    title: "Financial Overview",
    description: "Revenue, allocations, and payout management",
  },
  TRANSACTIONS: {
    title: "Transaction Ledger",
    description: "Full double-entry transaction history and reconciliation",
  },
  FLEET: {
    title: "Fleet & Assets",
    description: "Bike inventory, GPS tracking, and maintenance scheduling",
  },
  RISK: {
    title: "Risk & Compliance",
    description: "Risk scoring, system alerts, and compliance monitoring",
  },
  AUDIT: {
    title: "Audit Logs",
    description: "Immutable activity trail for compliance and dispute resolution",
  },
  SETTINGS: {
    title: "System Settings",
    description: "Platform configuration, rule engine, and system parameters",
  },
};

// ============================================================================
// SEVERITY STYLING MAP
// ============================================================================

const severityStyles: Record<AlertSeverity, string> = {
  [AlertSeverity.CRITICAL]: "bg-red-500/10 text-red-400 border-red-500/20",
  [AlertSeverity.ERROR]: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  [AlertSeverity.WARNING]: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  [AlertSeverity.INFO]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const severityDots: Record<AlertSeverity, string> = {
  [AlertSeverity.CRITICAL]: "bg-red-500",
  [AlertSeverity.ERROR]: "bg-orange-500",
  [AlertSeverity.WARNING]: "bg-amber-500",
  [AlertSeverity.INFO]: "bg-blue-500",
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================

export function AdminHeader() {
  const { data: session } = useSession();
  const {
    activeSection,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    searchQuery,
    setSearchQuery,
    unreadCount,
    decrementUnreadCount,
  } = useAdminStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const meta = sectionMeta[activeSection] || sectionMeta.OVERVIEW;
  const unacknowledgedAlerts = mockAlerts.filter((a) => !a.isAcknowledged);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* ---------------------------------------------------------------
            Mobile Menu Button
            --------------------------------------------------------------- */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-foreground/70 hover:text-foreground lg:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        {/* ---------------------------------------------------------------
            Section Title (Desktop)
            --------------------------------------------------------------- */}
        <div className="hidden min-w-0 flex-1 md:block">
          <h2 className="truncate text-lg font-semibold text-foreground">
            {meta.title}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {meta.description}
          </p>
        </div>

        {/* ---------------------------------------------------------------
            Search Bar
            --------------------------------------------------------------- */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search riders, bikes, transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-full rounded-lg border-border bg-muted/50 pl-9 pr-3 text-sm focus:bg-background"
                      autoFocus
                      onBlur={() => {
                        if (!searchQuery) setSearchOpen(false);
                      }}
                    />
                  </div>
                </motion.div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </AnimatePresence>
          </div>

          {/* ---------------------------------------------------------------
              Notification Bell
              --------------------------------------------------------------- */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={8}
              collisionPadding={16}
              className="w-[380px] max-w-[calc(100vw-2rem)] p-0 overflow-hidden"
            >
              {/* Notification Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Notifications
                  </h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {unacknowledgedAlerts.length} new
                </Badge>
              </div>
              {/* Notification List */}
              <ScrollArea className="h-[340px]">
                <div className="divide-y divide-border">
                  {unacknowledgedAlerts.length === 0 ? (
                    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-muted-foreground">
                      <Bell className="mb-3 size-8 opacity-30" />
                      <p className="text-sm font-medium">All caught up</p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">No new notifications</p>
                    </div>
                  ) : (
                    unacknowledgedAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="min-w-0"
                      >
                        <button
                          onClick={() => {
                            decrementUnreadCount();
                          }}
                          className="flex w-full gap-3 overflow-hidden px-4 py-3 text-left transition-colors hover:bg-muted/50"
                        >
                          <div
                            className={cn(
                              "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                              severityDots[alert.severity]
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {alert.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {alert.description}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground/70">
                              {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* ---------------------------------------------------------------
              Theme Toggle (placeholder)
              --------------------------------------------------------------- */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* ---------------------------------------------------------------
              User Profile Dropdown
              --------------------------------------------------------------- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-lg px-2 hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-white">
                    {session?.user?.firstName?.[0] || "S"}{session?.user?.lastName?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-foreground">{session?.user?.firstName || "Super"} {session?.user?.lastName || "Admin"}</p>
                  <p className="text-[10px] text-muted-foreground">{session?.user?.email || "admin@kowaride.com"}</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{session?.user?.firstName || "Super"} {session?.user?.lastName || "Admin"}</p>
                  <p className="text-xs text-slate-500">{session?.user?.email || "admin@kowaride.com"}</p>
                  <p className="text-[10px] text-emerald-500 font-medium">{session?.user?.role || "SUPER_ADMIN"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => useAdminStore.getState().setActiveSection(AdminSection.SETTINGS)}>
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ---------------------------------------------------------------
          Mobile Section Title
          --------------------------------------------------------------- */}
      <div className="border-t border-border px-4 py-2 md:hidden">
        <h2 className="text-sm font-semibold text-foreground">{meta.title}</h2>
      </div>
    </header>
  );
}
