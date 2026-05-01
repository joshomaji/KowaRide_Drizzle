"use client";

/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Dashboard Overview Component
 * ============================================================================
 *
 * The main landing page for the superadmin dashboard, providing a
 * bird's-eye view of the entire Kowa Ride platform. Displays critical
 * KPIs, revenue trends, collection rates, fleet utilization, and a
 * real-time activity feed.
 *
 * @module components/admin/dashboard/overview
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  Activity,
  Banknote,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Eye,
  MessageSquareWarning,
  Ban,
  MoreHorizontal,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  mockKPIs,
  revenueChartData,
  collectionChartData,
  utilizationChartData,
  mockActivityFeed,
  mockRiders,
  mockBikes,
} from "@/lib/mock-data";

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

/** Stagger container for child animations — 0.05s delay between each item */
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/** Fade-up animation for individual KPI cards and feed items */
const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Fade-in with slight Y offset for chart sections */
const fadeInChart = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a Naira (₦) amount into a compact, human-readable string.
 * - Values >= 1 billion: "₦1.23B"
 * - Values >= 1 million:  "₦4.87M"
 * - Values >= 1 thousand: "₦500K"
 * - Values < 1 thousand:  "₦450"
 */
function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

/**
 * Returns a color class for activity feed type indicators.
 * - PAYMENT: emerald (green, money in)
 * - ALERT: red (requires attention)
 * - RIDER: teal (user-related)
 * - SYSTEM: slate (neutral system event)
 * - FLEET: orange (fleet operations)
 * - FINANCIAL: cyan (money movement)
 */
function getActivityDotColor(type: string): string {
  const colors: Record<string, string> = {
    PAYMENT: "bg-emerald-500",
    ALERT: "bg-red-500",
    RIDER: "bg-teal-500",
    SYSTEM: "bg-slate-400",
    FLEET: "bg-orange-500",
    FINANCIAL: "bg-cyan-600",
  };
  return colors[type] ?? "bg-slate-400";
}

/**
 * Returns the appropriate bar color based on utilization percentage.
 * - >= 90%: emerald (excellent)
 * - >= 80%: green (good)
 * - >= 70%: amber (needs improvement)
 * - < 70%:  red-orange (critical)
 */
function getUtilizationBarColor(value: number): string {
  if (value >= 90) return "#10b981";
  if (value >= 80) return "#22c55e";
  if (value >= 70) return "#f59e0b";
  return "#ef4444";
}

// ============================================================================
// KPI CARD DEFINITIONS
// ============================================================================

/**
 * Configuration for the 6 KPI stat cards displayed at the top of the dashboard.
 * Each card specifies its title, icon, display value, subtitle, and color theme.
 */
const kpiCards = [
  {
    title: "Active Riders",
    icon: Bike,
    value: mockKPIs.totalRiders.toLocaleString(),
    subtitle: `${mockKPIs.activeRiders.toLocaleString()} active on platform`,
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    trend: null,
  },
  {
    title: "Fleet Utilization",
    icon: Activity,
    value: `${mockKPIs.fleetUtilizationRate}%`,
    subtitle: `${mockKPIs.activeBikes.toLocaleString()} of ${mockKPIs.totalBikes.toLocaleString()} bikes`,
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    trend: null,
  },
  {
    title: "Today's Revenue",
    icon: Banknote,
    value: formatNairaCompact(mockKPIs.todayRevenue),
    subtitle: "vs yesterday",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    trend: null,
  },
  {
    title: "Avg Repayment Rate",
    icon: TrendingUp,
    value: `${mockKPIs.avgRepaymentRate}%`,
    subtitle: "Across all active riders",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    trend: null,
  },
  {
    title: "Pending Payouts",
    icon: Wallet,
    value: formatNairaCompact(mockKPIs.pendingPayouts),
    subtitle: "To be processed",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    trend: null,
  },
  {
    title: "Critical Alerts",
    icon: AlertTriangle,
    value: mockKPIs.criticalRiskItems.toString(),
    subtitle: `${mockKPIs.unresolvedAlerts} total unresolved alerts`,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    trend: null,
  },
];

// ============================================================================
// CUSTOM TOOLTIP COMPONENT
// ============================================================================

/** Custom tooltip component for Recharts with dark-on-light styling */
function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-semibold text-foreground">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// ============================================================================
// RECENT RIDER ACTIVITIES MOCK DATA
// ============================================================================

