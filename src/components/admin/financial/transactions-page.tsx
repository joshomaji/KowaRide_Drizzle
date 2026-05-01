"use client";

import { useState, useMemo } from "react";
import {
  mockTransactions,
  mockPayouts,
  mockFleetOwners,
  mockFleetManagers,
} from "@/lib/mock-data";
import {
  TransactionType,
  TransactionStatus,
} from "@/types/admin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Users,
  Crown,
  UserCog,
  Heart,
  CreditCard,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// ============================================================================
// UTILITY HELPERS
// ============================================================================

function formatNaira(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

function formatTransactionType(type: TransactionType): string {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusBadgeClasses(status: TransactionStatus): string {
  const map: Record<TransactionStatus, string> = {
    [TransactionStatus.COMPLETED]: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    [TransactionStatus.PENDING]: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    [TransactionStatus.PROCESSING]: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    [TransactionStatus.FAILED]: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    [TransactionStatus.REVERSED]: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    [TransactionStatus.FLAGGED]: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
  };
  return map[status] || "";
}

function getTypeBadgeClasses(type: TransactionType): string {
  const map: Record<TransactionType, string> = {
    [TransactionType.DAILY_PAYMENT]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [TransactionType.OWNER_PAYOUT]: "bg-teal-50 text-teal-700 border-teal-200",
    [TransactionType.MANAGER_FEE]: "bg-orange-50 text-orange-700 border-orange-200",
    [TransactionType.MAINTENANCE_ALLOCATION]: "bg-blue-50 text-blue-700 border-blue-200",
    [TransactionType.HMO_PREMIUM]: "bg-purple-50 text-purple-700 border-purple-200",
    [TransactionType.COMPANY_REVENUE]: "bg-cyan-50 text-cyan-700 border-cyan-200",
    [TransactionType.RESERVE_FUND]: "bg-amber-50 text-amber-700 border-amber-200",
    [TransactionType.PENALTY]: "bg-red-50 text-red-700 border-red-200",
    [TransactionType.BONUS]: "bg-lime-50 text-lime-700 border-lime-200",
    [TransactionType.REFUND]: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return map[type] || "";
}

function getApprovalBadgeClasses(status: string): string {
  switch (status) {
    case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
    case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
    default: return "";
  }
}

// ============================================================================
// ANIMATION CONFIGS
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ============================================================================
// HMO PAYMENTS MOCK DATA
// ============================================================================

interface HMOPaymentRecord {
  id: string;
  reference: string;
  hmoProvider: string;
  fleetManager: string;
  numberOfRiders: number;
  premiumPerRider: number;
  totalAmount: number;
  status: TransactionStatus;
  date: string;
  period: string;
}

const mockHMOPayments: HMOPaymentRecord[] = [
  { id: "hmo-001", reference: "HMO-20250115-001", hmoProvider: "Reliance HMO", fleetManager: "Tunde Bakare", numberOfRiders: 27, premiumPerRider: 1500, totalAmount: 40500, status: TransactionStatus.COMPLETED, date: "2025-01-15", period: "January 2025" },
  { id: "hmo-002", reference: "HMO-20250115-002", hmoProvider: "Reliance HMO", fleetManager: "Ngozi Anyawu", numberOfRiders: 20, premiumPerRider: 1500, totalAmount: 30000, status: TransactionStatus.COMPLETED, date: "2025-01-15", period: "January 2025" },
  { id: "hmo-003", reference: "HMO-20250115-003", hmoProvider: "Hygeia HMO", fleetManager: "Samuel Ogundimu", numberOfRiders: 16, premiumPerRider: 1500, totalAmount: 24000, status: TransactionStatus.PROCESSING, date: "2025-01-15", period: "January 2025" },
  { id: "hmo-004", reference: "HMO-20250115-004", hmoProvider: "Leadway HMO", fleetManager: "Amina Dangote", numberOfRiders: 12, premiumPerRider: 1500, totalAmount: 18000, status: TransactionStatus.PENDING, date: "2025-01-15", period: "January 2025" },
  { id: "hmo-005", reference: "HMO-20250115-005", hmoProvider: "Hygeia HMO", fleetManager: "David Olatunji", numberOfRiders: 29, premiumPerRider: 1500, totalAmount: 43500, status: TransactionStatus.COMPLETED, date: "2025-01-15", period: "January 2025" },
  { id: "hmo-006", reference: "HMO-20250114-006", hmoProvider: "Reliance HMO", fleetManager: "Hauwa Kwaje", numberOfRiders: 7, premiumPerRider: 1500, totalAmount: 10500, status: TransactionStatus.FAILED, date: "2025-01-14", period: "January 2025" },
  { id: "hmo-007", reference: "HMO-20241215-007", hmoProvider: "Leadway HMO", fleetManager: "Tunde Bakare", numberOfRiders: 25, premiumPerRider: 1500, totalAmount: 37500, status: TransactionStatus.COMPLETED, date: "2024-12-15", period: "December 2024" },
  { id: "hmo-008", reference: "HMO-20241215-008", hmoProvider: "Reliance HMO", fleetManager: "Ngozi Anyawu", numberOfRiders: 19, premiumPerRider: 1500, totalAmount: 28500, status: TransactionStatus.COMPLETED, date: "2024-12-15", period: "December 2024" },
];

// ============================================================================
// STAFF & MANAGER PAYMENTS MOCK DATA
// ============================================================================

interface StaffPaymentRecord {
  id: string;
  reference: string;
  recipientName: string;
  role: "Fleet Manager" | "Operations Staff" | "IT Staff" | "Admin Staff";
  amount: number;
  period: string;
  bankDetails: string;
  status: TransactionStatus;
  approvalStatus: "APPROVED" | "PENDING" | "REJECTED";
  approvedBy: string | null;
  date: string;
  notes: string;
}

const mockStaffPayments: StaffPaymentRecord[] = [
  { id: "staff-001", reference: "PAY-20250115-001", recipientName: "Tunde Bakare", role: "Fleet Manager", amount: 84000, period: "January 2025", bankDetails: "GTBank - 0123456789", status: TransactionStatus.PROCESSING, approvalStatus: "APPROVED", approvedBy: "Super Admin", date: "2025-01-15", notes: "Monthly management fee - 28 bikes" },
  { id: "staff-002", reference: "PAY-20250115-002", recipientName: "Ngozi Anyawu", role: "Fleet Manager", amount: 66000, period: "January 2025", bankDetails: "Access Bank - 0987654321", status: TransactionStatus.PROCESSING, approvalStatus: "APPROVED", approvedBy: "Super Admin", date: "2025-01-15", notes: "Monthly management fee - 22 bikes" },
  { id: "staff-003", reference: "PAY-20250115-003", recipientName: "Samuel Ogundimu", role: "Fleet Manager", amount: 54000, period: "January 2025", bankDetails: "UBA - 1122334455", status: TransactionStatus.PENDING, approvalStatus: "APPROVED", approvedBy: "Super Admin", date: "2025-01-15", notes: "Monthly management fee - 18 bikes" },
  { id: "staff-004", reference: "PAY-20250115-004", recipientName: "Amina Dangote", role: "Fleet Manager", amount: 45000, period: "January 2025", bankDetails: "First Bank - 2233445566", status: TransactionStatus.PENDING, approvalStatus: "APPROVED", approvedBy: "Super Admin", date: "2025-01-15", notes: "Monthly management fee - 15 bikes" },
  { id: "staff-005", reference: "PAY-20250115-005", recipientName: "David Olatunji", role: "Fleet Manager", amount: 90000, period: "January 2025", bankDetails: "Zenith Bank - 3344556677", status: TransactionStatus.PROCESSING, approvalStatus: "APPROVED", approvedBy: "Super Admin", date: "2025-01-15", notes: "Monthly management fee - 30 bikes" },
  { id: "staff-006", reference: "PAY-20250115-006", recipientName: "Hauwa Kwaje", role: "Fleet Manager", amount: 30000, period: "January 2025", bankDetails: "Sterling Bank - 4455667788", status: TransactionStatus.PENDING, approvalStatus: "PENDING", approvedBy: null, date: "2025-01-15", notes: "On probation - pending review" },
  { id: "staff-007", reference: "PAY-20250115-007", recipientName: "Adebayo Okonkwo", role: "Operations Staff", amount: 350000, period: "January 2025", bankDetails: "GTBank - 5566778899", status: TransactionStatus.COMPLETED, approvalStatus: "APPROVED", approvedBy: "Super Admin", date: "2025-01-15", notes: "Operations coordinator salary" },
  { id: "staff-008", reference: "PAY-20250115-008", recipientName: "Funke Adeyemi", role: "IT Staff", amount: 280000, period: "January 2025", bankDetails: "Access Bank - 6677889900", status: TransactionStatus.COMPLETED, approvalStatus: "APPROVED", approvedBy: "Admin", date: "2025-01-15", notes: "IT support and platform maintenance" },
  { id: "staff-009", reference: "PAY-20250115-009", recipientName: "Blessing Nwosu", role: "Admin Staff", amount: 220000, period: "January 2025", bankDetails: "UBA - 7788990011", status: TransactionStatus.COMPLETED, approvalStatus: "APPROVED", approvedBy: "Admin", date: "2025-01-15", notes: "Administrative assistant" },
  { id: "staff-010", reference: "PAY-20250115-010", recipientName: "Segun Alabi", role: "Operations Staff", amount: 180000, period: "January 2025", bankDetails: "First Bank - 8899001122", status: TransactionStatus.PENDING, approvalStatus: "APPROVED", approvedBy: "Super Admin", date: "2025-01-15", notes: "Field operations supervisor" },
];

// ============================================================================
// ADD PAYOUT FORM STATE
// ============================================================================

interface AddPayoutForm {
  recipientType: string;
  recipientName: string;
  amount: string;
  period: string;
  bankDetails: string;
  notes: string;
}

const emptyPayoutForm: AddPayoutForm = {
  recipientType: "",
  recipientName: "",
  amount: "",
  period: "",
  bankDetails: "",
  notes: "",
};

// ============================================================================
// KPI CARDS
// ============================================================================

const kpiCards = [
  { title: "Total Transactions", value: "1,247", icon: Receipt, trend: "+8.3%", positive: true, iconBg: "bg-emerald-50 dark:bg-emerald-950/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { title: "Total Volume", value: formatNaira(145200000, true), icon: TrendingUp, trend: "+12.5%", positive: true, iconBg: "bg-emerald-50 dark:bg-emerald-950/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { title: "Pending Payouts", value: formatNaira(18750000, true), icon: Wallet, trend: null, positive: true, iconBg: "bg-amber-50 dark:bg-amber-950/40", iconColor: "text-amber-600 dark:text-amber-400" },
  { title: "Failed Transactions", value: "23", icon: AlertTriangle, trend: "-3.1%", positive: false, iconBg: "bg-red-50 dark:bg-red-950/40", iconColor: "text-red-600 dark:text-red-400" },
];

// ============================================================================
// TRANSACTIONS PAGE COMPONENT
// ============================================================================

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof mockTransactions)[0] | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<(typeof mockPayouts)[0] | null>(null);
  const [selectedHMO, setSelectedHMO] = useState<HMOPaymentRecord | null>(null);
  const [selectedStaffPayment, setSelectedStaffPayment] = useState<StaffPaymentRecord | null>(null);
  const [showAddPayout, setShowAddPayout] = useState(false);
  const [payoutForm, setPayoutForm] = useState<AddPayoutForm>(emptyPayoutForm);

  // --- Computed ---
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((txn) => {
      if (typeFilter !== "all" && txn.type !== typeFilter) return false;
      if (statusFilter !== "all" && txn.status !== statusFilter) return false;
      if (searchQuery && !txn.reference.toLowerCase().includes(searchQuery.toLowerCase()) && !txn.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (dateFrom && txn.createdAt < dateFrom) return false;
      if (dateTo && txn.createdAt > dateTo + "T23:59:59Z") return false;
      return true;
    });
  }, [typeFilter, statusFilter, searchQuery, dateFrom, dateTo]);

  const truncate = (str: string, max = 38) => str.length <= max ? str : str.slice(0, max) + "...";

  return (
    <div className="space-y-6">
      {/* ================================================================
          Page Header
          ================================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Transactions &amp; Payouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track all platform transactions, payouts to Fleet Owners, HMO providers, Fleet Managers, and staff disbursements.</p>
        </div>
        <Button onClick={() => setShowAddPayout(true)} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Record Payout
        </Button>
      </div>

      {/* ================================================================
          KPI Cards
          ================================================================ */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={fadeInUp}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
                    </div>
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", kpi.iconBg)}>
                      <Icon className={cn("h-5 w-5", kpi.iconColor)} />
                    </div>
                  </div>
                  {kpi.trend && (
                    <div className="mt-3 flex items-center gap-1 text-xs">
                      {kpi.positive ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                      <span className={cn("font-medium", kpi.positive ? "text-emerald-600" : "text-red-500")}>{kpi.trend}</span>
                      <span className="text-muted-foreground">vs last period</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ================================================================
          Tabs
          ================================================================ */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm">
            <CreditCard className="mr-2 h-4 w-4" /> All Transactions
          </TabsTrigger>
          <TabsTrigger value="fleet-owners" className="data-[state=active]:bg-card data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm">
            <Crown className="mr-2 h-4 w-4" /> Fleet Owner Payouts
          </TabsTrigger>
          <TabsTrigger value="hmo" className="data-[state=active]:bg-card data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm">
            <Heart className="mr-2 h-4 w-4" /> HMO Payments
          </TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-card data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm">
            <UserCog className="mr-2 h-4 w-4" /> Staff &amp; Manager
          </TabsTrigger>
        </TabsList>

        {/* ==============================================================
            TAB 1: ALL TRANSACTIONS
            ============================================================== */}
        <TabsContent value="all" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Filters</span>
                  <span className="ml-auto text-xs text-muted-foreground">{filteredTransactions.length} of {mockTransactions.length} transactions</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search reference or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 pl-8 text-sm" />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.values(TransactionType).map((t) => <SelectItem key={t} value={t}>{formatTransactionType(t)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.values(TransactionStatus).map((s) => <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Recipient / Payee</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Amount</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">Description</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">No transactions match the current filters.</TableCell></TableRow>
                      ) : filteredTransactions.map((txn) => (
                        <TableRow key={txn.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setSelectedTransaction(txn)}>
                          <TableCell className="text-xs font-mono font-medium text-foreground">{txn.reference}</TableCell>
                          <TableCell><Badge variant="outline" className={cn("text-[10px] font-medium", getTypeBadgeClasses(txn.type))}>{formatTransactionType(txn.type)}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{txn.receivedBy}</TableCell>
                          <TableCell className="text-sm font-semibold text-foreground text-right">{formatNaira(txn.amount)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[180px]" title={txn.description}>{truncate(txn.description)}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className={cn("text-[10px] font-medium", getStatusBadgeClasses(txn.status))}>{txn.status.charAt(0) + txn.status.slice(1).toLowerCase()}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{format(new Date(txn.createdAt), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); setSelectedTransaction(txn); }}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ==============================================================
            TAB 2: FLEET OWNER PAYOUTS
            ============================================================== */}
        <TabsContent value="fleet-owners" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">Fleet Owner Payouts</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Weekly payout disbursements to fleet owners</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="w-fit text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Owner Name</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Amount</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">Bank Details</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Period</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell text-center">Approval</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayouts.map((payout) => (
                        <TableRow key={payout.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setSelectedPayout(payout)}>
                          <TableCell className="text-xs font-mono font-medium text-foreground">{payout.id.toUpperCase()}</TableCell>
                          <TableCell className="text-sm font-medium text-foreground">{payout.ownerName}</TableCell>
                          <TableCell className="text-sm font-semibold text-foreground text-right">{formatNaira(payout.amount)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell truncate max-w-[200px]">{payout.ownerName.includes("Adeniyi") ? "GTBank - 0123456789" : payout.ownerName.includes("Mohammed") ? "Access Bank - 0987654321" : payout.ownerName.includes("Okoro") ? "First Bank - 1122334455" : payout.ownerName.includes("Chukwu") ? "UBA - 2233445566" : "Zenith Bank - 3344556677"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{format(new Date(payout.periodStart), "MMM d")} - {format(new Date(payout.periodEnd), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className={cn("text-[10px] font-medium", getStatusBadgeClasses(payout.status))}>{payout.status.charAt(0) + payout.status.slice(1).toLowerCase()}</Badge></TableCell>
                          <TableCell className="text-center hidden md:table-cell"><Badge variant="outline" className={cn("text-[10px] font-medium", payout.status === TransactionStatus.COMPLETED ? getApprovalBadgeClasses("APPROVED") : payout.status === TransactionStatus.FLAGGED ? getApprovalBadgeClasses("PENDING") : getApprovalBadgeClasses("PENDING"))}>{payout.status === TransactionStatus.COMPLETED ? "Approved" : payout.status === TransactionStatus.FLAGGED ? "Review" : "Pending"}</Badge></TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); setSelectedPayout(payout); }}><Eye className="h-3.5 w-3.5" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ==============================================================
            TAB 3: HMO PAYMENTS
            ============================================================== */}
        <TabsContent value="hmo" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">HMO Payments</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Health insurance premium payments to HMO providers</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="w-fit text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">HMO Provider</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Fleet Manager</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center hidden sm:table-cell">Riders</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right hidden lg:table-cell">Premium/Rider</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Total Amount</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockHMOPayments.map((hmo) => (
                        <TableRow key={hmo.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setSelectedHMO(hmo)}>
                          <TableCell className="text-xs font-mono font-medium text-foreground">{hmo.reference}</TableCell>
                          <TableCell className="text-sm font-medium text-foreground">{hmo.hmoProvider}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{hmo.fleetManager}</TableCell>
                          <TableCell className="text-xs text-muted-foreground text-center hidden sm:table-cell">{hmo.numberOfRiders}</TableCell>
                          <TableCell className="text-xs text-muted-foreground text-right hidden lg:table-cell">{formatNaira(hmo.premiumPerRider)}</TableCell>
                          <TableCell className="text-sm font-semibold text-foreground text-right">{formatNaira(hmo.totalAmount)}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className={cn("text-[10px] font-medium", getStatusBadgeClasses(hmo.status))}>{hmo.status.charAt(0) + hmo.status.slice(1).toLowerCase()}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{format(new Date(hmo.date), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); setSelectedHMO(hmo); }}><Eye className="h-3.5 w-3.5" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ==============================================================
            TAB 4: STAFF & MANAGER PAYMENTS
            ============================================================== */}
        <TabsContent value="staff" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">Staff &amp; Manager Payments</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Salary disbursements to fleet managers and operational staff</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="w-fit text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Export All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Recipient</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Amount</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Period</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">Bank Details</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell text-center">Approval</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockStaffPayments.map((sp) => (
                        <TableRow key={sp.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setSelectedStaffPayment(sp)}>
                          <TableCell className="text-xs font-mono font-medium text-foreground">{sp.reference}</TableCell>
                          <TableCell className="text-sm font-medium text-foreground">{sp.recipientName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground"><Badge variant="outline" className={cn("text-[10px] font-medium", sp.role === "Fleet Manager" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-sky-50 text-sky-700 border-sky-200")}>{sp.role}</Badge></TableCell>
                          <TableCell className="text-sm font-semibold text-foreground text-right">{formatNaira(sp.amount)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{sp.period}</TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell truncate max-w-[200px]">{sp.bankDetails}</TableCell>
                          <TableCell className="text-center"><Badge variant="outline" className={cn("text-[10px] font-medium", getStatusBadgeClasses(sp.status))}>{sp.status.charAt(0) + sp.status.slice(1).toLowerCase()}</Badge></TableCell>
                          <TableCell className="text-center hidden md:table-cell"><Badge variant="outline" className={cn("text-[10px] font-medium", getApprovalBadgeClasses(sp.approvalStatus))}>{sp.approvalStatus.charAt(0) + sp.approvalStatus.slice(1).toLowerCase()}</Badge></TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); setSelectedStaffPayment(sp); }}><Eye className="h-3.5 w-3.5" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ================================================================
          Transaction Detail Dialog
          ================================================================ */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-lg">
          {selectedTransaction && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg">Transaction Details</DialogTitle>
              </DialogHeader>
              <Separator />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Reference</p><p className="text-sm font-mono font-medium text-foreground">{selectedTransaction.reference}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline" className={cn("text-xs font-medium mt-1", getStatusBadgeClasses(selectedTransaction.status))}>{selectedTransaction.status}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Type</p><Badge variant="outline" className={cn("text-xs font-medium mt-1", getTypeBadgeClasses(selectedTransaction.type))}>{formatTransactionType(selectedTransaction.type)}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-bold text-foreground mt-1">{formatNaira(selectedTransaction.amount)}</p></div>
                </div>
                <Separator />
                <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm text-foreground mt-1">{selectedTransaction.description}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Initiated By</p><p className="text-sm text-foreground mt-1">{selectedTransaction.initiatedBy}</p></div>
                  <div><p className="text-xs text-muted-foreground">Received By</p><p className="text-sm text-foreground mt-1">{selectedTransaction.receivedBy}</p></div>
                  <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm text-foreground mt-1">{format(new Date(selectedTransaction.createdAt), "MMM d, yyyy 'at' h:mm a")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-sm text-foreground mt-1">{selectedTransaction.completedAt ? format(new Date(selectedTransaction.completedAt), "MMM d, yyyy 'at' h:mm a") : "Pending"}</p></div>
                </div>
                {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div><p className="text-xs text-muted-foreground">Metadata</p><pre className="mt-1 rounded-lg bg-muted p-3 text-xs text-foreground overflow-x-auto">{JSON.stringify(selectedTransaction.metadata, null, 2)}</pre></div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Payout Detail Dialog
          ================================================================ */}
      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent className="max-w-lg">
          {selectedPayout && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg">Payout Details</DialogTitle>
              </DialogHeader>
              <Separator />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Owner Name</p><p className="text-sm font-medium text-foreground mt-1">{selectedPayout.ownerName}</p></div>
                  <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-bold text-foreground mt-1">{formatNaira(selectedPayout.amount)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Active Days</p><p className="text-sm text-foreground mt-1">{selectedPayout.activeDays} days</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline" className={cn("text-xs font-medium mt-1", getStatusBadgeClasses(selectedPayout.status))}>{selectedPayout.status}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Period Start</p><p className="text-sm text-foreground mt-1">{format(new Date(selectedPayout.periodStart), "MMM d, yyyy")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Period End</p><p className="text-sm text-foreground mt-1">{format(new Date(selectedPayout.periodEnd), "MMM d, yyyy")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Processed At</p><p className="text-sm text-foreground mt-1">{selectedPayout.processedAt ? format(new Date(selectedPayout.processedAt), "MMM d, yyyy 'at' h:mm a") : "Not yet processed"}</p></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          HMO Payment Detail Dialog
          ================================================================ */}
      <Dialog open={!!selectedHMO} onOpenChange={() => setSelectedHMO(null)}>
        <DialogContent className="max-w-lg">
          {selectedHMO && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg">HMO Payment Details</DialogTitle>
              </DialogHeader>
              <Separator />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Reference</p><p className="text-sm font-mono font-medium text-foreground mt-1">{selectedHMO.reference}</p></div>
                  <div><p className="text-xs text-muted-foreground">Provider</p><p className="text-sm font-medium text-foreground mt-1">{selectedHMO.hmoProvider}</p></div>
                  <div><p className="text-xs text-muted-foreground">Fleet Manager</p><p className="text-sm text-foreground mt-1">{selectedHMO.fleetManager}</p></div>
                  <div><p className="text-xs text-muted-foreground">Number of Riders</p><p className="text-sm font-medium text-foreground mt-1">{selectedHMO.numberOfRiders}</p></div>
                  <div><p className="text-xs text-muted-foreground">Premium per Rider</p><p className="text-sm text-foreground mt-1">{formatNaira(selectedHMO.premiumPerRider)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Amount</p><p className="text-sm font-bold text-foreground mt-1">{formatNaira(selectedHMO.totalAmount)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Period</p><p className="text-sm text-foreground mt-1">{selectedHMO.period}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline" className={cn("text-xs font-medium mt-1", getStatusBadgeClasses(selectedHMO.status))}>{selectedHMO.status}</Badge></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Staff Payment Detail Dialog
          ================================================================ */}
      <Dialog open={!!selectedStaffPayment} onOpenChange={() => setSelectedStaffPayment(null)}>
        <DialogContent className="max-w-lg">
          {selectedStaffPayment && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg">Staff Payment Details</DialogTitle>
              </DialogHeader>
              <Separator />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Reference</p><p className="text-sm font-mono font-medium text-foreground mt-1">{selectedStaffPayment.reference}</p></div>
                  <div><p className="text-xs text-muted-foreground">Role</p><Badge variant="outline" className={cn("text-xs font-medium mt-1", selectedStaffPayment.role === "Fleet Manager" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-sky-50 text-sky-700 border-sky-200")}>{selectedStaffPayment.role}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Recipient</p><p className="text-sm font-medium text-foreground mt-1">{selectedStaffPayment.recipientName}</p></div>
                  <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-bold text-foreground mt-1">{formatNaira(selectedStaffPayment.amount)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Period</p><p className="text-sm text-foreground mt-1">{selectedStaffPayment.period}</p></div>
                  <div><p className="text-xs text-muted-foreground">Bank Details</p><p className="text-sm text-foreground mt-1">{selectedStaffPayment.bankDetails}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline" className={cn("text-xs font-medium mt-1", getStatusBadgeClasses(selectedStaffPayment.status))}>{selectedStaffPayment.status.charAt(0) + selectedStaffPayment.status.slice(1).toLowerCase()}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Approval</p><Badge variant="outline" className={cn("text-xs font-medium mt-1", getApprovalBadgeClasses(selectedStaffPayment.approvalStatus))}>{selectedStaffPayment.approvalStatus.charAt(0) + selectedStaffPayment.approvalStatus.slice(1).toLowerCase()}</Badge></div>
                </div>
                {selectedStaffPayment.notes && (
                  <><Separator /><div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm text-foreground mt-1">{selectedStaffPayment.notes}</p></div></>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================================================================
          Add Payout Dialog
          ================================================================ */}
      <Dialog open={showAddPayout} onOpenChange={setShowAddPayout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recipient Type</Label>
              <Select value={payoutForm.recipientType} onValueChange={(v) => setPayoutForm({ ...payoutForm, recipientType: v, recipientName: "" })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fleet_owner">Fleet Owner</SelectItem>
                  <SelectItem value="fleet_manager">Fleet Manager</SelectItem>
                  <SelectItem value="hmo">HMO Provider</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recipient Name</Label>
              {payoutForm.recipientType === "fleet_owner" && (
                <Select value={payoutForm.recipientName} onValueChange={(v) => setPayoutForm({ ...payoutForm, recipientName: v })}>
                  <SelectTrigger><SelectValue placeholder="Select fleet owner" /></SelectTrigger>
                  <SelectContent>{mockFleetOwners.map((fo) => <SelectItem key={fo.id} value={`${fo.firstName} ${fo.lastName}`}>{fo.firstName} {fo.lastName} (FO-{fo.ownerId.slice(-3)})</SelectItem>)}</SelectContent>
                </Select>
              )}
              {payoutForm.recipientType === "fleet_manager" && (
                <Select value={payoutForm.recipientName} onValueChange={(v) => setPayoutForm({ ...payoutForm, recipientName: v })}>
                  <SelectTrigger><SelectValue placeholder="Select fleet manager" /></SelectTrigger>
                  <SelectContent>{mockFleetManagers.map((fm) => <SelectItem key={fm.id} value={`${fm.firstName} ${fm.lastName}`}>{fm.firstName} {fm.lastName} (FM-{fm.managerId.slice(-3)})</SelectItem>)}</SelectContent>
                </Select>
              )}
              {payoutForm.recipientType === "hmo" && (
                <Select value={payoutForm.recipientName} onValueChange={(v) => setPayoutForm({ ...payoutForm, recipientName: v })}>
                  <SelectTrigger><SelectValue placeholder="Select HMO provider" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reliance HMO">Reliance HMO</SelectItem>
                    <SelectItem value="Hygeia HMO">Hygeia HMO</SelectItem>
                    <SelectItem value="Leadway HMO">Leadway HMO</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {payoutForm.recipientType === "staff" && (
                <Input placeholder="Enter staff name" value={payoutForm.recipientName} onChange={(e) => setPayoutForm({ ...payoutForm, recipientName: e.target.value })} />
              )}
              {payoutForm.recipientType === "" && <Input placeholder="Select recipient type first" disabled />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Amount (₦)</Label>
                <Input type="number" placeholder="0" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Period</Label>
                <Input placeholder="e.g. January 2025" value={payoutForm.period} onChange={(e) => setPayoutForm({ ...payoutForm, period: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bank Details</Label>
              <Input placeholder="Bank - Account Number" value={payoutForm.bankDetails} onChange={(e) => setPayoutForm({ ...payoutForm, bankDetails: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes (Optional)</Label>
              <Textarea placeholder="Additional notes..." value={payoutForm.notes} onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPayout(false)}>Cancel</Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => { setShowAddPayout(false); setPayoutForm(emptyPayoutForm); }}>Record Payout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
