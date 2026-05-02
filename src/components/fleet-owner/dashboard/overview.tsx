/**
 * ============================================================================
 * KOWA RIDE - FLEET OWNER DASHBOARD
 * Fleet Owner Overview Component
 * ============================================================================
 *
 * Dashboard overview tailored for Fleet Owners. Shows metrics relevant
 * to their investment scope: fleet ROI, bike utilization, payouts,
 * and earnings tracking.
 *
 * @module components/fleet-owner/dashboard/overview
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Bike,
  TrendingUp,
  Wallet,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Banknote,
  Clock,
  CheckCircle2,
  CircleDollarSign,
  BarChart3,
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
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const fadeInChart = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ============================================================================
// HELPER
// ============================================================================

function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

// ============================================================================
// MOCK DATA - Fleet Owner specific
// ============================================================================

const foKPIs = [
  {
    title: "Total Bikes",
    icon: Bike,
    value: "24",
    subtitle: "8 active, 4 in maintenance",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    title: "Monthly ROI",
    icon: TrendingUp,
    value: "12.4%",
    subtitle: "+2.1% vs last month",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    trend: "up",
  },
  {
    title: "Total Earnings",
    icon: Banknote,
    value: "₦4.87M",
    subtitle: "Lifetime platform earnings",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    title: "Pending Payout",
    icon: Wallet,
    value: "₦342K",
    subtitle: "Next payout: Friday",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    title: "Active Bikes",
    icon: Crown,
    value: "18",
    subtitle: "75% utilization rate",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    title: "Fleet Value",
    icon: BarChart3,
    value: "₦18.2M",
    subtitle: "Current market value",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
  },
];

const earningsHistory = [
  { month: "Jul", earnings: 320, payouts: 280 },
  { month: "Aug", earnings: 385, payouts: 340 },
  { month: "Sep", earnings: 410, payouts: 365 },
  { month: "Oct", earnings: 445, payouts: 400 },
  { month: "Nov", earnings: 470, payouts: 420 },
  { month: "Dec", earnings: 520, payouts: 465 },
  { month: "Jan", earnings: 487, payouts: 440 },
];

const recentPayouts = [
  { id: "PO-001", amount: "₦142,500", period: "Jan 1-15", status: "Completed", date: "Jan 16, 2025", bank: "GTBank ****4521" },
  { id: "PO-002", amount: "₦138,200", period: "Dec 16-31", status: "Completed", date: "Jan 1, 2025", bank: "GTBank ****4521" },
  { id: "PO-003", amount: "₦155,800", period: "Dec 1-15", status: "Completed", date: "Dec 16, 2024", bank: "GTBank ****4521" },
  { id: "PO-004", amount: "₦148,300", period: "Nov 16-30", status: "Completed", date: "Dec 1, 2024", bank: "GTBank ****4521" },
  { id: "PO-005", amount: "₦342,000", period: "Jan 16-31", status: "Pending", date: "Feb 1, 2025", bank: "GTBank ****4521" },
];

const bikePortfolio = [
  { id: "KR-BIKE-001", model: "Honda CG 125", plateNo: "LAG-123-AB", status: "Active", rider: "Chukwuemeka O.", revenue: "₦3,500/day" },
  { id: "KR-BIKE-002", model: "Bajaj Boxer 150", plateNo: "LAG-456-CD", status: "Active", rider: "Aishat A.", revenue: "₦3,500/day" },
  { id: "KR-BIKE-003", model: "Honda CG 125", plateNo: "ABJ-789-EF", status: "Maintenance", rider: "Unassigned", revenue: "—" },
  { id: "KR-BIKE-004", model: "TVS HLX 125", plateNo: "LAG-345-IJ", status: "Active", rider: "Blessing O.", revenue: "₦3,500/day" },
  { id: "KR-BIKE-005", model: "Bajaj Boxer 150", plateNo: "IBD-012-GH", status: "Active", rider: "Abdulahi G.", revenue: "₦3,000/day" },
];

// ============================================================================
// CHART TOOLTIP
// ============================================================================

function EarningsTooltipContent({
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
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: ₦{entry.value}K
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FleetOwnerOverview() {
  const { data: session } = useSession();
  const firstName = session?.user?.firstName || "Fleet Owner";

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fleet Owner Dashboard — Track your fleet performance, ROI, and payouts.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {foKPIs.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={fadeUpItem}>
              <Card className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-border bg-card">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", kpi.iconBg)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    {kpi.trend && (
                      <span className={cn(
                        "flex items-center text-[10px] font-bold",
                        kpi.trend === "up" ? "text-emerald-600" : "text-red-600"
                      )}>
                        {kpi.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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

      {/* Earnings Chart */}
      <motion.div
        className="mb-8"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Earnings & Payouts Trend</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                Last 7 months
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Monthly earnings and payout amounts (₦K)</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsHistory}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="payoutsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `₦${val}K`} />
                  <Tooltip content={<EarningsTooltipContent />} />
                  <Area type="monotone" dataKey="earnings" name="Earnings" stroke="#10b981" strokeWidth={2} fill="url(#earningsGradient)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="payouts" name="Payouts" stroke="#f59e0b" strokeWidth={2} fill="url(#payoutsGradient)" dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row: Recent Payouts + Bike Portfolio */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Recent Payouts */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Recent Payouts</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">Payment history to your bank account</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="divide-y divide-border">
                {recentPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      payout.status === "Completed"
                        ? "bg-emerald-100 dark:bg-emerald-950/40"
                        : "bg-amber-100 dark:bg-amber-950/40"
                    )}>
                      {payout.status === "Completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{payout.period}</p>
                        <span className="text-sm font-semibold text-foreground">{payout.amount}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground">{payout.bank}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            payout.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          )}
                        >
                          {payout.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Bike Portfolio */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">My Bike Portfolio</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                24 total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Current fleet status and assignments</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="divide-y divide-border">
                {bikePortfolio.map((bike) => (
                  <div key={bike.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Bike className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{bike.model}</p>
                        <span className="text-xs font-semibold text-foreground">{bike.revenue}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground">{bike.plateNo} • {bike.rider}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            bike.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          )}
                        >
                          {bike.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
