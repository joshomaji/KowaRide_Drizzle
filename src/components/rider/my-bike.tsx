/**
 * ============================================================================
 * KOWA RIDE - RIDER DASHBOARD
 * Rider My Bike Component
 * ============================================================================
 *
 * Detailed bike information, maintenance schedule, and ownership
 * journey page for Riders. Shows bike specs, status, GPS tracking,
 * odometer, maintenance history, ownership pathway, milestones,
 * bike value, and quick actions.
 *
 * @module components/rider/my-bike
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { motion } from "framer-motion";
import {
  Bike,
  MapPin,
  Wrench,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  ArrowUpRight,
  Gauge,
  CalendarDays,
  Flag,
  Phone,
  MessageSquare,
  ChevronRight,
  Crosshair,
  CircleDot,
  History,
  Sparkles,
  Info,
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
// MOCK DATA - Rider Bike Specific
// ============================================================================

const bikeInfo = {
  model: "Honda CG 125",
  year: 2023,
  color: "Black",
  plateNumber: "LAG-123-AB",
  vinNumber: "VIN-HON-2023-45678",
  status: "Active" as const,
  gpsStatus: "active" as const,
  odometerKm: 12450,
  registrationDate: "Jun 15, 2024",
  assignedDate: "Jun 18, 2024",
};

const maintenanceSchedule = {
  lastServiceDate: "Dec 15, 2024",
  lastServiceType: "Full Service",
  lastServiceKm: 10800,
  nextServiceDate: "Mar 15, 2025",
  nextServiceType: "Oil Change & Checkup",
  nextServiceKm: 15000,
  daysUntilNext: 17,
};

const serviceHistory = [
  { date: "Dec 15, 2024", type: "Full Service", km: 10800, notes: "Engine oil, brake pads, chain adjustment" },
  { date: "Sep 20, 2024", type: "Oil Change", km: 8200, notes: "Engine oil replaced, filter cleaned" },
  { date: "Jul 10, 2024", type: "Routine Checkup", km: 5600, notes: "General inspection, tire pressure" },
  { date: "Jun 18, 2024", type: "Handover Inspection", km: 2100, notes: "Initial condition assessment on assignment" },
];

const ownershipPathway = {
  monthsCompleted: 8,
  totalMonths: 24,
  startDate: "Jun 2024",
  expectedCompletion: "Jun 2026",
  percentage: 33,
};

const ownershipMilestones = [
  { month: 6, label: "6 months — First milestone", achieved: true, date: "Dec 2024" },
  { month: 12, label: "12 months — Halfway point", achieved: false, date: "Jun 2025" },
  { month: 18, label: "18 months — Home stretch", achieved: false, date: "Dec 2025" },
  { month: 24, label: "24 months — Full ownership!", achieved: false, date: "Jun 2026" },
];

const bikeValue = {
  currentValue: 380000,
  purchasePrice: 450000,
  equityBuilt: 840000,
  depreciationPct: 15.6,
};

/** Odometer trend data (monthly readings) */
const odometerTrend = [
  { month: "Jul", km: 2100 },
  { month: "Aug", km: 3900 },
  { month: "Sep", km: 5600 },
  { month: "Oct", km: 7200 },
  { month: "Nov", km: 9100 },
  { month: "Dec", km: 10800 },
  { month: "Jan", km: 11500 },
  { month: "Feb", km: 12450 },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function formatKm(km: number): string {
  return `${km.toLocaleString()} km`;
}

// ============================================================================
// CHART TOOLTIP
// ============================================================================

function OdometerTooltipContent({
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
          {entry.name}: {entry.value.toLocaleString()} km
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MyBike() {
  const odometerProgress = Math.min(
    100,
    Math.round((bikeInfo.odometerKm / maintenanceSchedule.nextServiceKm) * 100)
  );

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          My Bike
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your bike details, maintenance schedule, and ownership journey.
        </p>
      </div>

      {/* ── Row 1: Bike Info Card + Bike Status & GPS ── */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Bike Info Card */}
        <motion.div variants={fadeUpItem} className="lg:col-span-2">
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="p-0">
              {/* Photo placeholder */}
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                <Bike className="h-20 w-20 text-slate-400 dark:text-slate-600" />
                {/* Status badge overlay */}
                <div className="absolute top-3 right-3">
                  <Badge
                    className={cn(
                      "text-xs font-semibold border-0 shadow-sm",
                      bikeInfo.status === "Active"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    )}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {bikeInfo.status}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge
                    variant="outline"
                    className="bg-white/80 dark:bg-slate-900/80 text-foreground text-xs backdrop-blur-sm"
                  >
                    {bikeInfo.color} • {bikeInfo.year}
                  </Badge>
                </div>
              </div>

              {/* Bike details */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Bike className="h-7 w-7 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {bikeInfo.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Assigned on {bikeInfo.assignedDate}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Plate Number
                    </p>
                    <p className="text-sm font-semibold text-foreground font-mono">
                      {bikeInfo.plateNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      VIN
                    </p>
                    <p className="text-sm font-semibold text-foreground font-mono truncate">
                      {bikeInfo.vinNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Color
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {bikeInfo.color}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Year
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {bikeInfo.year}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status + GPS + Odometer */}
        <motion.div variants={fadeUpItem} className="lg:col-span-1 space-y-4">
          {/* Bike Status */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    bikeInfo.status === "Active"
                      ? "bg-emerald-100 dark:bg-emerald-950/40"
                      : "bg-amber-100 dark:bg-amber-950/40"
                  )}
                >
                  <Shield
                    className={cn(
                      "h-5 w-5",
                      bikeInfo.status === "Active"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bike Status</p>
                  <p className="text-lg font-bold text-foreground">
                    {bikeInfo.status}
                  </p>
                </div>
                <div className="ml-auto">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      bikeInfo.status === "Active"
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPS Tracking Status */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    bikeInfo.gpsStatus === "active"
                      ? "bg-sky-100 dark:bg-sky-950/40"
                      : "bg-red-100 dark:bg-red-950/40"
                  )}
                >
                  <MapPin
                    className={cn(
                      "h-5 w-5",
                      bikeInfo.gpsStatus === "active"
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    GPS Tracking
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {bikeInfo.gpsStatus === "active" ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="ml-auto">
                  {bikeInfo.gpsStatus === "active" ? (
                    <Crosshair className="h-5 w-5 text-sky-500 animate-pulse" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              {bikeInfo.gpsStatus === "active" && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Last ping: 2 min ago • Lagos Island, Lagos
                </p>
              )}
            </CardContent>
          </Card>

          {/* Odometer */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40">
                  <Gauge className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Odometer</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatKm(bikeInfo.odometerKm)}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    Next service at {formatKm(maintenanceSchedule.nextServiceKm)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {odometerProgress}%
                  </span>
                </div>
                <Progress value={odometerProgress} className="h-2" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  {formatKm(
                    maintenanceSchedule.nextServiceKm - bikeInfo.odometerKm
                  )}{" "}
                  until next service
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Row 2: Ownership Pathway Progress + Bike Value ── */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Ownership Pathway Progress */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/25 text-white border-0 hover:bg-white/30">
                {ownershipPathway.percentage}% Complete
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold">
                Ownership Pathway Progress
              </h3>
              <p className="text-sm text-emerald-100 mt-0.5">
                You are {ownershipPathway.monthsCompleted} months into the{" "}
                {ownershipPathway.totalMonths}-month bike ownership program.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-100">Progress</span>
                  <span className="font-bold">
                    {ownershipPathway.percentage}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${ownershipPathway.percentage}%`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-emerald-200">
                  <span>{ownershipPathway.startDate}</span>
                  <span>{ownershipPathway.expectedCompletion}</span>
                </div>
              </div>

              {/* Progress bar milestone markers */}
              <div className="relative mt-3">
                <div className="flex items-center justify-between">
                  {[0, 6, 12, 18, 24].map((m) => {
                    const pct = (m / 24) * 100;
                    const achieved = m <= ownershipPathway.monthsCompleted;
                    return (
                      <div
                        key={m}
                        className="flex flex-col items-center"
                        style={{ width: "20%" }}
                      >
                        {achieved ? (
                          <CheckCircle2 className="h-4 w-4 text-white mb-0.5" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-white/40 mb-0.5" />
                        )}
                        <span className="text-[9px] text-emerald-100/70">
                          {m}mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bike Value Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Bike Value &amp; Equity
              </CardTitle>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground/70">
              Current market value and your equity position
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Current Value
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {formatNaira(bikeValue.currentValue)}
                </p>
                <p className="text-[10px] text-red-500 mt-0.5 flex items-center justify-center gap-1">
                  <ArrowUpRight className="h-3 w-3 rotate-90" />
                  {bikeValue.depreciationPct}% depreciation
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Purchase Price
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {formatNaira(bikeValue.purchasePrice)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Original value
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Equity Built
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatNaira(bikeValue.equityBuilt)}
                </p>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5 flex items-center justify-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Growing steadily
                </p>
              </div>
            </div>

            <Separator />

            {/* Equity vs Value visual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Equity vs Purchase Price
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(
                    (bikeValue.equityBuilt / bikeValue.purchasePrice) * 100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  (bikeValue.equityBuilt / bikeValue.purchasePrice) * 100
                )}
                className="h-2.5"
              />
              <p className="text-[10px] text-muted-foreground">
                You&apos;ve paid {formatNaira(bikeValue.equityBuilt)} of the{" "}
                {formatNaira(bikeValue.purchasePrice)} bike value
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row 3: Ownership Milestones Timeline + Odometer Chart ── */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Ownership Milestones Timeline */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Ownership Milestones
              </CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">
              Track your journey to full bike ownership
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {ownershipMilestones.map((milestone, idx) => (
                <div key={milestone.month} className="flex gap-4">
                  {/* Timeline line + circle */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        milestone.achieved
                          ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-600"
                          : "border-muted-foreground/30 bg-muted"
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1, duration: 0.3 }}
                    >
                      {milestone.achieved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <CircleDot className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </motion.div>
                    {idx < ownershipMilestones.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 min-h-[40px]",
                          milestone.achieved
                            ? "bg-emerald-300 dark:bg-emerald-700"
                            : "bg-muted-foreground/20"
                        )}
                      />
                    )}
                  </div>
                  {/* Content */}
                  <div className={cn("pb-6", idx === ownershipMilestones.length - 1 && "pb-0")}>
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          milestone.achieved
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {milestone.label}
                      </p>
                      {milestone.achieved && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] px-1.5 py-0"
                        >
                          Achieved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {milestone.date}
                    </p>
                    {!milestone.achieved && idx === 1 && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Next milestone — 4 months away
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Odometer Trend Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Odometer Trend
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                8 months
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Monthly mileage progression
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={odometerTrend}>
                  <defs>
                    <linearGradient
                      id="odometerGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
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
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<OdometerTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="km"
                    name="Odometer"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#odometerGradient)"
                    dot={{
                      r: 4,
                      fill: "#8b5cf6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="h-3 w-3 text-violet-500" />
                <span>
                  Avg.{" "}
                  {formatKm(
                    Math.round(
                      (bikeInfo.odometerKm - 2100) / 8
                    )
                  )}
                  /month
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3 w-3 text-muted-foreground" />
                <span>Total: {formatKm(bikeInfo.odometerKm)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row 4: Maintenance Schedule + Service History ── */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Maintenance Schedule */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Maintenance Schedule
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">
              Upcoming &amp; recent maintenance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Next service - highlighted */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Next Service
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {maintenanceSchedule.nextServiceDate}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {maintenanceSchedule.nextServiceType}
              </p>
              <Separator className="my-2 bg-amber-200 dark:bg-amber-800" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {maintenanceSchedule.daysUntilNext} days away • At{" "}
                {formatKm(maintenanceSchedule.nextServiceKm)}
              </p>
            </div>

            {/* Last service */}
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Last Service
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {maintenanceSchedule.lastServiceDate}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {maintenanceSchedule.lastServiceType}
              </p>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">
                At {formatKm(maintenanceSchedule.lastServiceKm)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service History */}
        <Card className="border-border bg-card lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Service History
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {serviceHistory.length} records
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Complete maintenance log for your bike
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              <div className="divide-y divide-border">
                {serviceHistory.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 px-4 sm:px-6 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5",
                        idx === 0
                          ? "bg-emerald-100 dark:bg-emerald-950/40"
                          : "bg-slate-100 dark:bg-slate-800"
                      )}
                    >
                      <History
                        className={cn(
                          "h-4 w-4",
                          idx === 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {service.type}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatKm(service.km)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {service.date}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {service.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row 5: Quick Actions ── */}
      <motion.div
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Quick Actions
            </CardTitle>
            <p className="text-xs text-muted-foreground/70">
              Need help? Take action quickly
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 px-4 justify-start text-left hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/40 mr-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Report Issue
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Bike problem or accident
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-4 justify-start text-left hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-800 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40 mr-3">
                  <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Request Maintenance
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Schedule a service visit
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-4 justify-start text-left hover:bg-sky-50 dark:hover:bg-sky-950/20 hover:border-sky-300 dark:hover:border-sky-800 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/40 mr-3">
                  <Phone className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Call Fleet Manager
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Speak with your manager
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 px-4 justify-start text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40 mr-3">
                  <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Chat Support
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Message the support team
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
