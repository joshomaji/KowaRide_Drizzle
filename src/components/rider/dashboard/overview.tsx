/**
 * ============================================================================
 * KOWA RIDE - RIDER DASHBOARD
 * Rider Overview Component
 * ============================================================================
 *
 * Dashboard overview tailored for Riders. Shows metrics relevant
 * to their daily operations: payment status, bike info, ownership
 * progress, and account balance.
 *
 * @module components/rider/dashboard/overview
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Bike,
  TrendingUp,
  Shield,
  Flame,
  Wallet,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Heart,
  ArrowUpRight,
  CalendarDays,
  Award,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/store/admin-store";
import { AdminSection } from "@/types/admin";

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
// MOCK DATA - Rider specific
// ============================================================================

const riderKPIs = [
  {
    title: "Today's Payment",
    icon: CreditCard,
    value: "₦3,500",
    subtitle: "Daily payment amount",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    status: "paid" as const,
  },
  {
    title: "Payment Streak",
    icon: Flame,
    value: "14 days",
    subtitle: "Consecutive on-time payments",
    iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
  },
  {
    title: "Repayment Rate",
    icon: TrendingUp,
    value: "95%",
    subtitle: "This month's performance",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    title: "Account Balance",
    icon: Wallet,
    value: "₦5,200",
    subtitle: "Credit from overpayment",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
  },
  {
    title: "Ownership Progress",
    icon: Award,
    value: "8/24 mo",
    subtitle: "33% towards ownership",
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
  },
  {
    title: "HMO Status",
    icon: Heart,
    value: "Enrolled",
    subtitle: "Health coverage active",
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  },
];

const paymentHistory = [
  { day: "Mon", amount: 3500, status: "paid" },
  { day: "Tue", amount: 3500, status: "paid" },
  { day: "Wed", amount: 3500, status: "paid" },
  { day: "Thu", amount: 3500, status: "paid" },
  { day: "Fri", amount: 3500, status: "paid" },
  { day: "Sat", amount: 0, status: "rest" },
  { day: "Sun", amount: 0, status: "rest" },
];

const recentPayments = [
  { date: "Today", amount: "₦3,500", method: "Transfer", time: "08:15 AM", status: "Paid" },
  { date: "Yesterday", amount: "₦3,500", method: "Transfer", time: "07:45 AM", status: "Paid" },
  { date: "Jan 13", amount: "₦3,500", method: "Transfer", time: "08:30 AM", status: "Paid" },
  { date: "Jan 12", amount: "₦3,500", method: "Transfer", time: "09:00 AM", status: "Paid" },
  { date: "Jan 11", amount: "₦3,500", method: "Cash", time: "10:15 AM", status: "Paid" },
  { date: "Jan 10", amount: "₦3,500", method: "Transfer", time: "08:00 AM", status: "Paid" },
  { date: "Jan 9", amount: "₦3,500", method: "Transfer", time: "08:20 AM", status: "Paid" },
];

const bikeInfo = {
  model: "Honda CG 125",
  plateNo: "LAG-123-AB",
  year: 2023,
  color: "Black",
  vinNumber: "VIN-HON-2023-45678",
  status: "Active",
  lastMaintenance: "Dec 15, 2024",
  nextMaintenance: "Mar 15, 2025",
  odometerKm: 12450,
};

const ownershipMilestones = [
  { month: 6, label: "6 months — First milestone", achieved: true },
  { month: 12, label: "12 months — Halfway point", achieved: false },
  { month: 18, label: "18 months — Home stretch", achieved: false },
  { month: 24, label: "24 months — Full ownership! 🎉", achieved: false },
];

// ============================================================================
// CHART TOOLTIP
// ============================================================================

function PaymentTooltipContent({
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
          {entry.name}: ₦{entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RiderOverview() {
  const { data: session } = useSession();
  const { setActiveSection } = useAdminStore();
  const firstName = session?.user?.firstName || "Rider";

  const ownershipProgress = 33; // 8 out of 24 months

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rider Dashboard — Track your payments, bike status, and ownership journey.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {riderKPIs.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={fadeUpItem}>
              <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-border bg-card">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", kpi.iconBg)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    {kpi.status === "paid" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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

      {/* Ownership Progress Banner */}
      <motion.div
        className="mb-8"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold">Ownership Pathway Progress</h3>
                <p className="text-sm text-emerald-100 mt-0.5">
                  You are 8 months into the 24-month bike ownership program. Keep up the great work!
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">Progress</span>
                    <span className="font-bold">{ownershipProgress}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${ownershipProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {ownershipMilestones.map((milestone) => (
                      <div key={milestone.month} className="flex items-center gap-1">
                        {milestone.achieved ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-white/40" />
                        )}
                        <span className={cn("text-[10px]", milestone.achieved ? "text-white font-medium" : "text-emerald-100/70")}>
                          {milestone.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row: Payment History + Bike Info */}
      <motion.div
        className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Payment History Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Weekly Payment History</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                🔥 14-day streak
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Daily payment amounts this week (₦)</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentHistory}>
                  <defs>
                    <linearGradient id="paymentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `₦${val}`} />
                  <Tooltip content={<PaymentTooltipContent />} />
                  <Area type="monotone" dataKey="amount" name="Payment" stroke="#10b981" strokeWidth={2} fill="url(#paymentGradient)" dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* My Bike Info */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">My Bike</CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Current bike assignment details</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Bike className="h-7 w-7 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{bikeInfo.model}</h3>
                <p className="text-sm text-muted-foreground">{bikeInfo.color} • {bikeInfo.year}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plate Number</p>
                <p className="text-sm font-semibold text-foreground">{bikeInfo.plateNo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Odometer</p>
                <p className="text-sm font-semibold text-foreground">{bikeInfo.odometerKm.toLocaleString()} km</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Service</p>
                <p className="text-sm font-semibold text-foreground">{bikeInfo.lastMaintenance}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next Service</p>
                <p className="text-sm font-semibold text-foreground">{bikeInfo.nextMaintenance}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">GPS tracking active</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Payments */}
      <motion.div
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Recent Payments</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">Your latest payment transactions</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentPayments.map((payment, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{payment.date}</p>
                      <span className="text-sm font-semibold text-foreground">{payment.amount}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground">{payment.method} • {payment.time}</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
