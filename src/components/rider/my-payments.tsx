/**
 * ============================================================================
 * KOWA RIDE - RIDER DASHBOARD
 * Rider My Payments Component
 * ============================================================================
 *
 * Detailed payment history and status page for Riders. Shows today's
 * payment status, payment streak, monthly progress, calendar view,
 * transaction history, account balance, payment method info, and
 * ownership progress.
 *
 * @module components/rider/my-payments
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  Flame,
  Wallet,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ArrowUpRight,
  Clock,
  Banknote,
  Building2,
  Award,
  TrendingUp,
  CircleDot,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
// MOCK DATA - Rider Payment Specific
// ============================================================================

const todayPayment = {
  status: "Paid" as const,
  amount: 3500,
  dueDate: "Feb 26, 2025",
  paidAt: "07:45 AM",
  method: "Transfer",
};

const paymentStreak = {
  current: 14,
  best: 32,
  label: "Consecutive on-time payments",
};

const monthlyProgress = {
  paidSoFar: 73500,
  totalDue: 84000,
  daysPaid: 21,
  totalDays: 24,
  month: "February 2025",
};

/** Calendar data for the current month */
const paymentCalendar = (() => {
  const days: {
    day: number;
    status: "paid" | "missed" | "rest" | "future";
    amount: number;
  }[] = [];
  for (let i = 1; i <= 28; i++) {
    if (i <= 14) {
      days.push({ day: i, status: "paid", amount: 3500 });
    } else if (i === 15) {
      days.push({ day: i, status: "missed", amount: 0 });
    } else if (i <= 21) {
      days.push({ day: i, status: "paid", amount: 3500 });
    } else if (i === 22) {
      days.push({ day: i, status: "rest", amount: 0 });
    } else if (i === 23) {
      days.push({ day: i, status: "rest", amount: 0 });
    } else {
      days.push({ day: i, status: "future", amount: 0 });
    }
  }
  return days;
})();

const paymentHistory = [
  { date: "Feb 26, 2025", amount: "₦3,500", method: "Transfer", time: "07:45 AM", status: "Paid" },
  { date: "Feb 25, 2025", amount: "₦3,500", method: "Transfer", time: "08:15 AM", status: "Paid" },
  { date: "Feb 24, 2025", amount: "₦3,500", method: "Transfer", time: "07:30 AM", status: "Paid" },
  { date: "Feb 23, 2025", amount: "₦3,500", method: "Cash", time: "09:10 AM", status: "Paid" },
  { date: "Feb 22, 2025", amount: "₦3,500", method: "Transfer", time: "08:00 AM", status: "Paid" },
  { date: "Feb 21, 2025", amount: "₦3,500", method: "Transfer", time: "07:55 AM", status: "Paid" },
  { date: "Feb 20, 2025", amount: "₦3,500", method: "Transfer", time: "08:20 AM", status: "Paid" },
  { date: "Feb 19, 2025", amount: "₦3,500", method: "Cash", time: "10:30 AM", status: "Paid" },
  { date: "Feb 18, 2025", amount: "₦3,500", method: "Transfer", time: "07:40 AM", status: "Paid" },
  { date: "Feb 17, 2025", amount: "₦3,500", method: "Transfer", time: "08:05 AM", status: "Paid" },
  { date: "Feb 16, 2025", amount: "₦3,500", method: "Transfer", time: "07:50 AM", status: "Paid" },
  { date: "Feb 15, 2025", amount: "—", method: "—", time: "—", status: "Missed" },
  { date: "Feb 14, 2025", amount: "₦3,500", method: "Transfer", time: "08:30 AM", status: "Paid" },
  { date: "Feb 13, 2025", amount: "₦3,500", method: "Cash", time: "09:00 AM", status: "Paid" },
  { date: "Feb 12, 2025", amount: "₦3,500", method: "Transfer", time: "07:25 AM", status: "Paid" },
];

const accountBalance = {
  balance: 5200,
  label: "Credit from overpayments",
  lastCredit: "₦500 on Feb 20",
};

const paymentMethodInfo = {
  bankName: "Kowa Microfinance Bank",
  accountNumber: "0123456789",
  accountName: "KowaRide Fleet Services Ltd",
  quickCode: "*737*50*0123456789#",
};

const ownershipProgress = {
  monthsCompleted: 8,
  totalMonths: 24,
  purchasePrice: 450000,
  paidSoFar: 840000,
  percentage: 33,
};