/** Recent rider payment activity for the dashboard table */
const recentRiderActivities = [
  { rider: "Chukwuemeka Okonkwo", riderId: "KR-2024-00123", avatarUrl: "https://i.pravatar.cc/80?img=11", plateNo: "LAG-123-AB", status: "Paid", amount: 3500, time: "23:45", date: "2025-01-15" },
  { rider: "Aishat Abubakar", riderId: "KR-2024-00456", avatarUrl: "https://i.pravatar.cc/80?img=5", plateNo: "LAG-456-CD", status: "Paid", amount: 3500, time: "22:30", date: "2025-01-15" },
  { rider: "Olumide Adeyemi", riderId: "KR-2024-00789", avatarUrl: "https://i.pravatar.cc/80?img=12", plateNo: "ABJ-789-EF", status: "Paid", amount: 3000, time: "21:15", date: "2025-01-15" },
  { rider: "Blessing Okafor", riderId: "KR-2024-00567", avatarUrl: "https://i.pravatar.cc/80?img=26", plateNo: "LAG-345-IJ", status: "Over Due", amount: 3500, time: "--:--", date: "2025-01-15" },
  { rider: "Abdulahi Garba", riderId: "KR-2024-00345", avatarUrl: "https://i.pravatar.cc/80?img=15", plateNo: "IBD-012-GH", status: "Paid", amount: 3000, time: "19:30", date: "2025-01-15" },
  { rider: "Fatimah Ibrahim", riderId: "KR-2024-00890", avatarUrl: "https://i.pravatar.cc/80?img=45", plateNo: "KAD-678-KL", status: "Partially Paid", amount: 3500, time: "18:45", date: "2025-01-15" },
  { rider: "Emeka Nwachukwu", riderId: "KR-2024-00901", avatarUrl: "https://i.pravatar.cc/80?img=68", plateNo: "PH-901-MN", status: "Paid", amount: 3500, time: "17:20", date: "2025-01-15" },
  { rider: "Ibrahim Musah", riderId: "KR-2024-00234", avatarUrl: "https://i.pravatar.cc/80?img=53", plateNo: "LAG-789-KL", status: "Over Due", amount: 3000, time: "--:--", date: "2025-01-14" },
  { rider: "Yusuf Bello", riderId: "KR-2024-00678", avatarUrl: "https://i.pravatar.cc/80?img=52", plateNo: "ABJ-234-OP", status: "Pending", amount: 3000, time: "--:--", date: "2025-01-15" },
  { rider: "Chioma Eze", riderId: "KR-2025-01001", avatarUrl: "https://i.pravatar.cc/80?img=25", plateNo: null, status: "Pending", amount: 3500, time: "--:--", date: "2025-01-15" },
];

