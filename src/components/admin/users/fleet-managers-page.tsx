"use client";

/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Fleet Managers Page Component
 * ============================================================================
 *
 * Displays a comprehensive overview of all fleet managers in the Kowa Ride
 * ecosystem. Features include performance tier visualization, portfolio
 * statistics, search/filtering, and expandable detail cards.
 *
 * @module components/admin/users/fleet-managers-page
 * @version 1.0.0
 * @see FleetManager - Type definition for fleet manager data
 * @see PerformanceTier - Enum for manager tier classification
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bike,
  UserCheck,
  Percent,
  Zap,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { mockFleetManagers } from "@/lib/mock-data";
import { FleetManager, PerformanceTier } from "@/types/admin";

import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

/** Configuration mapping for performance tier visual styling */
const TIER_STYLES: Record<
  PerformanceTier,
  { badge: string; dot: string; label: string; ring: string }
> = {
  [PerformanceTier.PLATINUM]: {
    badge: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-transparent",
    dot: "bg-emerald-500",
    label: "Platinum",
    ring: "ring-emerald-400/30",
  },
  [PerformanceTier.GOLD]: {
    badge: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
    label: "Gold",
    ring: "ring-amber-400/30",
  },
  [PerformanceTier.SILVER]: {
    badge: "bg-muted text-foreground/80 border-border",
    dot: "bg-muted-foreground/50",
    label: "Silver",
    ring: "ring-slate-400/30",
  },
  [PerformanceTier.BRONZE]: {
    badge: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800",
    dot: "bg-orange-500",
    label: "Bronze",
    ring: "ring-orange-400/30",
  },
  [PerformanceTier.PROBATION]: {
    badge: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800",
    dot: "bg-red-500",
    label: "Probation",
    ring: "ring-red-400/30",
  },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/** Staggered container animation for card grid */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/** Individual card fade-in animation */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a number as Nigerian Naira currency string.
 * @param amount - The numeric amount to format
 * @returns Formatted string like "₦1,234,567"
 */
function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

/**
 * Returns the initials from a person's first and last name.
 * @param firstName - The person's first name
 * @param lastName - The person's last name
 * @returns Two-letter uppercase initials string
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Returns the appropriate color for a performance score.
 * @param score - Performance score from 0-100
 * @returns Tailwind color class string
 */
function getScoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  if (score >= 55) return "text-orange-600";
  return "text-red-600";
}

/**
 * Returns the appropriate Progress bar class for a performance score.
 * @param score - Performance score from 0-100
 * @returns Tailwind class string for the progress indicator
 */
