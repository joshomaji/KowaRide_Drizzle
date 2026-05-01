"use client";

import { useState, useMemo } from "react";
import { ExpenseCategory, TransactionStatus } from "@/types/admin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Receipt,
  Wrench,
  Clock,
  TrendingUp,
  Eye,
  Pencil,
  ChevronRight,
  AlertTriangle,
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
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// ============================================================================
// MOCK DATA
// ============================================================================

interface ExpenseRecord {
  id: string;
  reference: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  status: TransactionStatus;
  payee: string;
  approvedBy: string | null;
  date: string;
  notes: string;
}

const mockExpenses: ExpenseRecord[] = [
  { id: "exp-001", reference: "EXP-20250115-001", category: "MAINTENANCE", description: "Engine overhaul - Honda CG 125 (KR-BIKE-00456)", amount: 75000, status: "COMPLETED", payee: "Lagos Auto Works", approvedBy: "Admin", date: "2025-01-15", notes: "Full engine rebuild required" },
  { id: "exp-002", reference: "EXP-20250114-002", category: "FUEL", description: "Fleet manager vehicle fuel - January Week 2", amount: 45000, status: "COMPLETED", payee: "NNPC Station Ikeja", approvedBy: "Admin", date: "2025-01-14", notes: "" },
  { id: "exp-003", reference: "EXP-20250113-003", category: "SALARY", description: "Office staff salaries - January 2025", amount: 2500000, status: "PROCESSING", payee: "Staff (12 employees)", approvedBy: "Super Admin", date: "2025-01-13", notes: "Includes 13th month pro-rated" },
  { id: "exp-004", reference: "EXP-20250112-004", category: "INSURANCE", description: "Fleet insurance premium - Q1 2025", amount: 980000, status: "COMPLETED", payee: "Leadway Assurance", approvedBy: "Super Admin", date: "2025-01-12", notes: "Comprehensive coverage for 163 bikes" },
  { id: "exp-005", reference: "EXP-20250111-005", category: "EQUIPMENT", description: "Safety helmets purchase (50 units)", amount: 350000, status: "COMPLETED", payee: "Rider Safety Gear Ltd", approvedBy: "Admin", date: "2025-01-11", notes: "DOT certified helmets" },
  { id: "exp-006", reference: "EXP-20250110-006", category: "OFFICE", description: "Office rent - January 2025", amount: 520000, status: "COMPLETED", payee: "Civic Towers", approvedBy: "Super Admin", date: "2025-01-10", notes: "Yaba Lagos office" },
  { id: "exp-007", reference: "EXP-20250109-007", category: "HMO", description: "HMO premium payment - Reliance HMO", amount: 680000, status: "PENDING", payee: "Reliance HMO", approvedBy: null, date: "2025-01-09", notes: "Awaiting approval from finance" },
  { id: "exp-008", reference: "EXP-20250108-008", category: "LOGISTICS", description: "Bike transportation - new fleet delivery", amount: 450000, status: "COMPLETED", payee: "GIG Logistics", approvedBy: "Admin", date: "2025-01-08", notes: "15 bikes from Abuja depot" },
  { id: "exp-009", reference: "EXP-20250107-009", category: "UTILITIES", description: "Electricity and internet - January", amount: 185000, status: "COMPLETED", payee: "IKEJA Electric", approvedBy: "Admin", date: "2025-01-07", notes: "Includes fibre internet" },
  { id: "exp-010", reference: "EXP-20250106-010", category: "MAINTENANCE", description: "Tire replacement batch (20 tires)", amount: 240000, status: "COMPLETED", payee: "Dunlop Nigeria", approvedBy: "Admin", date: "2025-01-06", notes: "Mix of 3.00-10 and 2.75-17 sizes" },
  { id: "exp-011", reference: "EXP-20250105-011", category: "MAINTENANCE", description: "GPS tracker replacement (8 units)", amount: 96000, status: "COMPLETED", payee: "TrackIt Nigeria", approvedBy: "Admin", date: "2025-01-05", notes: "Defective trackers replaced under warranty" },
  { id: "exp-012", reference: "EXP-20250104-012", category: "FUEL", description: "Generator fuel - office backup", amount: 65000, status: "COMPLETED", payee: "Total Energies", approvedBy: "Admin", date: "2025-01-04", notes: "Diesel for 100KVA generator" },
  { id: "exp-013", reference: "EXP-20250103-013", category: "MISCELLANEOUS", description: "Office supplies and consumables", amount: 45000, status: "COMPLETED", payee: "Jumia Supplies", approvedBy: "Admin", date: "2025-01-03", notes: "Stationery, printer ink, cleaning" },
  { id: "exp-014", reference: "EXP-20250102-014", category: "EQUIPMENT", description: "Phone mounting brackets (30 units)", amount: 90000, status: "COMPLETED", payee: "Rider Accessories Hub", approvedBy: "Admin", date: "2025-01-02", notes: "For new rider onboarding batch" },
  { id: "exp-015", reference: "EXP-20250101-015", category: "INSURANCE", description: "Third-party vehicle insurance renewal", amount: 320000, status: "PENDING", payee: "AIICO Insurance", approvedBy: null, date: "2025-01-01", notes: "Pending documentation review" },
];

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Formats a numeric amount as Nigerian Naira currency string.
 * @param amount - The numeric amount in Naira
 * @param compact - If true, uses short format (e.g., "₦145.2M"). Default: false.
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

