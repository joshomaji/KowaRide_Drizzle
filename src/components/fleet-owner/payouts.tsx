/**
 * ============================================================================
 * KOWA RIDE - FLEET OWNER DASHBOARD
 * Payouts Component — Financial Returns & Earnings
 * ============================================================================
 *
 * Fleet Owner's dedicated payouts & earnings page showing their financial
 * returns, payout history, ROI trends, bank details, and earnings
 * breakdown by bike.
 *
 * @module components/fleet-owner/payouts
 * @version 1.0.0
 * ============================================================================
 */

"use client";

// React Compiler handles memoization automatically
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Banknote,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CreditCard,
  CircleDollarSign,
  Landmark,
  Bike,
  Percent,
  AlertCircle,
} from "lucide-react";
import {
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
import { mockBikes, mockFleetOwners, mockPayouts, mockTransactions, mockRiders } from "@/lib/mock-data";
import { TransactionStatus, TransactionType, AssetStatus } from "@/types/admin";

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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

function getPayoutStatusConfig(status: TransactionStatus): {
  label: string;
  icon: typeof CheckCircle2;
  bgClass: string;
  badgeClass: string;
} {
  switch (status) {
    case TransactionStatus.COMPLETED:
      return {
        label: "Completed",
        icon: CheckCircle2,
        bgClass: "bg-emerald-100 dark:bg-emerald-950/40",
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
      };
    case TransactionStatus.PROCESSING:
      return {
        label: "Processing",
        icon: Clock,
        bgClass: "bg-sky-100 dark:bg-sky-950/40",
        badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
      };
    case TransactionStatus.PENDING:
      return {
        label: "Pending",
        icon: Clock,
        bgClass: "bg-amber-100 dark:bg-amber-950/40",
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      };
    case TransactionStatus.FLAGGED:
      return {
        label: "Flagged",
        icon: AlertCircle,
        bgClass: "bg-red-100 dark:bg-red-950/40",
        badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
      };
    case TransactionStatus.FAILED:
      return {
        label: "Failed",
        icon: AlertCircle,
        bgClass: "bg-red-100 dark:bg-red-950/40",
        badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
      };
    default:
      return {
        label: status,
        icon: Clock,
        bgClass: "bg-slate-100 dark:bg-slate-800",
        badgeClass: "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400",
      };
  }
}

// ============================================================================
// MOCK CHART DATA — Monthly earnings & ROI for fo-001
// ============================================================================

const monthlyEarnings = [
  { month: "Aug", earnings: 4200, payouts: 3800, roi: 3.2 },
  { month: "Sep", earnings: 4800, payouts: 4350, roi: 3.5 },
  { month: "Oct", earnings: 5100, payouts: 4600, roi: 3.8 },
  { month: "Nov", earnings: 5400, payouts: 4900, roi: 4.0 },
  { month: "Dec", earnings: 5800, payouts: 5200, roi: 4.1 },
  { month: "Jan", earnings: 5600, payouts: 5050, roi: 4.2 },
];

// ============================================================================
// CHART TOOLTIPS
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
          {entry.name}: ₦{entry.value.toLocaleString()}K
        </p>
      ))}
    </div>
  );
}

