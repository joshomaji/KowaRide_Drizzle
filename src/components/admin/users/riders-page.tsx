"use client";

/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Riders Management Page Component
 * ============================================================================
 *
 * A comprehensive riders management interface providing search, filtering,
 * sortable data tables, pagination, and detailed rider profile dialogs.
 * Designed for superadmins to monitor and manage the entire rider fleet.
 *
 * Features:
 * - Real-time search across name, rider ID, email, and phone
 * - Multi-criteria filtering by status and KYC verification
 * - Sortable data table with column header click-to-sort
 * - Paginated table with configurable page size (8 per page)
 * - Rider detail dialog with full profile, financials, performance, and actions
 * - Stats summary cards with staggered fade-in animations
 * - Responsive design with horizontal scroll for table on mobile
 *
 * @module components/admin/users/riders-page
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { mockRiders } from "@/lib/mock-data";
import { Rider, RiderStatus, KycStatus, UnpaidDayAction } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  Bike,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  MapPin,
  CreditCard,
  Heart,
  TrendingUp,
  Plus,
  MessageSquareWarning,
  Phone,
  AlertTriangle,
  UserX,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Number of riders displayed per table page */
const RIDERS_PER_PAGE = 8;

/** Mapping of rider statuses to visual badge styles */
const STATUS_BADGE_STYLES: Record<
  RiderStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  [RiderStatus.ACTIVE]: {
    label: "Active",
    className:
      "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
    icon: CheckCircle,
  },
  [RiderStatus.INACTIVE]: {
    label: "Inactive",
    className: "bg-muted/30 text-foreground/80 border-border hover:bg-muted/50",
    icon: Clock,
  },
  [RiderStatus.SUSPENDED]: {
    label: "Suspended",
    className: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20",
    icon: XCircle,
  },
  [RiderStatus.PENDING_ONBOARDING]: {
    label: "Pending",
    className:
      "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20",
    icon: Clock,
  },
  [RiderStatus.TERMINATED]: {
    label: "Terminated",
    className: "bg-muted/30 text-foreground/80 border-border hover:bg-muted/50",
    icon: XCircle,
  },
};

/** Mapping of KYC statuses to visual badge styles */
const KYC_BADGE_STYLES: Record<
  KycStatus,
  { label: string; className: string }
> = {
  [KycStatus.VERIFIED]: {
    label: "Verified",
    className:
      "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
  },
  [KycStatus.PENDING]: {
    label: "Pending",
    className:
      "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20",
  },
  [KycStatus.IN_REVIEW]: {
    label: "In Review",
    className: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20",
  },
  [KycStatus.REJECTED]: {
    label: "Rejected",
    className: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20",
  },
  [KycStatus.EXPIRED]: {
    label: "Expired",
    className:
      "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20",
  },
};

/** Type for table sort configuration */
type SortField =
  | "name"
  | "riderId"
  | "status"
  | "kycStatus"
  | "dailyPaymentAmount"
  | "repaymentRate"
  | "paymentStreak"
  | "hmoEnrolled"
  | "unpaidDays";

type SortDirection = "asc" | "desc";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a number as Nigerian Naira currency string.
 * @param amount - The numeric amount in Naira
 * @returns Formatted string like "₦3,500"
 */
function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? "-₦" : "₦";
  return `${prefix}${Math.abs(amount).toLocaleString()}`;
}

/**
 * Gets the rider's initials from their first and last name.
 * Falls back to "?" if both names are empty.
 * @param rider - The rider object
 * @returns A 2-character initials string
 */
function getInitials(rider: Rider): string {
  const first = rider.firstName?.charAt(0)?.toUpperCase() || "";
  const last = rider.lastName?.charAt(0)?.toUpperCase() || "";
  return first + last || "?";
}

/**
 * Returns the appropriate color class for a repayment rate progress bar.
 * Rates above 90% are green, 70-90% amber, below 70% red.
 * @param rate - Repayment rate percentage (0-100)
 * @returns Tailwind color class string for the progress indicator
 */
function getRepaymentRateColor(rate: number): string {
  if (rate >= 90) return "bg-emerald-500";
  if (rate >= 70) return "bg-amber-500";
  return "bg-red-500";
}