/** Formats an ExpenseCategory enum value to human-readable Title Case. */
function formatCategory(category: ExpenseCategory): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Returns Tailwind classes for category badge color coding. */
function getCategoryBadgeClasses(category: ExpenseCategory): string {
  const map: Record<ExpenseCategory, string> = {
    [ExpenseCategory.MAINTENANCE]:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
    [ExpenseCategory.FUEL]:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    [ExpenseCategory.SALARY]:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
    [ExpenseCategory.OFFICE]:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800",
    [ExpenseCategory.INSURANCE]:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
    [ExpenseCategory.EQUIPMENT]:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800",
    [ExpenseCategory.LOGISTICS]:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
    [ExpenseCategory.HMO]:
      "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800",
    [ExpenseCategory.UTILITIES]:
      "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800",
    [ExpenseCategory.MISCELLANEOUS]:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
  };
  return map[category] || "";
}

/** Returns Tailwind classes for transaction status badges. */
function getStatusBadgeClasses(status: TransactionStatus): string {
  const map: Record<TransactionStatus, string> = {
    [TransactionStatus.COMPLETED]:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    [TransactionStatus.PENDING]:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    [TransactionStatus.PROCESSING]:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    [TransactionStatus.FAILED]:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    [TransactionStatus.REVERSED]:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    [TransactionStatus.FLAGGED]:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
  };
  return map[status] || "";
}

/** Returns Tailwind dot color class for category bar charts. */
function getCategoryDotColor(category: ExpenseCategory): string {
  const map: Record<ExpenseCategory, string> = {
    [ExpenseCategory.MAINTENANCE]: "bg-orange-500",
    [ExpenseCategory.FUEL]: "bg-amber-500",
    [ExpenseCategory.SALARY]: "bg-violet-500",
    [ExpenseCategory.OFFICE]: "bg-sky-500",
    [ExpenseCategory.INSURANCE]: "bg-rose-500",
    [ExpenseCategory.EQUIPMENT]: "bg-teal-500",
    [ExpenseCategory.LOGISTICS]: "bg-indigo-500",
    [ExpenseCategory.HMO]: "bg-pink-500",
    [ExpenseCategory.UTILITIES]: "bg-cyan-500",
    [ExpenseCategory.MISCELLANEOUS]: "bg-slate-400",
  };
  return map[category] || "bg-slate-400";
}

/** Returns Tailwind bar fill color class for category bar charts. */
function getCategoryBarColor(category: ExpenseCategory): string {
  const map: Record<ExpenseCategory, string> = {
    [ExpenseCategory.MAINTENANCE]: "bg-orange-500",
    [ExpenseCategory.FUEL]: "bg-amber-500",
    [ExpenseCategory.SALARY]: "bg-violet-500",
    [ExpenseCategory.OFFICE]: "bg-sky-500",
    [ExpenseCategory.INSURANCE]: "bg-rose-500",
    [ExpenseCategory.EQUIPMENT]: "bg-teal-500",
    [ExpenseCategory.LOGISTICS]: "bg-indigo-500",
    [ExpenseCategory.HMO]: "bg-pink-500",
    [ExpenseCategory.UTILITIES]: "bg-cyan-500",
    [ExpenseCategory.MISCELLANEOUS]: "bg-slate-400",
  };
  return map[category] || "bg-slate-400";
}

