/**
 * ============================================================================
 * KOWA RIDE - FLEET OWNER DASHBOARD
 * My Fleet Component — Bike Portfolio & Investment Details
 * ============================================================================
 *
 * Fleet Owner's dedicated "My Fleet" page showing their bike portfolio
 * with investment details, status distribution, maintenance schedules,
 * and value depreciation tracking.
 *
 * @module components/fleet-owner/my-fleet
 * @version 1.0.0
 * ============================================================================
 */

"use client";

// React Compiler handles memoization automatically
import { motion } from "framer-motion";
import {
  Bike,
  Activity,
  Wrench,
  BarChart3,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockBikes, mockFleetOwners, mockRiders } from "@/lib/mock-data";
import { AssetStatus } from "@/types/admin";

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
// HELPERS
// ============================================================================

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

function getStatusColor(status: AssetStatus): string {
  switch (status) {
    case AssetStatus.ACTIVE:
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    case AssetStatus.IN_MAINTENANCE:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    case AssetStatus.IDLE:
      return "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400";
    case AssetStatus.REPORTED_STOLEN:
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case AssetStatus.DECOMMISSIONED:
      return "bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400";
    case AssetStatus.TOTAL_LOSS:
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400";
  }
}

function getStatusLabel(status: AssetStatus): string {
  switch (status) {
    case AssetStatus.ACTIVE:
      return "Active";
    case AssetStatus.IN_MAINTENANCE:
      return "Maintenance";
    case AssetStatus.IDLE:
      return "Idle";
    case AssetStatus.REPORTED_STOLEN:
      return "Stolen";
    case AssetStatus.DECOMMISSIONED:
      return "Decommissioned";
    case AssetStatus.TOTAL_LOSS:
      return "Total Loss";
    default:
      return status;
  }
}