function RoiTooltipContent({
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
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Payouts() {
  const fleetOwner = mockFleetOwners.find((fo) => fo.id === "fo-001")!;
  const myPayouts = mockPayouts.filter((p) => p.ownerId === "fo-001");
  const myBikes = mockBikes.filter((b) => b.fleetOwnerId === "fo-001");

  // FO's payout transactions
  const payoutTransactions = mockTransactions.filter(
    (t) => t.type === TransactionType.OWNER_PAYOUT && t.receivedBy === "fo-001"
  );

  // Earnings summary KPIs
  const earningsKPIs = [
    {
      title: "Total Earnings",
      icon: Banknote,
      value: formatNairaCompact(fleetOwner.totalEarnings),
      subtitle: "Lifetime platform earnings",
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      trend: "up" as const,
    },
    {
      title: "Pending Payout",
      icon: Wallet,
      value: formatNairaCompact(fleetOwner.pendingPayout),
      subtitle: "Next payout: Jan 21, 2025",
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Monthly ROI",
      icon: TrendingUp,
      value: `${fleetOwner.monthlyRoi}%`,
      subtitle: `+0.3% vs last month`,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      trend: "up" as const,
    },
    {
      title: "Last Payout Date",
      icon: Calendar,
      value: "Jan 14",
      subtitle: formatNaira(2450000),
      iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    },
  ];

  // Pending payouts
  const pendingPayouts = myPayouts.filter(
    (p) =>
      p.status === TransactionStatus.PENDING ||
      p.status === TransactionStatus.PROCESSING
  );

  // Completed payouts sorted by date desc
  const completedPayouts = myPayouts
    .filter((p) => p.status === TransactionStatus.COMPLETED)
    .sort((a, b) => new Date(b.processedAt!).getTime() - new Date(a.processedAt!).getTime());

  // Earnings breakdown by bike — which bikes generate most revenue
  const bikeEarnings = myBikes
    .filter((b) => b.status === AssetStatus.ACTIVE && b.assignedRiderId)
    .map((bike) => {
      const rider = mockRiders.find((r) => r.id === bike.assignedRiderId);
      const dailyRev = rider?.dailyPaymentAmount || 3500;
      const monthlyEstimate = dailyRev * 26; // ~26 working days
      return {
        id: bike.id,
        assetId: bike.assetId,
        model: bike.makeModel,
        rider: rider ? `${rider.firstName} ${rider.lastName.charAt(0)}.` : "Unassigned",
        dailyRevenue: dailyRev,
        monthlyEstimate,
        payoutShare: Math.round(monthlyEstimate * 0.35), // ~35% to owner
      };
    })
    .sort((a, b) => b.monthlyEstimate - a.monthlyEstimate);

  // Extended payout history (combine mock data with additional records for display)
  const payoutHistory = [
    ...myPayouts.map((p) => ({
      id: p.id,
      reference: `PO-${p.id.toUpperCase()}`,
      period: `${formatDate(p.periodStart)} – ${formatDate(p.periodEnd)}`,
      amount: p.amount,
      bank: `${fleetOwner.bankDetails.bankName} ****${fleetOwner.bankDetails.accountNumber.slice(-4)}`,
      status: p.status,
      date: p.processedAt ? formatDate(p.processedAt) : "Pending",
    })),
    // Additional historical records for richer display
    {
      id: "po-h1",
      reference: "PO-HIST-001",
      period: "Dec 16 – Dec 31, 2024",
      amount: 2200000,
      bank: `${fleetOwner.bankDetails.bankName} ****${fleetOwner.bankDetails.accountNumber.slice(-4)}`,
      status: TransactionStatus.COMPLETED,
      date: "Jan 1, 2025",
    },
    {
      id: "po-h2",
      reference: "PO-HIST-002",
      period: "Dec 1 – Dec 15, 2024",
      amount: 1980000,
      bank: `${fleetOwner.bankDetails.bankName} ****${fleetOwner.bankDetails.accountNumber.slice(-4)}`,
      status: TransactionStatus.COMPLETED,
      date: "Dec 16, 2024",
    },
    {
      id: "po-h3",
      reference: "PO-HIST-003",
      period: "Nov 16 – Nov 30, 2024",
      amount: 1850000,
      bank: `${fleetOwner.bankDetails.bankName} ****${fleetOwner.bankDetails.accountNumber.slice(-4)}`,
      status: TransactionStatus.COMPLETED,
      date: "Dec 1, 2024",
    },
    {
      id: "po-h4",
      reference: "PO-HIST-004",
      period: "Nov 1 – Nov 15, 2024",
      amount: 1750000,
      bank: `${fleetOwner.bankDetails.bankName} ****${fleetOwner.bankDetails.accountNumber.slice(-4)}`,
      status: TransactionStatus.COMPLETED,
      date: "Nov 16, 2024",
    },
  ].sort((a, b) => {
    // Put pending/processing first, then completed by date
    const aPending = a.status !== TransactionStatus.COMPLETED;
    const bPending = b.status !== TransactionStatus.COMPLETED;
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return 0;
  });

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Payouts & Earnings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your financial returns, payout history, and ROI performance.
        </p>
      </div>

      {/* Earnings Summary KPI Cards */}
      <motion.div
        className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {earningsKPIs.map((kpi) => {
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

      {/* Charts Row: Earnings Trend + ROI Trend */}
      <motion.div
        className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Earnings Trend Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Earnings Trend</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                Last 6 months
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Monthly earnings and payout amounts (₦K)</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEarnings}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="payoutsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `₦${val}K`} />
                  <Tooltip content={<EarningsTooltipContent />} />
                  <Area type="monotone" dataKey="earnings" name="Earnings" stroke="#10b981" strokeWidth={2} fill="url(#earningsGrad)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="payouts" name="Payouts" stroke="#f59e0b" strokeWidth={2} fill="url(#payoutsGrad)" dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ROI Trend Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">ROI Trend</CardTitle>
              <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400">
                Monthly %
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Monthly return on investment percentage</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyEarnings}>
                  <defs>
                    <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `${val}%`} domain={[0, 6]} />
                  <Tooltip content={<RoiTooltipContent />} />
                  <Area type="monotone" dataKey="roi" name="Monthly ROI" stroke="#0ea5e9" strokeWidth={2} fill="url(#roiGradient)" dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Middle Row: Bank Details + Pending Payouts */}
      <motion.div
        className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Bank Details Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Payout Account</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">Current bank account for payouts</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
                <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{fleetOwner.bankDetails.bankName}</p>
                <p className="text-xs text-muted-foreground">{fleetOwner.bankDetails.accountName}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Account Number</span>
                <span className="text-sm font-mono font-medium text-foreground">
                  {fleetOwner.bankDetails.accountNumber.replace(/(\d{4})/, "$1 ")}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Account Name</span>
                <span className="text-sm font-medium text-foreground">{fleetOwner.bankDetails.accountName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Payout Frequency</span>
                <span className="text-sm font-medium text-foreground">Weekly</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Verification</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card className="border-border bg-card overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Pending Payouts</CardTitle>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                {pendingPayouts.length > 0 ? `${pendingPayouts.length} pending` : "None pending"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground/70">Payouts awaiting processing</p>
          </CardHeader>
          <CardContent>
            {pendingPayouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 mb-3">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground">All payouts up to date</p>
                <p className="text-xs text-muted-foreground mt-1">No pending payouts at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPayouts.map((payout) => {
                  const config = getPayoutStatusConfig(payout.status);
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={payout.id}
                      className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", config.bgClass)}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            {formatDate(payout.periodStart)} – {formatDate(payout.periodEnd)}
                          </p>
                          <p className="text-sm font-bold text-foreground">{formatNaira(payout.amount)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {payout.activeDays} active days
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {fleetOwner.bankDetails.bankName} ****{fleetOwner.bankDetails.accountNumber.slice(-4)}
                            </span>
                          </div>
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.badgeClass)}>
                            {config.label}
                          </Badge>
                        </div>
                        {payout.status === TransactionStatus.PROCESSING && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-muted-foreground">Processing</span>
                              <span className="text-[10px] text-muted-foreground">Expected: Jan 16, 2025</span>
                            </div>
                            <Progress value={65} className="h-1.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row: Payout History + Earnings by Bike */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        {/* Payout History Table — wider */}
        <Card className="border-border bg-card overflow-hidden lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Payout History</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">Complete history of payouts to your bank account</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {/* Table Header */}
              <div className="sticky top-0 z-10 grid grid-cols-[0.8fr_1.2fr_0.8fr_1fr_0.7fr] gap-2 bg-muted/80 px-4 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                <span>Reference</span>
                <span>Period</span>
                <span>Amount</span>
                <span>Bank</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-border">
                {payoutHistory.map((payout) => {
                  const config = getPayoutStatusConfig(payout.status);
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={payout.id}
                      className="grid grid-cols-[0.8fr_1.2fr_0.8fr_1fr_0.7fr] gap-2 px-4 py-3 hover:bg-muted/50 transition-colors items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-muted-foreground truncate">{payout.reference}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{payout.period}</p>
                        <p className="text-[10px] text-muted-foreground">{payout.date}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{formatNairaCompact(payout.amount)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{payout.bank}</p>
                      </div>
                      <div className="min-w-0">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.badgeClass)}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Earnings Breakdown by Bike — narrower */}
        <Card className="border-border bg-card overflow-hidden lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Earnings by Bike</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground/70">Revenue breakdown per active bike</p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {bikeEarnings.map((bike, idx) => (
                  <div key={bike.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/40">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">#{idx + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{bike.model}</p>
                        <span className="text-sm font-semibold text-foreground">
                          {formatNairaCompact(bike.monthlyEstimate)}/mo
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {bike.rider} • {formatNaira(bike.dailyRevenue)}/day
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          ~{formatNairaCompact(bike.payoutShare)} share
                        </span>
                      </div>
                      {/* Revenue bar */}
                      <div className="mt-2">
                        <Progress
                          value={(bike.monthlyEstimate / (bikeEarnings[0]?.monthlyEstimate || 1)) * 100}
                          className="h-1.5"
                        />
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