/** Category icon mapping for summary cards. */
function getCategoryIcon(category: ExpenseCategory) {
  switch (category) {
    case ExpenseCategory.MAINTENANCE:
      return Wrench;
    case ExpenseCategory.FUEL:
      return Receipt;
    case ExpenseCategory.SALARY:
      return TrendingUp;
    case ExpenseCategory.OFFICE:
      return Receipt;
    case ExpenseCategory.INSURANCE:
      return AlertTriangle;
    case ExpenseCategory.EQUIPMENT:
      return Receipt;
    case ExpenseCategory.LOGISTICS:
      return Receipt;
    case ExpenseCategory.HMO:
      return Receipt;
    case ExpenseCategory.UTILITIES:
      return Receipt;
    case ExpenseCategory.MISCELLANEOUS:
      return Receipt;
    default:
      return Receipt;
  }
}

/** Framer Motion stagger container for card entrance animations. */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

/** Framer Motion individual item animation variant. */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ============================================================================
// ADD EXPENSE FORM STATE TYPE
// ============================================================================

interface AddExpenseForm {
  category: string;
  description: string;
  amount: string;
  payee: string;
  date: string;
  notes: string;
}

const emptyForm: AddExpenseForm = {
  category: "",
  description: "",
  amount: "",
  payee: "",
  date: "",
  notes: "",
};

// ============================================================================
// EXPENSES PAGE COMPONENT
// ============================================================================

