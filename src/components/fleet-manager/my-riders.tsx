/**
 * ============================================================================
 * KOWA RIDE - FLEET MANAGER DASHBOARD
 * My Riders Page Component
 * ============================================================================
 *
 * Fleet Manager's dedicated riders view. Shows ONLY riders under this FM's
 * management with search/filter, status tracking, payment overview, and
 * escalation indicators.
 *
 * @module components/fleet-manager/my-riders
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  Eye,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  mockRiders,
  mockBikes,
} from "@/lib/mock-data";
import { RiderStatus, UnpaidDayAction } from "@/types/admin";

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as const;

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

const fadeInChart = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

function getStatusColor(status: RiderStatus): string {
  switch (status) {
    case RiderStatus.ACTIVE:
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    case RiderStatus.SUSPENDED:
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case RiderStatus.INACTIVE:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400";
    case RiderStatus.PENDING_ONBOARDING:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    case RiderStatus.TERMINATED:
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400";
  }
}

function getEscalationBadge(action: UnpaidDayAction): { label: string; color: string; icon: React.ReactNode } | null {
  switch (action) {
    case UnpaidDayAction.SMS_WARNING:
      return {
        label: "SMS Warning",
        color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        icon: <MessageSquare className="h-3 w-3" />,
      };
    case UnpaidDayAction.FM_CALL:
      return {
        label: "FM Call",
        color: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
        icon: <Phone className="h-3 w-3" />,
      };
    case UnpaidDayAction.FINAL_WARNING:
      return {
        label: "Final Warning",
        color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    case UnpaidDayAction.SUSPENDED:
      return {
        label: "Suspended",
        color: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
        icon: <XCircle className="h-3 w-3" />,
      };
    case UnpaidDayAction.BIKE_RETRIEVAL:
      return {
        label: "Bike Retrieval",
        color: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    default:
      return null;
  }
}

function getRepaymentRateColor(rate: number): string {
  if (rate >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FMMyRiders() {
  const FM_ID = "fm-001";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Filter riders for this FM
  const fmRiders = useMemo(() => {
    return mockRiders.filter((r) => r.fleetManagerId === FM_ID);
  }, []);

  // Compute summary stats
  const stats = useMemo(() => {
    const total = fmRiders.length;
    const active = fmRiders.filter((r) => r.status === RiderStatus.ACTIVE).length;
    const overdue = fmRiders.filter((r) => r.unpaidDays > 0 && r.status === RiderStatus.ACTIVE).length;
    const inactive = fmRiders.filter(
      (r) => r.status === RiderStatus.INACTIVE || r.status === RiderStatus.SUSPENDED
    ).length;
    return { total, active, overdue, inactive };
  }, [fmRiders]);

  // Filtered riders
  const filteredRiders = useMemo(() => {
    return fmRiders.filter((rider) => {
      const matchesSearch =
        searchQuery === "" ||
        `${rider.firstName} ${rider.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.riderId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rider.status === RiderStatus.ACTIVE) ||
        (statusFilter === "overdue" && rider.unpaidDays > 0 && rider.status === RiderStatus.ACTIVE) ||
        (statusFilter === "inactive" && (rider.status === RiderStatus.INACTIVE || rider.status === RiderStatus.SUSPENDED));

      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && rider.unpaidDays === 0) ||
        (paymentFilter === "unpaid" && rider.unpaidDays > 0);

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [fmRiders, searchQuery, statusFilter, paymentFilter]);

  // Get bike assignment info
  const getBikeForRider = (riderId: string) => {
    return mockBikes.find((b) => b.assignedRiderId === riderId);
  };

  const summaryCards = [
    {
      title: "Total Riders",
      value: stats.total,
      icon: Users,
      iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    },
    {
      title: "Active",
      value: stats.active,
      icon: CheckCircle2,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: Clock,
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Inactive",
      value: stats.inactive,
      icon: XCircle,
      iconBg: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
    },
  ];

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          My Riders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and monitor riders under your fleet. Track payments, statuses, and escalations.
        </p>
      </div>

      {/* Summary Stats Cards */}
      <motion.div
        className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {summaryCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <motion.div key={card.title} variants={fadeUpItem}>
              <Card className="border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", card.iconBg)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{card.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or rider ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-card border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Status
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>Overdue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive / Suspended</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Payment
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPaymentFilter("all")}>All Payments</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentFilter("paid")}>Paid (No Unpaid Days)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentFilter("unpaid")}>Unpaid Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {(statusFilter !== "all" || paymentFilter !== "all" || searchQuery !== "") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground"
              onClick={() => {
                setStatusFilter("all");
                setPaymentFilter("all");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </motion.div>

      {/* Riders Table */}
      <motion.div
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Riders Under Your Management
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                {filteredRiders.length} rider{filteredRiders.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground/70">
              Click actions to call, send SMS, or view rider details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 border-b border-border bg-muted/40 px-4 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Today&apos;s Payment</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Streak</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Repayment</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Unpaid Days</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
            </div>

            <ScrollArea className="max-h-[600px]">
              {filteredRiders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No riders found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredRiders.map((rider) => {
                    const escalation = getEscalationBadge(rider.unpaidDayAction);
                    const bike = getBikeForRider(rider.id);
                    const todayPaid = rider.unpaidDays === 0;

                    return (
                      <div
                        key={rider.id}
                        className={cn(
                          "group grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.5fr] gap-2 md:gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors",
                          rider.unpaidDays > 3 && "border-l-2 border-l-red-500 bg-red-50/20 dark:bg-red-950/10"
                        )}
                      >
                        {/* Name & ID */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                            <AvatarImage src={rider.avatarUrl} alt={`${rider.firstName} ${rider.lastName}`} />
                            <AvatarFallback className="bg-muted text-[10px] font-semibold">
                              {rider.firstName[0]}{rider.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {rider.firstName} {rider.lastName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{rider.riderId}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0", getStatusColor(rider.status))}
                          >
                            {rider.status}
                          </Badge>
                          {escalation && (
                            <Badge
                              variant="outline"
                              className={cn("text-[10px] px-1.5 py-0 gap-0.5", escalation.color)}
                            >
                              {escalation.icon}
                              {escalation.label}
                            </Badge>
                          )}
                        </div>

                        {/* Today's Payment */}
                        <div className="md:text-right">
                          <p className={cn(
                            "text-sm font-semibold",
                            todayPaid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {todayPaid ? formatNaira(rider.dailyPaymentAmount) : "₦0"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Due: {formatNaira(rider.dailyPaymentAmount)}
                          </p>
                        </div>

                        {/* Streak */}
                        <div className="md:text-center">
                          {rider.paymentStreak > 0 ? (
                            <div className="flex md:justify-center items-center gap-1">
                              <span className="text-sm font-semibold text-foreground">{rider.paymentStreak}d</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">🔥</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>

                        {/* Repayment Rate */}
                        <div className="md:text-center">
                          <span className={cn("text-sm font-semibold", getRepaymentRateColor(rider.repaymentRate))}>
                            {rider.repaymentRate}%
                          </span>
                        </div>

                        {/* Unpaid Days */}
                        <div className="md:text-center">
                          <span className={cn(
                            "text-sm font-semibold",
                            rider.unpaidDays === 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : rider.unpaidDays <= 2
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                          )}>
                            {rider.unpaidDays === 0 ? "0" : rider.unpaidDays}
                          </span>
                          {rider.unpaidDays > 0 && (
                            <p className="text-[10px] text-muted-foreground">day{rider.unpaidDays > 1 ? "s" : ""}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:justify-end items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" title="Call Rider">
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-sky-600 hover:text-sky-700" title="Send SMS">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="View Details">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