function getRiderName(riderId: string | null): string {
  if (!riderId) return "Unassigned";
  const rider = mockRiders.find((r) => r.id === riderId);
  return rider ? `${rider.firstName} ${rider.lastName.charAt(0)}.` : "Unknown";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MyFleet() {
  // Filter bikes for fo-001
  const fleetOwner = mockFleetOwners.find((fo) => fo.id === "fo-001")!;
  const myBikes = mockBikes.filter((b) => b.fleetOwnerId === "fo-001");

  // Derived metrics
  const activeBikes = myBikes.filter((b) => b.status === AssetStatus.ACTIVE).length;
  const inMaintenance = myBikes.filter((b) => b.status === AssetStatus.IN_MAINTENANCE).length;
  const stolenBikes = myBikes.filter((b) => b.status === AssetStatus.REPORTED_STOLEN).length;
  const idleBikes = myBikes.filter((b) => b.status === AssetStatus.IDLE).length;

  const fleetValue = myBikes.reduce((sum, b) => sum + b.currentValue, 0);

  const totalPurchaseValue = myBikes.reduce((sum, b) => sum + b.purchasePrice, 0);

  const avgBikeAge = (() => {
    const now = new Date().getFullYear();
    const ages = myBikes.map((b) => now - b.year);
    return (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
  })();

  const utilizationRate = (() => {
    if (myBikes.length === 0) return "0";
    return ((activeBikes / myBikes.length) * 100).toFixed(1);
  })();

  const avgRevenuePerBike = (() => {
    // Estimate from FO's total earnings / active bikes / months active
    const monthlyEstimate = fleetOwner.totalEarnings / 12; // approximate monthly
    return Math.round(monthlyEstimate / Math.max(activeBikes, 1));
  })();

  // Pie chart data
  const statusDistribution: { name: string; value: number; color: string }[] = [
    ...(activeBikes > 0 ? [{ name: "Active", value: activeBikes, color: "#10b981" }] : []),
    ...(inMaintenance > 0 ? [{ name: "Maintenance", value: inMaintenance, color: "#f59e0b" }] : []),
    ...(stolenBikes > 0 ? [{ name: "Stolen", value: stolenBikes, color: "#ef4444" }] : []),
    ...(idleBikes > 0 ? [{ name: "Idle", value: idleBikes, color: "#94a3b8" }] : []),
  ];

  // Depreciation chart data
  const depreciationData = myBikes.map((b) => ({
    name: b.assetId.replace("KR-BIKE-00", ""),
    purchase: b.purchasePrice / 1000,
    current: b.currentValue / 1000,
    depreciation: ((1 - b.currentValue / b.purchasePrice) * 100).toFixed(0),
  }));

  // Maintenance schedule data
  const upcomingMaintenance = myBikes
    .filter((b) => b.nextMaintenanceDate)
    .sort(
      (a, b) =>
        new Date(a.nextMaintenanceDate!).getTime() -
        new Date(b.nextMaintenanceDate!).getTime()
    )
    .slice(0, 6);

  const overdueMaintenance = (() => {
    const now = new Date();
    return myBikes.filter(
      (b) => b.nextMaintenanceDate && new Date(b.nextMaintenanceDate) < now
    );
  })();

  // KPI cards
  const fleetKPIs = [
    {
      title: "Total Bikes",
      icon: Bike,
      value: String(fleetOwner.totalBikes),
      subtitle: `${activeBikes} active, ${inMaintenance} in maintenance`,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Active Bikes",
      icon: Activity,
      value: String(activeBikes),
      subtitle: `${utilizationRate}% utilization rate`,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      trend: "up" as const,
    },
    {
      title: "In Maintenance",
      icon: Wrench,
      value: String(inMaintenance),
      subtitle: overdueMaintenance.length > 0 ? `${overdueMaintenance.length} overdue` : "All on schedule",
      iconBg: overdueMaintenance.length > 0
        ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
        : "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      trend: overdueMaintenance.length > 0 ? ("down" as const) : undefined,
    },
    {
      title: "Fleet Value",
      icon: BarChart3,
      value: formatNairaCompact(fleetValue),
      subtitle: `Purchased: ${formatNairaCompact(totalPurchaseValue)}`,
      iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    },
    {
      title: "Avg Bike Age",
      icon: Clock,
      value: `${avgBikeAge} yrs`,
      subtitle: "Based on manufacture year",
      iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    },
    {
      title: "Avg Revenue/Bike",
      icon: Gauge,
      value: formatNairaCompact(avgRevenuePerBike),
      subtitle: "Monthly estimate per bike",
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
  ];

  // Custom pie chart label
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Depreciation tooltip
  function DepreciationTooltipContent({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string; payload?: { depreciation: string } }>;
    label?: string;
  }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
        <p className="mb-1 text-xs font-medium text-muted-foreground">Bike {label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-semibold text-foreground">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: ₦{entry.value}K
          </p>
        ))}
        {payload[0]?.payload && (
          <p className="mt-1 text-xs text-red-500">
            Depreciation: {payload[0].payload.depreciation}%
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          My Fleet
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your bike portfolio, track asset values, and monitor maintenance schedules.
        </p>
      </div>

      {/* Fleet Summary KPI Cards */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {fleetKPIs.map((kpi) => {
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

      {/* Middle Row: Status Distribution + Fleet Performance */}
      <motion.div
        className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Bike Status Distribution — Donut Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Bike Status Distribution</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                {myBikes.length} total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Current operational status across your fleet</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-56 w-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} bikes`, name]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {statusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground flex-1">{item.name}</span>
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((item.value / myBikes.length) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Performance Metrics */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Fleet Performance</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">Key performance indicators for your fleet</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {/* Utilization Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Utilization Rate</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{utilizationRate}%</span>
              </div>
              <Progress value={parseFloat(utilizationRate)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {activeBikes} of {myBikes.length} bikes currently generating revenue
              </p>
            </div>

            <Separator />

            {/* Avg Revenue Per Bike */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Avg Revenue / Bike</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNairaCompact(avgRevenuePerBike)}/mo
                </span>
              </div>
              <Progress value={72} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Estimated monthly earnings per active bike
              </p>
            </div>

            <Separator />

            {/* Fleet Value vs Purchase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Value Retention</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                  {((fleetValue / totalPurchaseValue) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(fleetValue / totalPurchaseValue) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Current value {formatNairaCompact(fleetValue)} vs purchase {formatNairaCompact(totalPurchaseValue)}
              </p>
            </div>

            <Separator />

            {/* Active Days / Week */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Avg Active Days / Week</span>
                <span className="text-sm font-bold text-foreground">{fleetOwner.avgActiveDaysPerWeek}</span>
              </div>
              <Progress value={(fleetOwner.avgActiveDaysPerWeek / 7) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Target: 6+ days/week for maximum ROI
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bike Value Depreciation Tracker */}
      <motion.div
        className="mb-8"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Bike Value Depreciation</CardTitle>
              <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
                Purchase vs Current
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Comparing purchase price to current market value (₦K)</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depreciationData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `₦${val}K`} />
                  <Tooltip content={<DepreciationTooltipContent />} />
                  <Bar dataKey="purchase" name="Purchase Price" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="current" name="Current Value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row: Bike Portfolio Table + Maintenance Schedule */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Bike Portfolio Table — wider */}
        <Card className="border-border bg-card overflow-hidden lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Bike Portfolio</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                {myBikes.length} assets
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Complete fleet inventory with assignment and revenue details</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[420px]">
              {/* Table Header */}
              <div className="sticky top-0 z-10 grid grid-cols-[1fr_1fr_0.8fr_1fr_0.7fr_0.8fr] gap-2 bg-muted/80 px-4 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                <span>Asset / Model</span>
                <span>Plate / Year</span>
                <span>Assigned Rider</span>
                <span>Daily Revenue</span>
                <span>Current Value</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-border">
                {myBikes.map((bike) => (
                  <div
                    key={bike.id}
                    className="grid grid-cols-[1fr_1fr_0.8fr_1fr_0.7fr_0.8fr] gap-2 px-4 py-3 hover:bg-muted/50 transition-colors items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">{bike.assetId}</p>
                      <p className="text-sm font-medium text-foreground truncate">{bike.makeModel}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{bike.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{bike.year}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {getRiderName(bike.assignedRiderId)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      {bike.status === AssetStatus.ACTIVE ? (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {formatNaira(bike.assignedRiderId ? 3500 : 0)}/day
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">—</p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {formatNairaCompact(bike.currentValue)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {((bike.currentValue / bike.purchasePrice) * 100).toFixed(0)}% of purchase
                      </p>
                    </div>
                    <div className="min-w-0">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0", getStatusColor(bike.status))}
                      >
                        {getStatusLabel(bike.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Maintenance Schedule — narrower */}
        <Card className="border-border bg-card overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Maintenance Schedule</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">Upcoming and overdue maintenance</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[420px]">
              {/* Overdue Section */}
              {overdueMaintenance.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 px-4 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                      Overdue ({overdueMaintenance.length})
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {overdueMaintenance.map((bike) => (
                      <div key={bike.id} className="flex items-center gap-3 px-4 py-3 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/40">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{bike.makeModel}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{bike.assetId}</span>
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                              Due: {formatDate(bike.nextMaintenanceDate)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        >
                          Overdue
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Section */}
              <div>
                <div className="flex items-center gap-2 px-4 py-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Upcoming
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {upcomingMaintenance
                    .filter((b) => !overdueMaintenance.some((o) => o.id === b.id))
                    .map((bike) => {
                      const isSoon =
                        bike.nextMaintenanceDate &&
                        new Date(bike.nextMaintenanceDate).getTime() - Date.now() <
                          30 * 24 * 60 * 60 * 1000;
                      return (
                        <div key={bike.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                          <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            isSoon
                              ? "bg-amber-100 dark:bg-amber-950/40"
                              : "bg-slate-100 dark:bg-slate-800"
                          )}>
                            {isSoon ? (
                              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{bike.makeModel}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{bike.assetId}</span>
                              <span className={cn(
                                "text-xs font-medium",
                                isSoon
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              )}>
                                {formatDate(bike.nextMaintenanceDate)}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              isSoon
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                : "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400"
                            )}
                          >
                            {isSoon ? "Soon" : "Scheduled"}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