export function ExpensesPage() {
  // --- State ---
  const [activeTab, setActiveTab] = useState("expenses");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);
  const [addForm, setAddForm] = useState<AddExpenseForm>(emptyForm);

  // --- Computed data ---
  const totalExpenses = useMemo(
    () => mockExpenses.reduce((sum, e) => sum + e.amount, 0),
    []
  );

  const pendingCount = useMemo(
    () =>
      mockExpenses.filter(
        (e) => e.status === TransactionStatus.PENDING
      ).length,
    []
  );

  const budgetUtilization = 78.5;

  const filteredExpenses = useMemo(() => {
    return mockExpenses.filter((expense) => {
      if (
        categoryFilter !== "all" &&
        expense.category !== categoryFilter
      )
        return false;
      if (statusFilter !== "all" && expense.status !== statusFilter)
        return false;
      if (
        searchQuery &&
        !expense.reference.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !expense.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !expense.payee.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (dateFrom && expense.date < dateFrom) return false;
      if (dateTo && expense.date > dateTo) return false;
      return true;
    });
  }, [searchQuery, categoryFilter, statusFilter, dateFrom, dateTo]);

  const categorySummary = useMemo(() => {
    const summary = new Map<
      ExpenseCategory,
      { total: number; count: number }
    >();

    Object.values(ExpenseCategory).forEach((cat) => {
      summary.set(cat, { total: 0, count: 0 });
    });

    mockExpenses.forEach((expense) => {
      const entry = summary.get(expense.category)!;
      entry.total += expense.amount;
      entry.count += 1;
    });

    return Array.from(summary.entries())
      .filter(([, val]) => val.count > 0)
      .sort((a, b) => b[1].total - a[1].total);
  }, []);

  const maxCategoryTotal = useMemo(
    () =>
      categorySummary.length > 0
        ? categorySummary[0][1].total
        : 1,
    [categorySummary]
  );

  // --- Handlers ---
  const handleAddExpense = () => {
    setShowAddDialog(false);
    setAddForm(emptyForm);
  };

  // --- Truncate helper ---
  const truncate = (str: string, maxLength = 36): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* ================================================================
          Page Header
          ================================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Expense Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage all operational expenses across the platform.
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* ================================================================
          KPI Summary Cards
          ================================================================ */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Total Expenses This Month */}
        <motion.div variants={fadeInUp}>
          <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Expenses This Month
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {formatNaira(totalExpenses, true)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +5.2%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Maintenance Costs */}
        <motion.div variants={fadeInUp}>
          <Card className="relative overflow-hidden transition-shadow hover:shadow-md border-orange-200 dark:border-orange-800/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Maintenance Costs
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {formatNaira(4200000, true)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40">
                  <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
                >
                  Largest Category
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div variants={fadeInUp}>
          <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Approvals
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {pendingCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Requires attention
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Utilization */}
        <motion.div variants={fadeInUp}>
          <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Budget Utilization
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {budgetUtilization}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatNaira(totalExpenses, true)} of{" "}
                    {formatNaira(Math.round(totalExpenses / 0.785), true)}
                  </span>
                </div>
                <Progress value={budgetUtilization} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ================================================================
          Tabs
          ================================================================ */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-muted p-1">
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:bg-card data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm"
          >
            <Receipt className="mr-2 h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="data-[state=active]:bg-card data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Summary by Category
          </TabsTrigger>
        </TabsList>

        {/* ==============================================================
            TAB 1: EXPENSES TABLE
            ============================================================== */}
        <TabsContent value="expenses" className="space-y-6">
          {/* ----------------------------------------------------------
              Filter Bar
              ---------------------------------------------------------- */}
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
                    {filteredExpenses.length} of {mockExpenses.length} expenses
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {/* Search Input */}
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search reference, description, payee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 pl-8 text-sm"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="h-9 w-full text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.values(ExpenseCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {formatCategory(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Dropdown */}
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="h-9 w-full text-sm">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.values(TransactionStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) +
                            status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date Range */}
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="From"
                      className="h-9 flex-1 text-sm"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      placeholder="To"
                      className="h-9 flex-1 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ----------------------------------------------------------
              Expenses Table
              ---------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Reference
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Category
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                          Description
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                          Payee
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground hidden xl:table-cell">
                          Approved By
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="h-32 text-center text-sm text-muted-foreground"
                          >
                            No expenses match the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <TableRow
                            key={expense.id}
                            className="cursor-pointer transition-colors hover:bg-muted/50"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            {/* Reference */}
                            <TableCell className="text-xs font-mono font-medium text-foreground">
                              {expense.reference}
                            </TableCell>

                            {/* Category Badge */}
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-medium whitespace-nowrap",
                                  getCategoryBadgeClasses(expense.category)
                                )}
                              >
                                {formatCategory(expense.category)}
                              </Badge>
                            </TableCell>

                            {/* Description */}
                            <TableCell
                              className="text-xs text-muted-foreground hidden lg:table-cell max-w-[200px]"
                              title={expense.description}
                            >
                              {truncate(expense.description, 36)}
                            </TableCell>

                            {/* Payee */}
                            <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                              {expense.payee}
                            </TableCell>

                            {/* Amount */}
                            <TableCell className="text-sm font-semibold text-foreground text-right whitespace-nowrap">
                              {formatNaira(expense.amount)}
                            </TableCell>

                            {/* Status Badge */}
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-medium",
                                  getStatusBadgeClasses(expense.status)
                                )}
                              >
                                {expense.status.charAt(0) +
                                  expense.status
                                    .slice(1)
                                    .toLowerCase()}
                              </Badge>
                            </TableCell>

                            {/* Date */}
                            <TableCell className="text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                              {format(new Date(expense.date), "MMM d, yyyy")}
                            </TableCell>

                            {/* Approved By */}
                            <TableCell className="text-xs text-muted-foreground hidden xl:table-cell">
                              {expense.approvedBy ?? (
                                <span className="text-amber-500">
                                  Not assigned
                                </span>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground hover:text-emerald-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedExpense(expense);
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground hover:text-emerald-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ==============================================================
            TAB 2: SUMMARY BY CATEGORY
            ============================================================== */}
        <TabsContent value="summary" className="space-y-6">
          {/* ----------------------------------------------------------
              Category Cards Grid
              ---------------------------------------------------------- */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {categorySummary.map(([category, data]) => {
              const Icon = getCategoryIcon(category);
              const percentage = ((data.total / totalExpenses) * 100).toFixed(
                1
              );
              return (
                <motion.div key={category} variants={fadeInUp}>
                  <Card className="group transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl",
                              `bg-muted`
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                getCategoryDotColor(category).replace(
                                  "bg-",
                                  "text-"
                                )
                              )}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {formatCategory(category)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {data.count} expense
                              {data.count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-bold text-foreground">
                          {formatNaira(data.total, true)}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium",
                            getCategoryBadgeClasses(category)
                          )}
                        >
                          {percentage}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ----------------------------------------------------------
              Horizontal Bar Chart - Spending by Category
              ---------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 24 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground">
                  Spending by Category
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Horizontal breakdown of operational expenses across categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySummary.map(([category, data]) => {
                  const barPercentage = (data.total / maxCategoryTotal) * 100;
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              getCategoryDotColor(category)
                            )}
                          />
                          <span className="font-medium text-foreground">
                            {formatCategory(category)}
                          </span>
                          <span className="text-muted-foreground">
                            ({data.count})
                          </span>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatNaira(data.total)}
                        </span>
                      </div>
                      <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${barPercentage}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: 0.1,
                            ease: "easeOut",
                          }}
                          className={cn(
                            "absolute inset-y-0 left-0 flex items-center rounded-md",
                            getCategoryBarColor(category)
                          )}
                        >
                          {barPercentage > 15 && (
                            <span className="ml-2.5 text-[10px] font-bold text-white drop-shadow-sm whitespace-nowrap">
                              {formatNaira(data.total, true)}
                            </span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ================================================================
          Add Expense Dialog
          ================================================================ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add New Expense
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Record a new operational expense with category and payee details.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4 py-2">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="exp-category" className="text-sm font-medium text-foreground">
                  Category
                </Label>
                <Select
                  value={addForm.category}
                  onValueChange={(val) =>
                    setAddForm((prev) => ({ ...prev, category: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ExpenseCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {formatCategory(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="exp-desc" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Input
                  id="exp-desc"
                  placeholder="Brief description of the expense"
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="exp-amount" className="text-sm font-medium text-foreground">
                  Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    ₦
                  </span>
                  <Input
                    id="exp-amount"
                    type="number"
                    placeholder="0"
                    value={addForm.amount}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="pl-7"
                  />
                </div>
              </div>

              {/* Payee */}
              <div className="space-y-2">
                <Label htmlFor="exp-payee" className="text-sm font-medium text-foreground">
                  Payee
                </Label>
                <Input
                  id="exp-payee"
                  placeholder="Vendor or recipient name"
                  value={addForm.payee}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      payee: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="exp-date" className="text-sm font-medium text-foreground">
                  Date
                </Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={addForm.date}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="exp-notes" className="text-sm font-medium text-foreground">
                  Notes
                </Label>
                <Textarea
                  id="exp-notes"
                  placeholder="Additional details or notes..."
                  value={addForm.notes}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setAddForm(emptyForm);
              }}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExpense}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Submit Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================
          View Expense Dialog
          ================================================================ */}
      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => {
          if (!open) setSelectedExpense(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedExpense && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Expense Details
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground">
                  {selectedExpense.reference}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-2">
                <div className="space-y-5 py-2">
                  {/* Status & Category Row */}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        getCategoryBadgeClasses(selectedExpense.category)
                      )}
                    >
                      {formatCategory(selectedExpense.category)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        getStatusBadgeClasses(selectedExpense.status)
                      )}
                    >
                      {selectedExpense.status.charAt(0) +
                        selectedExpense.status
                          .slice(1)
                          .toLowerCase()}
                    </Badge>
                  </div>

                  {/* Amount */}
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Amount
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {formatNaira(selectedExpense.amount)}
                    </p>
                  </div>

                  <Separator />

                  {/* Detail Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Description
                      </p>
                      <p className="text-sm text-foreground">
                        {selectedExpense.description}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Payee
                      </p>
                      <p className="text-sm text-foreground">
                        {selectedExpense.payee}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Date
                      </p>
                      <p className="text-sm text-foreground">
                        {format(
                          new Date(selectedExpense.date),
                          "MMMM d, yyyy"
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Approved By
                      </p>
                      <p className="text-sm text-foreground">
                        {selectedExpense.approvedBy ?? (
                          <span className="text-amber-500 italic">
                            Not assigned
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedExpense.notes && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Notes
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {selectedExpense.notes}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedExpense(null)}
                  className="text-muted-foreground"
                >
                  Close
                </Button>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit Expense
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
