/**
 * ============================================================================
 * KOWA RIDE - FLEET MANAGER DASHBOARD
 * Fleet Manager Overview Component
 * ============================================================================
 *
 * Dashboard overview tailored for Fleet Managers. Shows metrics relevant
 * to their operational scope: rider management, fleet performance,
 * collection rates, and incident tracking.
 *
 * @module components/fleet-manager/dashboard/overview
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Bike,
  Users,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Activity,
  Clock,
  PhoneCall,
  Wrench,
  ChevronRight,
  MapPin,
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
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  mockKPIs,
  collectionChartData,
  utilizationChartData,
  mockRiders,
  mockBikes,
  mockAlerts,
} from "@/lib/mock-data";
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
// HELPER FUNCTIONS
// ============================================================================

function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

// ============================================================================
// CHART TOOLTIP
// ============================================================================

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
// MOCK DATA - Fleet Manager specific
// ============================================================================

const fmKPIs = [
  {
    title: "Active Riders",
    icon: Users,
    value: "48",
    subtitle: "Under your management",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    title: "Collection Rate",
    icon: TrendingUp,
    value: "87.3%",
    subtitle: "This week's average",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    title: "Fleet Utilization",
    icon: Activity,
    value: "91%",
    subtitle: "44 of 48 bikes active",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    title: "Pending Payments",
    icon: Wallet,
    value: "₦126K",
    subtitle: "6 riders overdue",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    title: "Active Incidents",
    icon: AlertTriangle,
    value: "3",
    subtitle: "Requires attention",
    iconBg: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  },
  {
    title: "Bikes in Maintenance",
    icon: Wrench,
    value: "4",
    subtitle: "Under repair/service",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
  },
];

const riderPerformanceData = [
  { name: "Chukwuemeka O.", status: "Active", paid: "₦3,500", streak: 14, rate: 95, avatar: "https://i.pravatar.cc/80?img=11" },
  { name: "Aishat A.", status: "Active", paid: "₦3,500", streak: 12, rate: 92, avatar: "https://i.pravatar.cc/80?img=5" },
  { name: "Olumide A.", status: "Active", paid: "₦3,000", streak: 8, rate: 88, avatar: "https://i.pravatar.cc/80?img=12" },
  { name: "Blessing O.", status: "Overdue", paid: "₦0", streak: 0, rate: 45, avatar: "https://i.pravatar.cc/80?img=26" },
  { name: "Abdulahi G.", status: "Active", paid: "₦3,000", streak: 6, rate: 85, avatar: "https://i.pravatar.cc/80?img=15" },
  { name: "Fatimah I.", status: "Partial", paid: "₦2,000", streak: 2, rate: 72, avatar: "https://i.pravatar.cc/80?img=45" },
];

const recentAlerts = [
  { id: "1", title: "Bike KR-BIKE-0034 GPS offline", severity: "high", time: "12 min ago", rider: "Olumide A." },
  { id: "2", title: "Rider Blessing O. - 3 days overdue", severity: "critical", time: "1 hour ago", rider: "Blessing O." },
  { id: "3", title: "Maintenance due: KR-BIKE-0012", severity: "medium", time: "3 hours ago", rider: "N/A" },
  { id: "4", title: "New rider assigned to your portfolio", severity: "info", time: "5 hours ago", rider: "New Rider" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FleetManagerOverview() {
  const { data: session } = useSession();
  const { setActiveSection } = useAdminStore();
  const [dateFilter, setDateFilter] = useState("today");

  const firstName = session?.user?.firstName || "Fleet Manager";

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fleet Manager Dashboard — Monitor your riders, bikes, and collection performance.
        </p>
      </div>

      {/* Date Range Filter */}
      <motion.div
        className="mb-6 flex flex-wrap items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { key: "today", label: "Today" },
          { key: "week", label: "This Week" },
          { key: "month", label: "This Month" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setDateFilter(item.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors border border-border",
              dateFilter === item.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {item.label}
          </button>
        ))}
      </motion.div>

      {/* KPI Stats Cards */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {fmKPIs.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={fadeUpItem}>
              <Card
                className={cn(
                  "group cursor-pointer transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-md border-border bg-card"
                )}
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", kpi.iconBg)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
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
        {/* Collection Rate Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Collection Rate This Week
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                Avg: 87.3%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Daily repayment collection rate (%)</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionChartData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[75, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" name="Collection Rate" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="secondaryValue" name="Target" fill="#d1fae5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Utilization by Manager */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Bike Utilization</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">91%</Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Fleet utilization rate (%)</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {utilizationChartData.slice(0, 6).map((item) => (
                <div key={item.label} className="group">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground/80">{item.label}</span>
                    <span className={cn(
                      "text-xs font-bold",
                      item.value >= 90 ? "text-emerald-600" : item.value >= 80 ? "text-green-600" : item.value >= 70 ? "text-amber-600" : "text-red-600"
                    )}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      style={{ backgroundColor: item.value >= 90 ? "#10b981" : item.value >= 80 ? "#22c55e" : item.value >= 70 ? "#f59e0b" : "#ef4444" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row: Rider Performance + Alerts */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Rider Performance Table */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">My Riders Performance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                onClick={() => setActiveSection(AdminSection.RIDERS)}
              >
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70">Today&apos;s payment status and streak</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="divide-y divide-border">
                {riderPerformanceData.map((rider, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                      <AvatarImage src={rider.avatar} alt={rider.name} />
                      <AvatarFallback className="bg-muted text-[10px] font-semibold">
                        {rider.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{rider.name}</p>
                        <span className="text-xs font-semibold text-foreground">{rider.paid}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            rider.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : rider.status === "Overdue"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          )}
                        >
                          {rider.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {rider.streak > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              🔥 {rider.streak}d streak
                            </span>
                          )}
                          <span className={cn(
                            "text-[10px] font-medium",
                            rider.rate >= 90 ? "text-emerald-600" : rider.rate >= 70 ? "text-amber-600" : "text-red-600"
                          )}>
                            {rider.rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Alerts & Notifications</CardTitle>
              <Badge variant="destructive" className="text-[10px]">{recentAlerts.length} new</Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Items requiring your attention</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="divide-y divide-border">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                      alert.severity === "critical" && "border-l-2 border-l-red-500 bg-red-50/30 dark:bg-red-950/20"
                    )}
                  >
                    <div className={cn(
                      "mt-1 shrink-0 flex h-7 w-7 items-center justify-center rounded-lg",
                      alert.severity === "critical" ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
                      alert.severity === "high" ? "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400" :
                      alert.severity === "medium" ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                      "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                    )}>
                      {alert.severity === "critical" ? <AlertTriangle className="h-3.5 w-3.5" /> :
                       alert.severity === "high" ? <AlertTriangle className="h-3.5 w-3.5" /> :
                       alert.severity === "medium" ? <Clock className="h-3.5 w-3.5" /> :
                       <MapPin className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{alert.rider}</span>
                        <span className="text-[10px] text-muted-foreground/70">• {alert.time}</span>
                      </div>
                    </div>
                    {alert.severity === "critical" && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 shrink-0">
                        <PhoneCall className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
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
