/**
 * ============================================================================
 * KOWA RIDE - FLEET MANAGER DASHBOARD
 * Financial Overview Page Component
 * ============================================================================
 *
 * Fleet Manager's collection-focused financial overview. Shows daily collection
 * performance, allocation breakdown, top paying riders, and overdue follow-up.
 *
 * @module components/fleet-manager/financial-overview
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Percent,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PhoneCall,
  MessageSquare,
  Flame,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  mockRiders,
  mockAllocationBreakdown,
  mockBikes,
} from "@/lib/mock-data";
import { RiderStatus } from "@/types/admin";

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as const;

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

const fadeInChart = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

// ============================================================================
// MOCK DATA - FM-specific collection data
// ============================================================================

const dailyCollectionData = [
  { label: "Mon", collected: 87500, expected: 105000 },
  { label: "Tue", collected: 94500, expected: 105000 },
  { label: "Wed", collected: 91000, expected: 105000 },
  { label: "Thu", collected: 98000, expected: 105000 },
  { label: "Fri", collected: 102000, expected: 105000 },
  { label: "Sat", collected: 84000, expected: 94500 },
  { label: "Sun", collected: 73500, expected: 84000 },
];

const allocationData = [
  { name: "Company Revenue", value: mockAllocationBreakdown.companyRevenue, color: "#10b981" },
  { name: "Maintenance Fund", value: mockAllocationBreakdown.maintenanceFund, color: "#f59e0b" },
  { name: "HMO Premium", value: mockAllocationBreakdown.hmoPremium, color: "#8b5cf6" },
  { name: "Reserve Fund", value: mockAllocationBreakdown.reserveFund, color: "#06b6d4" },
  { name: "Owner Payout", value: mockAllocationBreakdown.ownerPayout, color: "#3b82f6" },
  { name: "Manager Fee", value: mockAllocationBreakdown.managerFee, color: "#ec4899" },
];

// ============================================================================
// CHART TOOLTIP
// ============================================================================

function CollectionTooltipContent({
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
          {entry.name}: {formatNaira(entry.value)}
        </p>
      ))}
    </div>
  );
}

function AllocationTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-foreground">
        <span
          className="mr-1.5 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: entry.payload.fill }}
        />
        {entry.name}: {formatNaira(entry.value)}
      </p>
      <p className="text-xs text-muted-foreground">
        {((entry.value / mockAllocationBreakdown.totalDailyPayment) * 100).toFixed(1)}% of daily payment
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FMFinancialOverview() {
  const FM_ID = "fm-001";

  // Filter riders for this FM
  const fmRiders = useMemo(() => {
    return mockRiders.filter((r) => r.fleetManagerId === FM_ID);
  }, []);

  // Compute financial stats
  const financialStats = useMemo(() => {
    const todayCollection = fmRiders
      .filter((r) => r.unpaidDays === 0 && r.status === RiderStatus.ACTIVE)
      .reduce((sum, r) => sum + r.dailyPaymentAmount, 0);

    const totalExpectedDaily = fmRiders
      .filter((r) => r.status === RiderStatus.ACTIVE)
      .reduce((sum, r) => sum + r.dailyPaymentAmount, 0);

    const weeklyAvg = dailyCollectionData.reduce((sum, d) => sum + d.collected, 0) / 7;
    const collectionRate = totalExpectedDaily > 0 ? (todayCollection / totalExpectedDaily) * 100 : 0;
    const outstanding = fmRiders
      .filter((r) => r.unpaidDays > 0)
      .reduce((sum, r) => sum + r.unpaidDays * r.dailyPaymentAmount, 0);

    return { todayCollection, totalExpectedDaily, weeklyAvg, collectionRate, outstanding };
  }, [fmRiders]);

  // Top paying riders (sorted by repayment rate)
  const topPayingRiders = useMemo(() => {
    return [...fmRiders]
      .filter((r) => r.status === RiderStatus.ACTIVE)
      .sort((a, b) => b.repaymentRate - a.repaymentRate);
  }, [fmRiders]);

  // Overdue riders needing follow-up
  const overdueRiders = useMemo(() => {
    return fmRiders
      .filter((r) => r.unpaidDays > 0)
      .sort((a, b) => b.unpaidDays - a.unpaidDays);
  }, [fmRiders]);

  const kpiCards = [
    {
      title: "Today's Collection",
      value: formatNairaCompact(financialStats.todayCollection),
      subtitle: `of ${formatNairaCompact(financialStats.totalExpectedDaily)} expected`,
      icon: Wallet,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      trend: { value: "+4.2%", positive: true },
    },
    {
      title: "Weekly Average",
      value: formatNairaCompact(financialStats.weeklyAvg),
      subtitle: "Daily collection average",
      icon: TrendingUp,
      iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
      trend: { value: "+2.1%", positive: true },
    },
    {
      title: "Collection Rate",
      value: `${financialStats.collectionRate.toFixed(1)}%`,
      subtitle: "Active riders paid today",
      icon: Percent,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      trend: { value: "-1.3%", positive: false },
    },
    {
      title: "Outstanding Amount",
      value: formatNairaCompact(financialStats.outstanding),
      subtitle: `${overdueRiders.length} rider${overdueRiders.length !== 1 ? "s" : ""} overdue`,
      icon: AlertCircle,
      iconBg: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
      trend: null,
    },
  ];

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Financial Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track daily collections, payment allocations, and rider payment performance.
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {kpiCards.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={fadeUpItem}>
              <Card className="border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", kpi.iconBg)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    {kpi.trend && (
                      <span className={cn(
                        "flex items-center gap-0.5 text-[10px] font-semibold",
                        kpi.trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {kpi.trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {kpi.trend.value}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold tracking-tight text-foreground">{kpi.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{kpi.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div
        className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Daily Collection Bar Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Daily Collection (Last 7 Days)
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                Avg: {formatNairaCompact(financialStats.weeklyAvg)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Collected vs expected daily amount</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCollectionData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(val) => formatNairaCompact(val)}
                  />
                  <Tooltip content={<CollectionTooltipContent />} />
                  <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expected" name="Expected" fill="#d1fae5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Breakdown Pie Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Payment Allocation Breakdown
              </CardTitle>
              <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
                Per ₦{mockAllocationBreakdown.totalDailyPayment.toLocaleString()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">How daily payments are split across stakeholders</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<AllocationTooltipContent />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-[10px] text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row: Top Paying Riders + Overdue Riders */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Top Paying Riders */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Top Paying Riders</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                Best performers
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Ranked by repayment rate and payment streak</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="divide-y divide-border">
                {topPayingRiders.map((rider, idx) => (
                  <div key={rider.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    {/* Rank */}
                    <div className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      idx === 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : idx === 1
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300"
                          : idx === 2
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                    )}>
                      {idx + 1}
                    </div>
                    <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                      <AvatarImage src={rider.avatarUrl} alt={`${rider.firstName} ${rider.lastName}`} />
                      <AvatarFallback className="bg-muted text-[10px] font-semibold">
                        {rider.firstName[0]}{rider.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{rider.firstName} {rider.lastName}</p>
                        <span className="text-xs font-semibold text-foreground">{formatNaira(rider.dailyPaymentAmount)}/day</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className={cn(
                          "text-[10px] font-medium",
                          rider.repaymentRate >= 90 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                          {rider.repaymentRate}% rate
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                          <Flame className="h-3 w-3" />
                          {rider.paymentStreak}d streak
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Overdue Riders Needing Follow-up */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Overdue — Needs Follow-up</CardTitle>
              <Badge variant="destructive" className="text-[10px]">
                {overdueRiders.length} overdue
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Riders with unpaid days requiring action</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              {overdueRiders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">All riders are up to date!</p>
                  <p className="text-xs mt-1">No overdue payments right now</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {overdueRiders.map((rider) => (
                    <div
                      key={rider.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                        rider.unpaidDays >= 3 && "border-l-2 border-l-red-500 bg-red-50/20 dark:bg-red-950/10"
                      )}
                    >
                      <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                        <AvatarImage src={rider.avatarUrl} alt={`${rider.firstName} ${rider.lastName}`} />
                        <AvatarFallback className="bg-muted text-[10px] font-semibold">
                          {rider.firstName[0]}{rider.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">{rider.firstName} {rider.lastName}</p>
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">
                            {rider.unpaidDays} day{rider.unpaidDays > 1 ? "s" : ""} overdue
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            Owed: {formatNaira(rider.unpaidDays * rider.dailyPaymentAmount)}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              rider.unpaidDays >= 3
                                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            )}
                          >
                            {rider.unpaidDays >= 3 ? "Urgent" : "Follow up"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" title="Call Rider">
                          <PhoneCall className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-sky-600 hover:text-sky-700" title="Send Warning SMS">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