/** Weekly payment chart data */
const weeklyChartData = [
  { day: "Mon", amount: 3500 },
  { day: "Tue", amount: 3500 },
  { day: "Wed", amount: 3500 },
  { day: "Thu", amount: 3500 },
  { day: "Fri", amount: 3500 },
  { day: "Sat", amount: 0 },
  { day: "Sun", amount: 0 },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

// ============================================================================
// CHART TOOLTIP
// ============================================================================

function PaymentBarTooltipContent({
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MyPayments() {
  const monthlyPct = Math.round(
    (monthlyProgress.paidSoFar / monthlyProgress.totalDue) * 100
  );

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          My Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your daily payments, streaks, and ownership progress.
        </p>
      </div>

      {/* ── Row 1: Today's Payment Banner + Streak + Balance ── */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Today's Payment Status Banner */}
        <motion.div variants={fadeUpItem} className="lg:col-span-1">
          <Card
            className={cn(
              "border-0 shadow-sm overflow-hidden h-full",
              todayPayment.status === "Paid"
                ? "bg-gradient-to-br from-emerald-600 to-emerald-500 text-white"
                : "bg-gradient-to-br from-red-600 to-red-500 text-white"
            )}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  {todayPayment.status === "Paid" ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <Badge
                  className={cn(
                    "text-xs font-semibold border-0",
                    todayPayment.status === "Paid"
                      ? "bg-white/25 text-white hover:bg-white/30"
                      : "bg-white/25 text-white hover:bg-white/30"
                  )}
                >
                  {todayPayment.status === "Paid" ? "✓ Paid" : "✗ Unpaid"}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-white/80">
                  Today&apos;s Payment
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {formatNaira(todayPayment.amount)}
                </p>
                <div className="mt-3 space-y-1 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Due: {todayPayment.dueDate}</span>
                  </div>
                  {todayPayment.status === "Paid" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Paid at {todayPayment.paidAt} via {todayPayment.method}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Streak Card */}
        <motion.div variants={fadeUpItem} className="lg:col-span-1">
          <Card className="border-border bg-card h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40">
                  <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                >
                  🔥 On fire!
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Streak
                </p>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-1">
                  {paymentStreak.current} days
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {paymentStreak.label}
                </p>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Personal best
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {paymentStreak.best} days
                  </span>
                </div>
                {/* Streak visual dots */}
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-orange-500"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                    />
                  ))}
                  <span className="ml-2 text-xs font-medium text-orange-600 dark:text-orange-400">
                    {paymentStreak.current}🔥
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Balance Card */}
        <motion.div variants={fadeUpItem} className="lg:col-span-1">
          <Card className="border-border bg-card h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950/40">
                  <Wallet className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400"
                >
                  Credit
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Account Balance
                </p>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-1">
                  {formatNaira(accountBalance.balance)}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {accountBalance.label}
                </p>
                <Separator className="my-3" />
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    Last credit: {accountBalance.lastCredit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Row 2: Monthly Progress + Ownership Progress ── */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Monthly Payment Progress */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Monthly Progress
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {monthlyProgress.month}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              How much you&apos;ve paid vs. total due this month
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-foreground">
                {formatNaira(monthlyProgress.paidSoFar)}
              </p>
              <p className="mb-1 text-sm text-muted-foreground">
                / {formatNaira(monthlyProgress.totalDue)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {monthlyProgress.daysPaid} of {monthlyProgress.totalDays} days
                  paid
                </span>
                <span className="font-semibold text-foreground">
                  {monthlyPct}%
                </span>
              </div>
              <Progress value={monthlyPct} className="h-3" />
            </div>
            <Separator />
            {/* Weekly chart */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">
                This week&apos;s payments
              </p>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(val) => `₦${val / 1000}k`}
                    />
                    <Tooltip content={<PaymentBarTooltipContent />} />
                    <Bar dataKey="amount" name="Payment" radius={[4, 4, 0, 0]}>
                      {weeklyChartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            entry.amount > 0 ? "#10b981" : "#e2e8f0"
                          }
                          className="dark:fill-[#334155]"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ownership Progress */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-700 to-purple-600 text-white overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/25 text-white border-0 hover:bg-white/30">
                Ownership
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-purple-200">
                Ownership Pathway
              </p>
              <p className="text-3xl font-bold tracking-tight mt-1">
                {ownershipProgress.monthsCompleted}/{ownershipProgress.totalMonths}{" "}
                months
              </p>
              <p className="text-xs text-purple-200/80 mt-1">
                {ownershipProgress.percentage}% towards full bike ownership
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-200">Progress</span>
                <span className="font-bold">{ownershipProgress.percentage}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${ownershipProgress.percentage}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <Separator className="bg-white/20" />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-purple-200/70">
                    Purchase Price
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {formatNaira(ownershipProgress.purchasePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-purple-200/70">
                    Paid So Far
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {formatNaira(ownershipProgress.paidSoFar)}
                  </p>
                </div>
              </div>
            </div>
            {/* Milestones */}
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              {[
                { month: 6, achieved: true },
                { month: 12, achieved: false },
                { month: 18, achieved: false },
                { month: 24, achieved: false },
              ].map((ms) => (
                <div key={ms.month} className="flex items-center gap-1.5">
                  {ms.achieved ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white/40" />
                  )}
                  <span
                    className={cn(
                      "text-[10px]",
                      ms.achieved
                        ? "text-white font-medium"
                        : "text-purple-200/70"
                    )}
                  >
                    {ms.month}mo
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row 3: Payment Calendar ── */}
      <motion.div
        className="mb-6"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Payment Calendar
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">
              Daily payment status for {monthlyProgress.month}
            </p>
          </CardHeader>
          <CardContent>
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid — starts on Saturday (Feb 1, 2025 = Saturday) */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Leading empty cells for Sat+Sun before Feb 1 */}
              <div />
              <div />
              {/* Padding for Mon-Fri before the 1st */}
              <div />
              <div />
              <div />
              <div />
              <div />
              {/* Actual days */}
              {paymentCalendar.map((day) => (
                <motion.div
                  key={day.day}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg p-1.5 sm:p-2 aspect-square transition-colors",
                    day.status === "paid" &&
                      "bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800",
                    day.status === "missed" &&
                      "bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800",
                    day.status === "rest" &&
                      "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
                    day.status === "future" &&
                      "bg-muted/50 border border-dashed border-muted-foreground/20"
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: day.day * 0.02, duration: 0.2 }}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      day.status === "paid" &&
                        "text-emerald-700 dark:text-emerald-400",
                      day.status === "missed" &&
                        "text-red-700 dark:text-red-400",
                      day.status === "rest" &&
                        "text-slate-500 dark:text-slate-400",
                      day.status === "future" && "text-muted-foreground/50"
                    )}
                  >
                    {day.day}
                  </span>
                  {day.status === "paid" && (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  )}
                  {day.status === "missed" && (
                    <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                </motion.div>
              ))}
            </div>
            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
                <span className="text-[10px] text-muted-foreground">Paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-red-200 dark:bg-red-900" />
                <span className="text-[10px] text-muted-foreground">
                  Missed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
                <span className="text-[10px] text-muted-foreground">
                  Rest day
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm border border-dashed border-muted-foreground/30" />
                <span className="text-[10px] text-muted-foreground">
                  Upcoming
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Row 4: Payment History Table + Payment Method Info ── */}
      <motion.div
        className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Payment History Table */}
        <Card className="border-border bg-card lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Payment History
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {paymentHistory.length} records
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">
              Your recent payment transactions
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-5 gap-2 px-4 sm:px-6 py-2 bg-muted/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Date</span>
              <span>Amount</span>
              <span>Method</span>
              <span>Time</span>
              <span>Status</span>
            </div>
            <ScrollArea className="max-h-96">
              <div className="divide-y divide-border">
                {paymentHistory.map((payment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-muted/50 transition-colors"
                  >
                    {/* Mobile layout */}
                    <div className="flex sm:hidden flex-1 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                        {payment.status === "Paid" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            {payment.date}
                          </p>
                          <span className="text-sm font-semibold text-foreground">
                            {payment.amount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {payment.method} • {payment.time}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              payment.status === "Paid"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            )}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-5 gap-2 flex-1 items-center text-sm">
                      <span className="text-foreground font-medium">
                        {payment.date}
                      </span>
                      <span className="text-foreground font-semibold">
                        {payment.amount}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {payment.method === "Transfer" ? (
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground">
                          {payment.method}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {payment.time}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 w-fit",
                          payment.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        )}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Payment Method Info */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                How to Pay
              </CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">
              Payment method &amp; bank details
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {paymentMethodInfo.bankName}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Account Number
                  </p>
                  <p className="text-sm font-mono font-semibold text-foreground tracking-wider">
                    {paymentMethodInfo.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Account Name
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {paymentMethodInfo.accountName}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick USSD code */}
            <div className="rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <p className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                Quick USSD Code
              </p>
              <p className="text-lg font-mono font-bold text-emerald-800 dark:text-emerald-300">
                {paymentMethodInfo.quickCode}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Dial from your registered phone number
              </p>
            </div>

            <Separator />

            {/* Payment tips */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Payment Tips
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Pay before 10:00 AM to maintain your streak</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Overpayments are credited to your account balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Keep your transfer receipt for reference</span>
                </li>
              </ul>
            </div>

            <Button className="w-full" variant="outline" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