/** Returns badge styling and label for unpaid day escalation */
function getUnpaidDayBadge(unpaidDays: number, action: UnpaidDayAction) {
  if (unpaidDays === 0) return { label: "Clear", className: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" };
  if (unpaidDays === 1) return { label: "1d — SMS Sent", className: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" };
  if (unpaidDays === 2) return { label: "2d — FM Called", className: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800" };
  if (unpaidDays === 3) return { label: "3d — Final Warning", className: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" };
  if (unpaidDays === 4) return { label: "4d — Suspended", className: "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700" };
  return { label: "5d — Bike Retrieval", className: "bg-red-100 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-400 dark:border-red-600 font-semibold" };
}

/** Returns the escalation icon for unpaid days */
function getUnpaidDayIcon(unpaidDays: number) {
  if (unpaidDays === 0) return CheckCircle;
  if (unpaidDays === 1) return MessageSquareWarning;
  if (unpaidDays === 2) return Phone;
  if (unpaidDays === 3) return AlertTriangle;
  if (unpaidDays === 4) return UserX;
  return Truck;
}

/**
 * Framer Motion animation variants for staggered list items.
 */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ============================================================================
// SORT INDICATOR COMPONENT
// ============================================================================

/**
 * SortIndicator — Displays a small up/down arrow pair indicating sort direction.
 * Highlights the active sort direction.
 *
 * @param props - Component props
 * @param props.field - The sort field this indicator represents
 * @param props.currentField - The currently active sort field
 * @param props.direction - The current sort direction
 * @returns Rendered sort indicator arrows
 */
function SortIndicator({
  field,
  currentField,
  direction,
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}) {
  return (
    <span className="ml-1 inline-flex flex-col items-center text-[10px] leading-none opacity-40">
      <span
        className={cn(
          currentField === field && direction === "asc"
            ? "opacity-100 text-foreground"
            : ""
        )}
      >
        ▲
      </span>
      <span
        className={cn(
          currentField === field && direction === "desc"
            ? "opacity-100 text-foreground"
            : ""
        )}
      >
        ▼
      </span>
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RidersPage — The main riders management component for the superadmin dashboard.
 *
 * Provides a complete interface for searching, filtering, viewing, and managing
 * all registered riders in the Kowa Ride platform. Features include:
 *
 * - **Stats Summary**: Top-level KPIs (total, active, suspended, pending, avg repayment)
 * - **Filter Bar**: Search input + status dropdown + KYC dropdown
 * - **Data Table**: Sortable columns with rider info, status, KYC, payments, streak, HMO
 * - **Pagination**: Page-based navigation with rider count display
 * - **Detail Dialog**: Comprehensive rider profile with personal, financial, performance,
 *   health, and location sections plus admin action buttons
 *
 * @example
 * ```tsx
 * import { RidersPage } from "@/components/admin/users/riders-page";
 *
 * // In your admin layout/page:
 * <RidersPage />
 * ```
 *
 * @returns The rendered riders management page JSX
 */
export function RidersPage() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("riderId");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // ---------------------------------------------------------------------------
  // Derived Data: Filtering
  // ---------------------------------------------------------------------------
  const filteredRiders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return mockRiders.filter((rider) => {
      // Search filter: matches against name, rider ID, email, phone
      if (query) {
        const fullName = `${rider.firstName} ${rider.lastName}`.toLowerCase();
        const matchesSearch =
          fullName.includes(query) ||
          rider.riderId.toLowerCase().includes(query) ||
          rider.email.toLowerCase().includes(query) ||
          rider.phone.includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && rider.status !== statusFilter) {
        return false;
      }

      // KYC filter
      if (kycFilter !== "all" && rider.kycStatus !== kycFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, kycFilter]);

  // ---------------------------------------------------------------------------
  // Derived Data: Sorting
  // ---------------------------------------------------------------------------
  const sortedRiders = useMemo(() => {
    return [...filteredRiders].sort((a, b) => {
      let comparison = 0;
      const dir = sortDirection === "asc" ? 1 : -1;

      switch (sortField) {
        case "name":
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
          break;
        case "riderId":
          comparison = a.riderId.localeCompare(b.riderId);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "kycStatus":
          comparison = a.kycStatus.localeCompare(b.kycStatus);
          break;
        case "dailyPaymentAmount":
          comparison = a.dailyPaymentAmount - b.dailyPaymentAmount;
          break;
        case "repaymentRate":
          comparison = a.repaymentRate - b.repaymentRate;
          break;
        case "paymentStreak":
          comparison = a.paymentStreak - b.paymentStreak;
          break;
        case "hmoEnrolled":
          comparison = Number(a.hmoEnrolled) - Number(b.hmoEnrolled);
          break;
        case "unpaidDays":
          comparison = a.unpaidDays - b.unpaidDays;
          break;
      }

      return comparison * dir;
    });
  }, [filteredRiders, sortField, sortDirection]);

  // ---------------------------------------------------------------------------
  // Derived Data: Pagination
  // ---------------------------------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(sortedRiders.length / RIDERS_PER_PAGE));
  const paginatedRiders = sortedRiders.slice(
    (currentPage - 1) * RIDERS_PER_PAGE,
    currentPage * RIDERS_PER_PAGE
  );
  const paginationStart = (currentPage - 1) * RIDERS_PER_PAGE + 1;
  const paginationEnd = Math.min(
    currentPage * RIDERS_PER_PAGE,
    sortedRiders.length
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const handleKycFilterChange = (value: string) => {
    setKycFilter(value);
    setCurrentPage(1);
  };

  // ---------------------------------------------------------------------------
  // Derived Data: Stats
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = mockRiders.length;
    const active = mockRiders.filter((r) => r.status === RiderStatus.ACTIVE).length;
    const suspended = mockRiders.filter(
      (r) => r.status === RiderStatus.SUSPENDED
    ).length;
    const pending = mockRiders.filter(
      (r) => r.status === RiderStatus.PENDING_ONBOARDING
    ).length;
    const avgRepayment =
      mockRiders.reduce((sum, r) => sum + r.repaymentRate, 0) / total;

    return { total, active, suspended, pending, avgRepayment };
  }, []);

  // ---------------------------------------------------------------------------
  // Sort Handler
  // ---------------------------------------------------------------------------
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ---------------------------------------------------------------------------
  // Row Click Handler (open detail dialog)
  // ---------------------------------------------------------------------------
  const handleRowClick = (rider: Rider) => {
    setSelectedRider(rider);
    setIsDetailOpen(true);
  };

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* STATS SUMMARY CARDS                                                 */}
      {/* ================================================================== */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Total Riders */}
        <motion.div variants={fadeUp}>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Bike className="size-5 text-foreground/80" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Riders
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {stats.total.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Riders */}
        <motion.div variants={fadeUp}>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <CheckCircle className="size-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Active Riders
                </p>
                <p className="text-xl font-bold tabular-nums text-emerald-700">
                  {stats.active.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Suspended Riders */}
        <motion.div variants={fadeUp}>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20">
                <Ban className="size-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Suspended
                </p>
                <p className="text-xl font-bold tabular-nums text-red-700">
                  {stats.suspended.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Onboarding */}
        <motion.div variants={fadeUp}>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-xl font-bold tabular-nums text-amber-700">
                  {stats.pending.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Repayment Rate */}
        <motion.div variants={fadeUp}>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                <TrendingUp className="size-5 text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Avg Repayment
                </p>
                <p className="text-xl font-bold tabular-nums text-violet-700">
                  {stats.avgRepayment.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ================================================================== */}
      {/* FILTER BAR + ADD RIDER BUTTON                                       */}
      {/* ================================================================== */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Add Rider Button */}
        <Button className="h-9 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shrink-0" onClick={() => setShowAddDialog(true)}>
          <Plus className="size-4" />
          Add Rider
        </Button>
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, rider ID, email, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="h-9 w-full sm:w-[160px]">
            <Filter className="mr-1 size-3.5 text-muted-foreground" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={RiderStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={RiderStatus.INACTIVE}>Inactive</SelectItem>
            <SelectItem value={RiderStatus.SUSPENDED}>Suspended</SelectItem>
            <SelectItem value={RiderStatus.PENDING_ONBOARDING}>
              Pending
            </SelectItem>
          </SelectContent>
        </Select>

        {/* KYC Filter */}
        <Select value={kycFilter} onValueChange={handleKycFilterChange}>
          <SelectTrigger className="h-9 w-full sm:w-[160px]">
            <Shield className="mr-1 size-3.5 text-muted-foreground" />
            <SelectValue placeholder="All KYC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC</SelectItem>
            <SelectItem value={KycStatus.VERIFIED}>Verified</SelectItem>
            <SelectItem value={KycStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={KycStatus.IN_REVIEW}>In Review</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* ================================================================== */}
      {/* RIDERS DATA TABLE                                                   */}
      {/* ================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {/* Horizontal scroll wrapper for mobile */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    {/* Rider (Name + Avatar + ID) */}
                    <TableHead
                      className="cursor-pointer select-none py-3 pl-4"
                      onClick={() => handleSort("name")}
                    >
                      <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide">
                        Rider
                        <SortIndicator field="name" currentField={sortField} direction={sortDirection} />
                      </span>
                    </TableHead>

                    {/* Status */}
                    <TableHead
                      className="cursor-pointer select-none py-3"
                      onClick={() => handleSort("status")}
                    >
                      <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide">
                        Status
                        <SortIndicator field="status" currentField={sortField} direction={sortDirection} />
                      </span>
                    </TableHead>

                    {/* KYC */}
                    <TableHead
                      className="cursor-pointer select-none py-3"
                      onClick={() => handleSort("kycStatus")}
                    >
                      <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide">
                        KYC
                        <SortIndicator field="kycStatus" currentField={sortField} direction={sortDirection} />
                      </span>
                    </TableHead>

                    {/* Daily Payment */}
                    <TableHead
                      className="cursor-pointer select-none py-3 text-right"
                      onClick={() => handleSort("dailyPaymentAmount")}
                    >
                      <span className="inline-flex items-center justify-end text-xs font-semibold uppercase tracking-wide">
                        Daily Payment
                        <SortIndicator field="dailyPaymentAmount" currentField={sortField} direction={sortDirection} />
                      </span>
                    </TableHead>

                    {/* Repayment Rate */}
                    <TableHead
                      className="cursor-pointer select-none py-3 text-right"
                      onClick={() => handleSort("repaymentRate")}
                    >
                      <span className="inline-flex items-center justify-end text-xs font-semibold uppercase tracking-wide">
                        Repayment
                        <SortIndicator field="repaymentRate" currentField={sortField} direction={sortDirection} />
                      </span>
                    </TableHead>

                    {/* Streak */}
                    <TableHead
                      className="cursor-pointer select-none py-3 text-right"
                      onClick={() => handleSort("paymentStreak")}
                    >
                      <span className="inline-flex items-center justify-end text-xs font-semibold uppercase tracking-wide">
                        Streak
                        <SortIndicator field="paymentStreak" currentField={sortField} direction={sortDirection} />
                      </span>
                    </TableHead>

                    {/* HMO */}
                    <TableHead className="py-3 text-center">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        HMO
                      </span>
                    </TableHead>

                    {/* Unpaid Days */}
                    <TableHead className="py-3 text-center">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Unpaid Days
                      </span>
                    </TableHead>

                    {/* Actions */}
                    <TableHead className="py-3 pr-4 text-right">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Actions
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedRiders.length > 0 ? (
                    paginatedRiders.map((rider, index) => {
                      const statusStyle = STATUS_BADGE_STYLES[rider.status];
                      const kycStyle = KYC_BADGE_STYLES[rider.kycStatus];
                      const StatusIcon = statusStyle.icon;

                      return (
                        <motion.tr
                          key={rider.id}
                          className="group cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/40"
                          onClick={() => handleRowClick(rider)}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.35 + index * 0.03,
                            duration: 0.25,
                          }}
                        >
                          {/* Rider Name + Avatar + ID */}
                          <TableCell className="py-3 pl-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 shrink-0 ring-1 ring-border">
                                <AvatarImage src={rider.avatarUrl} alt={`${rider.firstName} ${rider.lastName}`} className="object-cover" />
                                <AvatarFallback className="bg-muted text-xs font-semibold text-foreground/70">
                                  {getInitials(rider)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {rider.firstName} {rider.lastName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {rider.riderId}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell className="py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1 text-[11px] font-medium px-2 py-0.5",
                                statusStyle.className
                              )}
                            >
                              <StatusIcon className="size-3" />
                              {statusStyle.label}
                            </Badge>
                          </TableCell>

                          {/* KYC Badge */}
                          <TableCell className="py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] font-medium px-2 py-0.5",
                                kycStyle.className
                              )}
                            >
                              {kycStyle.label}
                            </Badge>
                          </TableCell>

                          {/* Daily Payment */}
                          <TableCell className="py-3 text-right">
                            <span className="text-sm font-medium tabular-nums">
                              {formatCurrency(rider.dailyPaymentAmount)}
                            </span>
                          </TableCell>

                          {/* Repayment Rate */}
                          <TableCell className="py-3 text-right">
                            <span
                              className={cn(
                                "text-sm font-semibold tabular-nums",
                                rider.repaymentRate >= 90
                                  ? "text-emerald-600"
                                  : rider.repaymentRate >= 70
                                    ? "text-amber-600"
                                    : "text-red-600"
                              )}
                            >
                              {rider.repaymentRate.toFixed(1)}%
                            </span>
                          </TableCell>

                          {/* Payment Streak */}
                          <TableCell className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {rider.paymentStreak > 6 && (
                                <span className="text-sm" title="Hot streak!">
                                  🔥
                                </span>
                              )}
                              <span className="text-sm font-medium tabular-nums">
                                {rider.paymentStreak}d
                              </span>
                            </div>
                          </TableCell>

                          {/* HMO Status */}
                          <TableCell className="py-3 text-center">
                            {rider.hmoEnrolled ? (
                              <Heart className="inline size-4 text-rose-500 fill-rose-500" />
                            ) : (
                              <Heart className="inline size-4 text-muted-foreground/30" />
                            )}
                          </TableCell>

                          {/* Unpaid Days */}
                          <TableCell className="py-3 text-center">
                            {(() => {
                              const badge = getUnpaidDayBadge(rider.unpaidDays, rider.unpaidDayAction);
                              const IconComp = getUnpaidDayIcon(rider.unpaidDays);
                              return (
                                <Badge
                                  variant="outline"
                                  className={cn("gap-1 text-[10px] font-medium px-1.5 py-0.5 whitespace-nowrap", badge.className)}
                                >
                                  <IconComp className="size-3" />
                                  {badge.label}
                                </Badge>
                              );
                            })()}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-3 pr-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(rider);
                              }}
                            >
                              <Eye className="size-4 text-muted-foreground" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  ) : (
                    /* Empty state */
                    <TableRow>
                      <TableCell colSpan={9} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Bike className="size-8 opacity-30" />
                          <p className="text-sm font-medium">No riders found</p>
                          <p className="text-xs">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredRiders.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                {/* Showing text */}
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {paginationStart}-{paginationEnd}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {filteredRiders.length}
                  </span>{" "}
                  riders
                </p>

                {/* Pagination controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2 text-xs"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-3.5" />
                    Previous
                  </Button>

                  {/* Page number buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        className="size-8 p-0 text-xs"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2 text-xs"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ================================================================== */}
      {/* RIDER DETAIL DIALOG                                                 */}
      {/* ================================================================== */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-xl lg:max-w-2xl">
          {selectedRider && (
            <RiderDetailDialog rider={selectedRider} />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Rider Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Rider</DialogTitle>
            <p className="text-sm text-muted-foreground">Create a new rider account on the platform.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="e.g. Chukwuemeka" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="e.g. Okonkwo" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="rider@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+234 801 234 5678" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyPayment">Daily Payment (₦)</Label>
                <Input id="dailyPayment" type="number" placeholder="3500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fleetManager">Fleet Manager</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Assign manager" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fm-001">Tunde Bakare (FM-001)</SelectItem>
                    <SelectItem value="fm-002">Ngozi Anyawu (FM-002)</SelectItem>
                    <SelectItem value="fm-003">Samuel Ogundimu (FM-003)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddDialog(false)}>Create Rider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// RIDER DETAIL DIALOG SUB-COMPONENT
// ============================================================================

/**
 * RiderDetailDialog — Renders the full rider profile inside the detail dialog.
 *
 * Displays comprehensive rider information organized into sections:
 * - **Header**: Name, ID, status badge, KYC badge
 * - **Personal Info**: Email, phone, registration date
 * - **Financial**: Daily payment, total paid, account balance, repayment progress
 * - **Unpaid Days & Escalation**: Consecutive unpaid days with escalation timeline
 * - **Performance**: Payment streak (with fire emoji for hot streaks), ownership progress
 * - **Health**: HMO enrollment status
 * - **Location**: Last known GPS coordinates
 * - **Actions**: Admin action buttons (suspend, activate, view profile)
 *
 * @param props - Component props
 * @param props.rider - The rider data to display
 * @returns The rendered rider detail dialog content
 */
function RiderDetailDialog({ rider }: { rider: Rider }) {
  const statusStyle = STATUS_BADGE_STYLES[rider.status];
  const kycStyle = KYC_BADGE_STYLES[rider.kycStatus];
  const StatusIcon = statusStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex max-h-[80vh] flex-col overflow-hidden"
    >
      {/* ============================================================ */}
      {/* HEADER — Fixed at top, doesn't scroll                        */}
      {/* ============================================================ */}
      <div className="shrink-0 border-b bg-muted/30 px-6 py-5">
        <div className="flex items-start gap-4">
          <Avatar className="size-14 shrink-0">
            <AvatarImage src={rider.avatarUrl} alt={`${rider.firstName} ${rider.lastName}`} className="object-cover" />
            <AvatarFallback className="bg-muted text-base font-semibold text-foreground/80">
              {getInitials(rider)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <DialogHeader className="p-0">
              <DialogTitle className="text-lg leading-tight">
                {rider.firstName} {rider.lastName}
              </DialogTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {rider.riderId}
              </p>
            </DialogHeader>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 text-[11px] font-medium px-2 py-0.5",
                  statusStyle.className
                )}
              >
                <StatusIcon className="size-3" />
                {statusStyle.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 text-[11px] font-medium px-2 py-0.5",
                  kycStyle.className
                )}
              >
                <Shield className="size-3" />
                {kycStyle.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCROLLABLE CONTENT — All sections below the header           */}
      {/* ============================================================ */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-5 px-6 py-5">

          {/* PERSONAL INFORMATION */}
          <DetailSection title="Personal Information" icon={CreditCard}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailField
                label="Email"
                value={rider.email}
                className="font-mono text-xs break-all"
              />
              <DetailField label="Phone" value={rider.phone} />
              <DetailField
                label="Registered"
                value={format(new Date(rider.createdAt), "MMM d, yyyy")}
              />
              <DetailField
                label="Last Active"
                value={format(new Date(rider.lastActiveAt), "MMM d, yyyy 'at' h:mm a")}
              />
            </div>
          </DetailSection>

          <Separator />

          {/* FINANCIAL INFORMATION */}
          <DetailSection title="Financial" icon={CreditCard}>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">Daily Payment</p>
                <p className="mt-1 text-sm font-bold tabular-nums">
                  {formatCurrency(rider.dailyPaymentAmount)}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">Total Paid</p>
                <p className="mt-1 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(rider.totalPaidToDate)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">Account Balance</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-bold tabular-nums",
                    rider.accountBalance < 0
                      ? "text-red-600"
                      : rider.accountBalance > 0
                        ? "text-emerald-600"
                        : "text-foreground"
                  )}
                >
                  {formatCurrency(rider.accountBalance)}
                </p>
              </div>
            </div>

            {/* Repayment Rate Progress Bar */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Repayment Rate
                </p>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    rider.repaymentRate >= 90
                      ? "text-emerald-600"
                      : rider.repaymentRate >= 70
                        ? "text-amber-600"
                        : "text-red-600"
                  )}
                >
                  {rider.repaymentRate.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getRepaymentRateColor(rider.repaymentRate)
                  )}
                  style={{ width: `${Math.min(rider.repaymentRate, 100)}%` }}
                />
              </div>
            </div>
          </DetailSection>

          <Separator />

          {/* UNPAID DAYS & ESCALATION */}
          <DetailSection title="Unpaid Days & Escalation" icon={AlertTriangle}>
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Consecutive Unpaid Days
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 text-xs font-medium px-2 py-0.5",
                    rider.unpaidDays === 0
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : rider.unpaidDays >= 4
                        ? "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 font-semibold"
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                  )}
                >
                  {rider.unpaidDays === 0 ? "✓ Clear" : `${rider.unpaidDays} Day${rider.unpaidDays > 1 ? "s" : ""}`}
                </Badge>
              </div>
              {/* Escalation Timeline */}
              <div className="space-y-2.5">
                {[
                  { day: 1, label: "SMS Warning", desc: "Automated SMS sent to rider", active: rider.unpaidDays >= 1 },
                  { day: 2, label: "Fleet Manager Call", desc: "FM calls rider directly", active: rider.unpaidDays >= 2 },
                  { day: 3, label: "Final Warning", desc: "Marked as final warning", active: rider.unpaidDays >= 3 },
                  { day: 4, label: "Suspension", desc: "Account suspended automatically", active: rider.unpaidDays >= 4 },
                  { day: 5, label: "Bike Retrieval", desc: "FM retrieves bike from rider", active: rider.unpaidDays >= 5 },
                ].map((step) => (
                  <div key={step.day} className="flex items-center gap-3">
                    <div className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      step.active
                        ? rider.unpaidDays >= 4
                          ? "bg-red-500 text-white"
                          : "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground",
                    )}>
                      {step.active ? "!" : step.day}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-xs font-medium",
                        step.active ? "text-foreground" : "text-muted-foreground",
                      )}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DetailSection>

          <Separator />

          {/* PERFORMANCE */}
          <DetailSection title="Performance" icon={TrendingUp}>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">Payment Streak</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <p className="text-sm font-bold tabular-nums">
                    {rider.paymentStreak} days
                  </p>
                  {rider.paymentStreak > 6 && (
                    <span className="text-sm" title="Hot streak!">🔥</span>
                  )}
                  {rider.paymentStreak > 30 && (
                    <span className="text-sm" title="Legendary streak!">⚡</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Ownership Progress
                </p>
                <p className="mt-1 text-sm font-bold tabular-nums">
                  {rider.ownershipProgressMonths} / 24 months
                </p>
              </div>
            </div>

            {/* Ownership Progress Bar */}
            <div className="mt-4">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-500"
                  style={{
                    width: `${(rider.ownershipProgressMonths / 24) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                {((rider.ownershipProgressMonths / 24) * 100).toFixed(0)}% complete
              </p>
            </div>
          </DetailSection>

          <Separator />

          {/* HEALTH */}
          <DetailSection title="Health" icon={Heart}>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              {rider.hmoEnrolled ? (
                <>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20">
                    <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      HMO Enrolled
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Health insurance coverage is active
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/50">
                    <XCircle className="size-4 text-muted-foreground/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      Not Enrolled
                    </p>
                    <p className="text-xs text-muted-foreground">
                      HMO enrollment is not active for this rider
                    </p>
                  </div>
                </>
              )}
            </div>
          </DetailSection>

          <Separator />

          {/* LOCATION */}
          <DetailSection title="Location" icon={MapPin}>
            <div className={cn(
              "flex items-center gap-3 rounded-lg border border-border p-3",
              !rider.lastKnownLocation && "opacity-60"
            )}>
              <div className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                rider.lastKnownLocation
                  ? "bg-emerald-50 dark:bg-emerald-950/20"
                  : "bg-muted/50"
              )}>
                <MapPin className={cn(
                  "size-4",
                  rider.lastKnownLocation
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground/70"
                )} />
              </div>
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  rider.lastKnownLocation
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}>
                  {rider.lastKnownLocation ? "Location Available" : "Not Available"}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {rider.lastKnownLocation
                    ? `${rider.lastKnownLocation.latitude.toFixed(4)}, ${rider.lastKnownLocation.longitude.toFixed(4)}`
                    : "No GPS location data on record"
                  }
                </p>
              </div>
            </div>
          </DetailSection>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {rider.status === RiderStatus.ACTIVE ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                <Ban className="size-3.5" />
                Suspend Rider
              </Button>
            ) : rider.status === RiderStatus.SUSPENDED ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <CheckCircle className="size-3.5" />
                Activate Rider
              </Button>
            ) : null}

            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="size-3.5" />
              View Full Profile
            </Button>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

// ============================================================================
// DETAIL DIALOG HELPER SUB-COMPONENTS
// ============================================================================

/**
 * DetailSection — Renders a labeled section within the rider detail dialog.
 *
 * @param props - Component props
 * @param props.title - Section heading text
 * @param props.icon - Lucide icon element to display next to the title
 * @param props.children - Section content
 * @returns Rendered section with title, icon, and children
 */
function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/60">
          <Icon className="size-3 text-muted-foreground" />
        </div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

/**
 * DetailField — Renders a stacked label-over-value field for the rider detail sections.
 * Uses a vertical layout (label on top, value below) for better readability in grids.
 *
 * @param props - Component props
 * @param props.label - The label text
 * @param props.value - The value to display
 * @param props.className - Optional additional class for the value element
 * @returns Rendered label-value pair
 */
function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium", className)}>
        {value}
      </p>
    </div>
  );
}