function getProgressColor(score: number): string {
  if (score >= 85) return "[&>div]:bg-emerald-500";
  if (score >= 70) return "[&>div]:bg-amber-500";
  if (score >= 55) return "[&>div]:bg-orange-500";
  return "[&>div]:bg-red-500";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FleetManagersPage - Displays all fleet managers with performance metrics,
 * tier badges, and portfolio statistics for the superadmin dashboard.
 *
 * Features:
 * - Summary statistics row (total managers, avg performance, avg utilization, probation count)
 * - Filterable and searchable manager cards in a responsive grid
 * - Performance tier badges with distinctive color coding
 * - Expandable cards showing detailed portfolio metrics
 * - Staggered entrance animations with framer-motion
 *
 * @returns The rendered FleetManagersPage component
 *
 * @example
 * ```tsx
 * <FleetManagersPage />
 * ```
 */
export function FleetManagersPage() {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------

  /** Filtered list of managers based on search query and tier selection */
  const filteredManagers = useMemo(() => {
    return mockFleetManagers.filter((manager) => {
      // Search filter: match against name, email, phone, or manager ID
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(query) ||
        manager.email.toLowerCase().includes(query) ||
        manager.managerId.toLowerCase().includes(query) ||
        manager.phone.includes(query);

      // Tier filter: show all or match specific tier
      const matchesTier =
        tierFilter === "ALL" || manager.tier === tierFilter;

      return matchesSearch && matchesTier;
    });
  }, [searchQuery, tierFilter]);

  /** Aggregate statistics computed from all managers */
  const stats = useMemo(() => {
    const total = mockFleetManagers.length;
    const avgPerformance =
      mockFleetManagers.reduce((sum, m) => sum + m.performanceScore, 0) / total;
    const avgUtilization =
      mockFleetManagers.reduce((sum, m) => sum + m.utilizationRate, 0) / total;
    const onProbation = mockFleetManagers.filter(
      (m) => m.tier === PerformanceTier.PROBATION
    ).length;

    return {
      total,
      avgPerformance: avgPerformance.toFixed(1),
      avgUtilization: avgUtilization.toFixed(1),
      onProbation,
    };
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Fleet Managers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor performance, manage tiers, and oversee portfolio health across all fleet managers.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {/* Total Managers */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Users className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Managers</p>
                <p className="text-lg font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          {/* Avg Performance Score */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg Performance</p>
                <p className="text-lg font-bold text-foreground">{stats.avgPerformance}</p>
              </div>
            </CardContent>
          </Card>

          {/* Avg Utilization */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Activity className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg Utilization</p>
                <p className="text-lg font-bold text-foreground">{stats.avgUtilization}%</p>
              </div>
            </CardContent>
          </Card>

          {/* On Probation */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                stats.onProbation > 0 ? "bg-red-50" : "bg-muted/30"
              )}>
                <AlertTriangle className={cn(
                  "size-5",
                  stats.onProbation > 0 ? "text-red-600" : "text-muted-foreground/70"
                )} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">On Probation</p>
                <p className={cn(
                  "text-lg font-bold",
                  stats.onProbation > 0 ? "text-red-600" : "text-foreground"
                )}>
                  {stats.onProbation}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {/* Add Fleet Manager Button */}
          <Button className="h-9 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shrink-0" onClick={() => setShowAddDialog(true)}>
            <Plus className="size-4" />
            Add Fleet Manager
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Search by name, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value={PerformanceTier.PLATINUM}>Platinum</SelectItem>
              <SelectItem value={PerformanceTier.GOLD}>Gold</SelectItem>
              <SelectItem value={PerformanceTier.SILVER}>Silver</SelectItem>
              <SelectItem value={PerformanceTier.BRONZE}>Bronze</SelectItem>
              <SelectItem value={PerformanceTier.PROBATION}>Probation</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-sm text-muted-foreground"
        >
          Showing {filteredManagers.length} of {mockFleetManagers.length} managers
        </motion.p>

        {/* Managers Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredManagers.map((manager) => (
              <FleetManagerCard
                key={manager.id}
                manager={manager}
                isExpanded={expandedId === manager.id}
                onToggle={() =>
                  setExpandedId(expandedId === manager.id ? null : manager.id)
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredManagers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <Search className="mb-4 size-10 text-muted-foreground/30" />
            <p className="text-base font-medium text-muted-foreground">No managers found</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>

      {/* Add Fleet Manager Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Fleet Manager</DialogTitle>
            <p className="text-sm text-muted-foreground">Create a new fleet manager account on the platform.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="e.g. Tunde" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="e.g. Bakare" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="manager@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+234 801 234 5678" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier">Performance Tier</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyFee">Monthly Fee (₦)</Label>
                <Input id="monthlyFee" type="number" placeholder="150000" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddDialog(false)}>Create Manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// FLEET MANAGER CARD SUB-COMPONENT
// ============================================================================

/**
 * Props for the FleetManagerCard component.
 * @interface FleetManagerCardProps
 */
interface FleetManagerCardProps {
  /** The fleet manager data to display */
  manager: FleetManager;
  /** Whether this card is in the expanded state */
  isExpanded: boolean;
  /** Callback invoked when the card expand/collapse is toggled */
  onToggle: () => void;
}

/**
 * FleetManagerCard - Renders an individual fleet manager as an interactive card
 * with performance metrics, tier badge, and expandable detail section.
 *
 * Shows a summary view with tier badge, performance score bar, and key portfolio
 * metrics. Clicking the card expands it to reveal detailed information including
 * contact details, fee structure, and incident history.
 *
 * @param props - FleetManagerCardProps containing manager data and interaction handlers
 * @returns The rendered FleetManagerCard component
 */
function FleetManagerCard({
  manager,
  isExpanded,
  onToggle,
}: FleetManagerCardProps) {
  const tierStyle = TIER_STYLES[manager.tier];

  return (
    <motion.div
      variants={cardVariants}
      layout
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          "cursor-pointer py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isExpanded && "ring-2 " + tierStyle.ring
        )}
        onClick={onToggle}
      >
        <CardContent className="p-0">
          {/* Card Header: Avatar, Name, ID, Tier */}
          <div className="flex items-start gap-3 p-4 pb-3">
            <Avatar className="size-11 shrink-0">
              <AvatarFallback
                className={cn(
                  "text-sm font-semibold",
                  manager.tier === PerformanceTier.PLATINUM &&
                    "bg-gradient-to-br from-emerald-400 to-teal-500 text-white",
                  manager.tier === PerformanceTier.GOLD &&
                    "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
                  manager.tier === PerformanceTier.SILVER &&
                    "bg-muted text-foreground/80",
                  manager.tier === PerformanceTier.BRONZE &&
                    "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
                  manager.tier === PerformanceTier.PROBATION &&
                    "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                )}
              >
                {getInitials(manager.firstName, manager.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {manager.firstName} {manager.lastName}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn("inline-block size-2 rounded-full", tierStyle.dot)}
                  />
                  <Badge className={cn("text-[10px] font-semibold", tierStyle.badge)}>
                    {tierStyle.label}
                  </Badge>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{manager.managerId}</p>
            </div>
          </div>

          {/* Performance Score Bar */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Performance</span>
              <span
                className={cn(
                  "text-xs font-bold",
                  getScoreColor(manager.performanceScore)
                )}
              >
                {manager.performanceScore}/100
              </span>
            </div>
            <Progress
              value={manager.performanceScore}
              className={cn("h-1.5", getProgressColor(manager.performanceScore))}
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 px-4 pb-3">
            <StatPill
              icon={<Bike className="size-3.5" />}
              label="Bikes"
              value={manager.totalBikesAssigned.toString()}
            />
            <StatPill
              icon={<UserCheck className="size-3.5" />}
              label="Active"
              value={manager.activeRiders.toString()}
            />
            <StatPill
              icon={<Percent className="size-3.5" />}
              label="Repayment"
              value={`${manager.portfolioRepaymentRate}%`}
            />
            <StatPill
              icon={<Activity className="size-3.5" />}
              label="Utilization"
              value={`${manager.utilizationRate}%`}
            />
          </div>

          {/* Footer: Monthly Fee, Incidents, Expand */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs font-semibold text-foreground/80">
              {formatNaira(manager.monthlyFee)}
              <span className="ml-1 font-normal text-muted-foreground/70">/mo</span>
            </span>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  manager.incidentCount30d > 5
                    ? "text-red-600"
                    : "text-muted-foreground"
                )}
              >
                <AlertTriangle
                  className={cn(
                    "size-3",
                    manager.incidentCount30d > 5 && "fill-red-500"
                  )}
                />
                {manager.incidentCount30d} incidents
              </span>
              {isExpanded ? (
                <ChevronUp className="size-4 text-muted-foreground/70" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground/70" />
              )}
            </div>
          </div>

          {/* Expanded Detail Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <Separator />
                <div className="space-y-4 bg-muted/30 p-4">
                  {/* Contact Information */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Contact
                    </h4>
                    <div className="space-y-1.5">
                      <DetailRow label="Email" value={manager.email} />
                      <DetailRow label="Phone" value={manager.phone} />
                    </div>
                  </div>

                  {/* Portfolio Performance */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Portfolio Performance
                    </h4>
                    <div className="space-y-2.5">
                      {/* Repayment Rate */}
                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-xs text-muted-foreground">Repayment Rate</span>
                          <span className={cn(
                            "text-xs font-semibold",
                            manager.portfolioRepaymentRate >= 85
                              ? "text-emerald-600"
                              : manager.portfolioRepaymentRate >= 70
                                ? "text-amber-600"
                                : "text-red-600"
                          )}>
                            {manager.portfolioRepaymentRate}%
                          </span>
                        </div>
                        <Progress
                          value={manager.portfolioRepaymentRate}
                          className={cn(
                            "h-1.5",
                            manager.portfolioRepaymentRate >= 85
                              ? "[&>div]:bg-emerald-500"
                              : manager.portfolioRepaymentRate >= 70
                                ? "[&>div]:bg-amber-500"
                                : "[&>div]:bg-red-500"
                          )}
                        />
                      </div>

                      {/* Utilization Rate */}
                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-xs text-muted-foreground">Utilization Rate</span>
                          <span className={cn(
                            "text-xs font-semibold",
                            manager.utilizationRate >= 85
                              ? "text-emerald-600"
                              : manager.utilizationRate >= 70
                                ? "text-amber-600"
                                : "text-orange-600"
                          )}>
                            {manager.utilizationRate}%
                          </span>
                        </div>
                        <Progress
                          value={manager.utilizationRate}
                          className={cn(
                            "h-1.5",
                            manager.utilizationRate >= 85
                              ? "[&>div]:bg-emerald-500"
                              : manager.utilizationRate >= 70
                                ? "[&>div]:bg-amber-500"
                                : "[&>div]:bg-orange-500"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operations Summary */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Operations
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Bike className="size-3.5 text-muted-foreground/70" />
                          <span className="text-[11px] text-muted-foreground">Bikes Assigned</span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {manager.totalBikesAssigned}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="size-3.5 text-muted-foreground/70" />
                          <span className="text-[11px] text-muted-foreground">Active Riders</span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {manager.activeRiders}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Zap className="size-3.5 text-muted-foreground/70" />
                          <span className="text-[11px] text-muted-foreground">Monthly Fee</span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {formatNaira(manager.monthlyFee)}
                        </p>
                      </div>
                      <div className={cn(
                        "rounded-lg border p-2.5",
                        manager.incidentCount30d > 5
                          ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                          : "border-border bg-card"
                      )}>
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle
                            className={cn(
                              "size-3.5",
                              manager.incidentCount30d > 5
                                ? "text-red-500"
                                : "text-muted-foreground/70"
                            )}
                          />
                          <span className="text-[11px] text-muted-foreground">
                            Incidents (30d)
                          </span>
                        </div>
                        <p className={cn(
                          "mt-1 text-sm font-bold",
                          manager.incidentCount30d > 5
                            ? "text-red-600"
                            : "text-foreground"
                        )}>
                          {manager.incidentCount30d}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 text-xs hover:bg-emerald-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// SMALL UTILITY SUB-COMPONENTS
// ============================================================================

/**
 * Props for the StatPill sub-component.
 * @interface StatPillProps
 */
interface StatPillProps {
  /** Lucide icon element to display */
  icon: React.ReactNode;
  /** Short label for the stat */
  label: string;
  /** The value to display */
  value: string;
}

/**
 * StatPill - A compact inline statistic display used within the manager card.
 * Shows a small icon with label and value for quick reference.
 *
 * @param props - StatPillProps
 * @returns A small stat pill element
 */
function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
      <span className="text-muted-foreground/70">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] leading-none text-muted-foreground/70">{label}</p>
        <p className="text-xs font-semibold text-foreground/80">{value}</p>
      </div>
    </div>
  );
}

/**
 * Props for the DetailRow sub-component.
 * @interface DetailRowProps
 */
interface DetailRowProps {
  /** The label text */
  label: string;
  /** The value text */
  value: string;
}

/**
 * DetailRow - Renders a simple label-value row used in expanded card sections.
 *
 * @param props - DetailRowProps
 * @returns A horizontal detail row with label and value
 */
function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground/80">{value}</span>
    </div>
  );
}
