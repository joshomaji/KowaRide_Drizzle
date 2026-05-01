/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Financial Management Page Component
 * ============================================================================
 *
 * A comprehensive financial management interface for Kowa Ride superadmins.
 * Provides real-time visibility into revenue streams, payment allocations,
 * fleet owner payouts, and the full transaction ledger.
 *
 * Features:
 * - **Financial Overview Tab**: KPI cards, allocation breakdown, payout table,
 *   and a 12-month revenue trend area chart.
 * - **Transaction Ledger Tab**: Filterable transaction table with type/status
 *   badges, amount formatting in Naira, and a detail dialog on click.
 *
 * Design:
 * - White cards on slate-50 background with emerald primary accent.
 * - Framer Motion animations for card entrance and tab transitions.
 * - Fully responsive with mobile-first approach.
 * - Comprehensive JSDoc comments throughout.
 *
 * @module components/admin/financial/financial-page
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * @license Proprietary - Kowamart and Logistics Ltd
 * ============================================================================
 */

"use client";

import { useState } from "react";
import {
  mockKPIs,
  mockAllocationBreakdown,
  mockPayouts,
  mockTransactions,
  revenueChartData,
} from "@/lib/mock-data";
import { TransactionType, TransactionStatus } from "@/types/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  Receipt,
  Filter,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Formats a numeric amount as Nigerian Naira currency string.
 * Uses compact display for amounts >= 1,000,000 and full display otherwise.
 *
 * @param amount - The numeric amount in Naira
 * @param compact - If true, uses short format (e.g., "₦145.2M"). Default: false.
 * @returns Formatted currency string (e.g., "₦4,872,500" or "₦145.2M")
 *
 * @example
 * formatNaira(4872500)        // "₦4,872,500"
 * formatNaira(145200000, true) // "₦145.2M"
 */
function formatNaira(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000_000) {
      return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `₦${(amount / 1_000).toFixed(1)}K`;
    }
  }
  return `₦${amount.toLocaleString()}`;
}

/**
 * Returns human-readable label for a TransactionType enum value.
 * Converts SNAKE_CASE to Title Case (e.g., "DAILY_PAYMENT" → "Daily Payment").
 *
 * @param type - The TransactionType enum value
 * @returns Human-readable label string
 */
function formatTransactionType(type: TransactionType): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Returns the Tailwind CSS classes for a transaction status badge.
 * Maps each TransactionStatus to a color scheme: emerald for completed,
 * amber for pending, blue for processing, red for failed, gray for reversed,
 * and orange for flagged.
 *
 * @param status - The TransactionStatus enum value
 * @returns Object with `className` for badge background/border/text styling
 */
function getStatusBadgeClasses(status: TransactionStatus): {
  className: string;
} {
  const map: Record<TransactionStatus, string> = {
    [TransactionStatus.COMPLETED]:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    [TransactionStatus.PENDING]:
      "bg-amber-50 text-amber-700 border-amber-200",
    [TransactionStatus.PROCESSING]:
      "bg-blue-50 text-blue-700 border-blue-200",
    [TransactionStatus.FAILED]: "bg-red-50 text-red-700 border-red-200",
    [TransactionStatus.REVERSED]:
      "bg-slate-100 text-slate-600 border-slate-200",
    [TransactionStatus.FLAGGED]:
      "bg-orange-50 text-orange-700 border-orange-200",
  };
  return { className: map[status] || "" };
}

/**
 * Returns distinct Tailwind CSS classes for each TransactionType badge.
 * Each transaction type has a unique color to allow quick visual scanning.
 *
 * @param type - The TransactionType enum value
 * @returns Object with `className` for badge background/border/text styling
 */