/** Returns badge styling for payment status */
function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "Paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
    case "Partially Paid":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
    case "Pending":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800";
    case "Over Due":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function DashboardOverview() {
  const [riderStatusFilter, setRiderStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");

  const filteredRiderActivities = recentRiderActivities.filter(
    (row) => riderStatusFilter === "all" || row.status === riderStatusFilter
  );

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* ------------------------------------------------------------------ */}
      {/* Page Header                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time platform metrics and activity for Kowa Ride superadmin.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Date Range Filter                                                  */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="mb-6 flex flex-wrap items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "custom", label: "Custom" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setDateFilter(item.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                dateFilter === item.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {dateFilter === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                <CalendarRange className="size-3.5" />
                Pick Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex items-center gap-2 p-3">
                <Input type="date" className="h-8 w-[140px] text-xs" />
                <span className="text-xs text-muted-foreground">to</span>
                <Input type="date" className="h-8 w-[140px] text-xs" />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Stats Cards — 6 cards in a responsive grid                    */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={fadeUpItem}>
              <Card
                className={cn(
                  "group cursor-pointer transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  "border-border bg-card",
                )}
              >
                <CardContent className="p-4">
                  {/* Icon + Title */}
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        kpi.iconBg,
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Value */}
                  <p className="text-xl font-bold tracking-tight text-foreground">
                    {kpi.value}
                  </p>

                  {/* Title */}
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {kpi.title}
                  </p>

                  {/* Subtitle */}
                  <p className="mt-1 text-xs text-muted-foreground/70">{kpi.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Charts Row — Revenue + Collection (2 cols desktop, 1 col mobile)  */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Revenue Chart — Area chart with emerald gradient */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Monthly Revenue Trend
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                +3.4% MoM
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Revenue in millions (₦) — Last 12 months
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    {/* Emerald gradient for the area fill */}
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    domain={[80, "auto"]}
                    tickFormatter={(val) => `₦${val}M`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  {/* Primary revenue line */}
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                  />
                  {/* Secondary (previous year) line */}
                  <Area
                    type="monotone"
                    dataKey="secondaryValue"
                    name="Prev Year"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Collection Rate Chart — Bar chart for daily rates */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Collection Rate This Week
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                Avg: 89.3%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Daily repayment collection rate (%)
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionChartData} barCategoryGap="25%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    domain={[75, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  {/* Actual collection rate bars */}
                  <Bar
                    dataKey="value"
                    name="Collection Rate"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  {/* Target rate — subtle comparison bars */}
                  <Bar
                    dataKey="secondaryValue"
                    name="Target"
                    fill="#d1fae5"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom Row — Fleet Utilization + Activity Feed (2 cols desktop)   */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Fleet Utilization Chart — Horizontal bars per manager */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Fleet Utilization by Manager
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-muted text-foreground/80"
              >
                6 managers
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Utilization rate (%) — Sorted by performance
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {utilizationChartData
                .slice()
                .sort((a, b) => b.value - a.value)
                .map((item) => (
                  <div key={item.label} className="group">
                    {/* Manager label + percentage */}
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground/80">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-bold",
                          item.value >= 90
                            ? "text-emerald-600"
                            : item.value >= 80
                              ? "text-green-600"
                              : item.value >= 70
                                ? "text-amber-600"
                                : "text-red-600",
                        )}
                      >
                        {item.value}%
                      </span>
                    </div>
                    {/* Horizontal bar */}
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.3,
                          ease: "easeOut",
                        }}
                        style={{
                          backgroundColor: getUtilizationBarColor(item.value),
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed — Timeline-style scrollable list */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Activity
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-muted text-foreground/80"
              >
                Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Latest platform events and alerts
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="space-y-1 px-4 py-4 sm:px-6">
                {mockActivityFeed.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "relative flex gap-3 rounded-lg p-3 transition-colors duration-150",
                      "hover:bg-muted/50",
                      activity.requiresAttention &&
                        "border-l-2 border-l-red-500 bg-red-50/30 dark:bg-red-950/20",
                    )}
                  >
                    {/* Colored dot indicator */}
                    <div className="mt-1.5 shrink-0">
                      <span
                        className={cn(
                          "inline-block h-2.5 w-2.5 rounded-full",
                          getActivityDotColor(activity.type),
                        )}
                      />
                    </div>

                    {/* Activity content — clamped for proper overflow alignment */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-sm font-medium text-foreground leading-snug truncate">
                          {activity.title}
                        </p>
                        {activity.requiresAttention && (
                          <Badge
                            variant="destructive"
                            className="shrink-0 text-[10px] px-1.5 py-0"
                          >
                            Action
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {activity.relativeTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Recent Rider Activities — Full-width data table                    */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="mt-6"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Rider Activities
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                Today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Latest rider payment activities and status updates
            </p>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="flex items-center justify-end gap-2 border-b border-border px-6 py-2">
              <span className="text-xs text-muted-foreground">Filter:</span>
              <Select value={riderStatusFilter} onValueChange={setRiderStatusFilter}>
                <SelectTrigger className="h-7 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Over Due">Over Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="py-3 pl-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rider</TableHead>
                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rider ID / Plate No</TableHead>
                    <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment Status</TableHead>
                    <TableHead className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                    <TableHead className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment Time</TableHead>
                    <TableHead className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</TableHead>
                    <TableHead className="py-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiderActivities.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className="group transition-colors hover:bg-muted/50 last:border-0"
                    >
                      <TableCell className="py-3 pl-6">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 shrink-0 ring-1 ring-border">
                            <AvatarImage src={row.avatarUrl} alt={row.rider} className="object-cover" />
                            <AvatarFallback className="bg-muted text-[10px] font-semibold text-foreground/70">
                              {row.rider.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground whitespace-nowrap">
                            {row.rider}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-mono font-medium text-foreground/80 whitespace-nowrap">
                            {row.riderId}
                          </p>
                          {row.plateNo && (
                            <p className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                              {row.plateNo}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "whitespace-nowrap text-[11px] font-medium px-2 py-0.5",
                            getPaymentStatusBadge(row.status),
                          )}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          ₦{row.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className={cn(
                          "text-sm tabular-nums whitespace-nowrap",
                          row.time === "--:--" ? "text-muted-foreground/70" : "text-foreground/80",
                        )}>
                          {row.time}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {row.date}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground/80"
                            >
                              Actions
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem className="gap-2 text-xs">
                              <Eye className="size-3.5 text-muted-foreground" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs">
                              <MessageSquareWarning className="size-3.5 text-amber-500" />
                              Send Warning
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-xs text-red-600 focus:text-red-600">
                              <Ban className="size-3.5 text-red-500" />
                              Suspend Rider
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRiderActivities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                        No activities match the selected filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

export default DashboardOverview;