function getTypeBadgeClasses(type: TransactionType): { className: string } {
  const map: Record<TransactionType, string> = {
    [TransactionType.DAILY_PAYMENT]:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    [TransactionType.OWNER_PAYOUT]:
      "bg-teal-50 text-teal-700 border-teal-200",
    [TransactionType.MANAGER_FEE]:
      "bg-orange-50 text-orange-700 border-orange-200",
    [TransactionType.MAINTENANCE_ALLOCATION]:
      "bg-blue-50 text-blue-700 border-blue-200",
    [TransactionType.HMO_PREMIUM]:
      "bg-purple-50 text-purple-700 border-purple-200",
    [TransactionType.COMPANY_REVENUE]:
      "bg-cyan-50 text-cyan-700 border-cyan-200",
    [TransactionType.RESERVE_FUND]:
      "bg-amber-50 text-amber-700 border-amber-200",
    [TransactionType.PENALTY]: "bg-red-50 text-red-700 border-red-200",
    [TransactionType.BONUS]:
      "bg-lime-50 text-lime-700 border-lime-200",
    [TransactionType.REFUND]:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return { className: map[type] || "" };
}

/**
 * Framer Motion stagger container configuration for card entrance animations.
 * Children animate in with a 80ms delay between each item.
 */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

/**
 * Framer Motion individual item animation variant.
 * Cards slide up with opacity transition and spring physics.
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ============================================================================
// ALLOCATION BREAKDOWN CONFIGURATION
// ============================================================================

/**
 * Configuration for the daily payment allocation segments.
 * Each segment has a label, amount, color classes for the progress bar,
 * and a dot color for the legend. The total is ₦3,500.
 */
const allocationSegments = [
  {
    label: "Company Revenue",
    key: "companyRevenue" as const,
    color: "bg-emerald-500",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-700",
  },
  {
    label: "Maintenance",
    key: "maintenanceFund" as const,
    color: "bg-blue-500",
    dotColor: "bg-blue-500",
    textColor: "text-blue-700",
  },
  {
    label: "HMO",
    key: "hmoPremium" as const,
    color: "bg-purple-500",
    dotColor: "bg-purple-500",
    textColor: "text-purple-700",
  },
  {
    label: "Reserve",
    key: "reserveFund" as const,
    color: "bg-amber-500",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
  },
  {
    label: "Owner Payout",
    key: "ownerPayout" as const,
    color: "bg-teal-500",
    dotColor: "bg-teal-500",
    textColor: "text-teal-700",
  },
  {
    label: "Manager Fee",
    key: "managerFee" as const,
    color: "bg-orange-500",
    dotColor: "bg-orange-500",
    textColor: "text-orange-700",
  },
];

// ============================================================================
// KPI CARD DATA CONFIGURATION
// ============================================================================

/**
 * Configuration for the four KPI cards shown in the overview tab.
 * Each card has a title, value (from mockKPIs), icon, color scheme,
 * and optional trend indicator showing percentage change.
 */
const kpiCards = [
  {
    title: "Today's Revenue",
    getValue: () => formatNaira(mockKPIs.todayRevenue),
    icon: DollarSign,
    trend: { value: "+12.5%", positive: true },
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Monthly Revenue",
    getValue: () => formatNaira(mockKPIs.monthlyRevenue, true),
    icon: TrendingUp,
    trend: { value: "+8.3%", positive: true },
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Outstanding Payments",
    getValue: () => formatNaira(mockKPIs.totalOutstandingPayments, true),
    icon: AlertCircle,
    trend: { value: "-2.1%", positive: false },
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    isWarning: true,
  },
  {
    title: "Pending Payouts",
    getValue: () => formatNaira(mockKPIs.pendingPayouts, true),
    icon: Wallet,
    trend: null,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
];

// ============================================================================
// FINANCIAL PAGE COMPONENT
// ============================================================================

/**
 * FinancialPage - Main financial management component for the Kowa Ride
 * Superadmin Dashboard.
 *
 * Renders a two-tab interface:
 * - **Overview**: High-level financial metrics, allocation breakdown,
 *   payout summary table, and revenue trend chart.
 * - **Transactions**: Filterable transaction ledger with detailed views.
 *
 * All data is sourced from `@/lib/mock-data` for development purposes.
 * In production, these would be replaced with API calls.
 *
 * @returns The rendered Financial Management page
 */
export function FinancialPage() {
  // --- State for Transaction Ledger filters and detail dialog ---
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof mockTransactions)[0] | null
  >(null);

  /**
   * Filters the transactions array based on the current filter state.
   * Applies type, status, search query (on reference and description),
   * and date range filters.
   */
  const filteredTransactions = mockTransactions.filter((txn) => {
    if (typeFilter !== "all" && txn.type !== typeFilter) return false;
    if (statusFilter !== "all" && txn.status !== statusFilter) return false;
    if (
      searchQuery &&
      !txn.reference.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !txn.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (dateFrom && txn.createdAt < dateFrom) return false;
    if (dateTo && txn.createdAt > dateTo + "T23:59:59Z") return false;
    return true;
  });

  /**
   * Truncates a string to a maximum length and appends an ellipsis.
   * Used for description columns in tables.
   *
   * @param str - The string to truncate
   * @param maxLength - Maximum character length (default: 40)
   * @returns Truncated string with ellipsis if needed
   */
  const truncate = (str: string, maxLength = 40): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================
          Page Header
          ==================================================================== */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Financial Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor revenue, manage allocations, track payouts, and audit
          transactions across the platform.
        </p>
      </div>

      {/* ====================================================================
          Tab Navigation
          ==================================================================== */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview" className="text-xs font-medium">
            <Wallet className="mr-1.5 h-3.5 w-3.5" />
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs font-medium">
            <Receipt className="mr-1.5 h-3.5 w-3.5" />
            Transaction Ledger
          </TabsTrigger>
        </TabsList>

        {/* ==================================================================
            FINANCIAL OVERVIEW
            ================================================================== */}
        <TabsContent value="overview">
        <div className="space-y-6">
          {/* ---------------------------------------------------------------
              KPI Cards Row
              ---------------------------------------------------------------
              Four key performance indicator cards displaying today's revenue,
              monthly revenue, outstanding payments (warning), and pending
              payouts. Each card has an icon, value, and trend indicator.
          */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <motion.div key={kpi.title} variants={fadeInUp}>
                  <Card
                    className={cn(
                      "relative overflow-hidden transition-shadow hover:shadow-md",
                      kpi.isWarning && "border-amber-200 bg-amber-50/30"
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-500">
                            {kpi.title}
                          </p>
                          <p
                            className={cn(
                              "text-2xl font-bold tracking-tight",
                              kpi.isWarning ? "text-amber-700" : "text-slate-900"
                            )}
                          >
                            {kpi.getValue()}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            kpi.iconBg
                          )}
                        >
                          <Icon className={cn("h-5 w-5", kpi.iconColor)} />
                        </div>
                      </div>
                      {/* Trend Indicator */}
                      {kpi.trend && (
                        <div className="mt-3 flex items-center gap-1 text-xs">
                          {kpi.trend.positive ? (
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span
                            className={cn(
                              "font-medium",
                              kpi.trend.positive
                                ? "text-emerald-600"
                                : "text-red-500"
                            )}
                          >
                            {kpi.trend.value}
                          </span>
                          <span className="text-slate-400">vs last period</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ---------------------------------------------------------------
              Allocation Breakdown & Revenue Chart Row
              ---------------------------------------------------------------
              Two-column layout: left shows the daily payment allocation
              breakdown with stacked bar and legend; right shows the
              12-month revenue trend area chart.
          */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Allocation Breakdown Card (3/5 width) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 24 }}
              className="lg:col-span-3"
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Daily Payment Allocation
                      </CardTitle>
                      <CardDescription className="text-xs">
                        How each ₦
                        {mockAllocationBreakdown.totalDailyPayment.toLocaleString()}{" "}
                        daily payment is distributed
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50"
                    >
                      ₦{mockAllocationBreakdown.totalDailyPayment.toLocaleString()}/day
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Stacked Horizontal Bar */}
                  <div className="flex h-8 w-full overflow-hidden rounded-lg">
                    {allocationSegments.map((segment) => {
                      const amount =
                        mockAllocationBreakdown[segment.key];
                      const percentage = Math.round(
                        (amount /
                          mockAllocationBreakdown.totalDailyPayment) *
                          100
                      );
                      return (
                        <motion.div
                          key={segment.key}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: "easeOut",
                          }}
                          className={cn(
                            "relative flex items-center justify-center h-full first:rounded-l-lg last:rounded-r-lg",
                            segment.color
                          )}
                          title={`${segment.label}: ₦${amount.toLocaleString()} (${percentage}%)`}
                        >
                          {/* Show percentage label inside bar if segment is wide enough */}
                          {percentage >= 10 && (
                            <span className="text-[10px] font-bold text-white drop-shadow-sm">
                              {percentage}%
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Individual Progress Bars with Labels */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {allocationSegments.map((segment) => {
                      const amount =
                        mockAllocationBreakdown[segment.key];
                      const percentage = Math.round(
                        (amount /
                          mockAllocationBreakdown.totalDailyPayment) *
                          100
                      );
                      return (
                        <div key={segment.key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  segment.dotColor
                                )}
                              />
                              <span className="font-medium text-slate-600">
                                {segment.label}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-800">
                              ₦{amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className={cn("h-1.5", segment.color)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue Trend Chart (2/5 width) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 24 }}
              className="lg:col-span-2"
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Revenue Trend
                  </CardTitle>
                  <CardDescription className="text-xs">
                    12-month revenue in millions (₦M)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueChartData}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="revenueGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => `₦${v}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                            fontSize: "12px",
                          }}
                          formatter={(value: number) => [
                            `₦${value}M`,
                            "Revenue",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#revenueGradient)"
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill: "#10b981",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ---------------------------------------------------------------
              Payout Summary Table
              ---------------------------------------------------------------
              Displays weekly payout summaries for fleet owners with status
              badges, active days, period ranges, and export action buttons.
          */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 24 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Payout Summary
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Weekly fleet owner payout status and details
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Owner Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-center">
                          Active Days
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Period
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayouts.map((payout) => {
                        const statusClasses = getStatusBadgeClasses(payout.status);
                        return (
                          <TableRow
                            key={payout.id}
                            className="group transition-colors"
                          >
                            <TableCell className="text-sm font-medium text-slate-800">
                              {payout.ownerName}
                            </TableCell>
                            <TableCell className="text-sm font-semibold text-slate-900 text-right">
                              {formatNaira(payout.amount)}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 text-center">
                              {payout.activeDays} days
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              <span>
                                {format(new Date(payout.periodStart), "MMM d")}
                              </span>
                              <span className="mx-1 text-slate-300">-</span>
                              <span>
                                {format(new Date(payout.periodEnd), "MMM d, yyyy")}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[11px] font-medium",
                                  statusClasses.className
                                )}
                              >
                                {payout.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-slate-500 hover:text-emerald-600"
                              >
                                <Download className="mr-1 h-3 w-3" />
                                Export
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        </TabsContent>

        {/* ====================================================================
            TRANSACTION LEDGER
            ==================================================================== */}
        <TabsContent value="ledger">
          <div className="space-y-6">
            {/* ---------------------------------------------------------------
                Transaction Filter Card
                ---------------------------------------------------------------
                Filter controls for the transaction ledger: search, type filter,
                status filter, and date range inputs.
            */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Filters
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {filteredTransactions.length} of{" "}
                      {mockTransactions.length} transactions
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search reference or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8 text-sm"
                      />
                    </div>

                    {/* Type Filter Dropdown */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.values(TransactionType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {formatTransactionType(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Status Filter Dropdown */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(TransactionStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Date From */}
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="From"
                      className="h-9 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          {/* ---------------------------------------------------------------
              Transaction Table
              ---------------------------------------------------------------
              Full transaction ledger with reference, type badge, amount,
              truncated description, status badge, date, and view action.
          */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Reference
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">
                          Type
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 hidden md:table-cell">
                          Description
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 hidden sm:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-32 text-center text-sm text-slate-400"
                          >
                            No transactions match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((txn) => {
                          const statusClasses = getStatusBadgeClasses(txn.status);
                          const typeClasses = getTypeBadgeClasses(txn.type);
                          return (
                            <TableRow
                              key={txn.id}
                              className="cursor-pointer transition-colors hover:bg-slate-50"
                              onClick={() => setSelectedTransaction(txn)}
                            >
                              {/* Reference */}
                              <TableCell className="text-xs font-mono font-medium text-slate-700">
                                {txn.reference}
                              </TableCell>

                              {/* Type Badge */}
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] font-medium",
                                    typeClasses.className
                                  )}
                                >
                                  {formatTransactionType(txn.type)}
                                </Badge>
                              </TableCell>

                              {/* Amount */}
                              <TableCell className="text-sm font-semibold text-slate-900 text-right">
                                {formatNaira(txn.amount)}
                              </TableCell>

                              {/* Description (truncated, hidden on mobile) */}
                              <TableCell
                                className="text-xs text-slate-500 hidden md:table-cell"
                                title={txn.description}
                              >
                                {truncate(txn.description, 45)}
                              </TableCell>

                              {/* Status Badge */}
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] font-medium",
                                    statusClasses.className
                                  )}
                                >
                                  {txn.status}
                                </Badge>
                              </TableCell>

                              {/* Date (hidden on small screens) */}
                              <TableCell className="text-xs text-slate-500 hidden sm:table-cell">
                                {format(
                                  new Date(txn.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>

                              {/* View Action */}
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-slate-500 hover:text-emerald-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTransaction(txn);
                                  }}
                                >
                                  View
                                  <ArrowUpRight className="ml-1 h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ====================================================================
          Transaction Detail Dialog
          ====================================================================
          Modal dialog showing full transaction details when a transaction
          row is clicked. Includes metadata, timestamps, and involved parties.
      */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                    <Receipt className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      Transaction Details
                    </p>
                    <p className="text-xs font-mono text-slate-500">
                      {selectedTransaction.reference}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {/* Amount Display */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatNaira(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium",
                        getTypeBadgeClasses(selectedTransaction.type).className
                      )}
                    >
                      {formatTransactionType(selectedTransaction.type)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-medium",
                        getStatusBadgeClasses(selectedTransaction.status)
                          .className
                      )}
                    >
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>

                {/* Detail Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Description
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedTransaction.description}
                    </p>
                  </div>

                  {/* Initiated By */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Initiated By
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedTransaction.initiatedBy}
                    </p>
                  </div>

                  {/* Received By */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Received By
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedTransaction.receivedBy}
                    </p>
                  </div>

                  {/* Created At */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Created At
                    </p>
                    <p className="text-sm text-slate-700">
                      {format(
                        new Date(selectedTransaction.createdAt),
                        "MMM d, yyyy 'at' HH:mm"
                      )}
                    </p>
                  </div>

                  {/* Completed At */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Completed At
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedTransaction.completedAt
                        ? format(
                            new Date(selectedTransaction.completedAt),
                            "MMM d, yyyy 'at' HH:mm"
                          )
                        : "Pending"}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                {Object.keys(selectedTransaction.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Metadata
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(selectedTransaction.metadata).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                            >
                              <span className="text-xs text-slate-500">
                                {key}
                              </span>
                              <span className="text-xs font-medium text-slate-700 font-mono">
                                {String(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransaction(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
