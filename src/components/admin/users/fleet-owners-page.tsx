"use client";

/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Fleet Owners Page Component
 * ============================================================================
 *
 * Displays a comprehensive overview of all fleet owners in the Kowa Ride
 * ecosystem. Features include ROI tracking, fleet utilization metrics,
 * financial payout data, bank details, and expandable detail cards.
 *
 * @module components/admin/users/fleet-owners-page
 * @version 1.0.0
 * @see FleetOwner - Type definition for fleet owner data
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Bike,
  TrendingUp,
  Wallet,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  Landmark,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { mockFleetOwners } from "@/lib/mock-data";
import { FleetOwner } from "@/types/admin";

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
 * Masks a bank account number for security display.
 * Shows only the last 4 digits, replacing the rest with asterisks.
 *
 * @param accountNumber - The full account number string
 * @returns Masked account number like "******6789"
 *
 * @example
 * ```ts
 * maskAccountNumber("0123456789") // returns "******6789"
 * ```
 */
function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

/**
 * Returns a color class based on the ROI percentage value.
 * Higher ROI values get green shades, lower values get amber/red.
 *
 * @param roi - The ROI percentage
 * @returns Tailwind text color class string
 */
function getRoiColor(roi: number): string {
  if (roi >= 30) return "text-emerald-600";
  if (roi >= 20) return "text-amber-600";
  if (roi >= 10) return "text-orange-600";
  return "text-red-600";
}

/**
 * Returns a Progress indicator color class based on active bike ratio.
 *
 * @param ratio - The active bikes to total bikes ratio (0-100)
 * @returns Tailwind class string for the progress indicator
 */
function getActiveBikesProgressColor(ratio: number): string {
  if (ratio >= 90) return "[&>div]:bg-emerald-500";
  if (ratio >= 75) return "[&>div]:bg-amber-500";
  if (ratio >= 60) return "[&>div]:bg-orange-500";
  return "[&>div]:bg-red-500";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FleetOwnersPage - Displays all fleet owners with financial metrics,
 * ROI tracking, fleet utilization, and payout information for the superadmin dashboard.
 *
 * Features:
 * - Summary statistics row (total owners, total bikes, avg ROI, pending payouts)
 * - Searchable owner cards in a responsive grid layout
 * - ROI and earnings visualization with color-coded indicators
 * - Fleet utilization progress bars showing active vs total bikes
 * - Expandable cards with bank details and detailed financial data
 * - Staggered entrance animations with framer-motion
 *
 * @returns The rendered FleetOwnersPage component
 *
 * @example
 * ```tsx
 * <FleetOwnersPage />
 * ```
 */
export function FleetOwnersPage() {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Add Fleet Owner form state
  const [formOwnerCategory, setFormOwnerCategory] = useState("");
  const [formCategoryName, setFormCategoryName] = useState("");

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------

  /** Filtered list of owners based on search query */
  const filteredOwners = useMemo(() => {
    if (!searchQuery) return mockFleetOwners;

    const query = searchQuery.toLowerCase();
    return mockFleetOwners.filter(
      (owner) =>
        `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(query) ||
        owner.email.toLowerCase().includes(query) ||
        owner.ownerId.toLowerCase().includes(query) ||
        owner.phone.includes(query) ||
        owner.bankDetails.bankName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  /** Aggregate statistics computed from all owners */
  const stats = useMemo(() => {
    const total = mockFleetOwners.length;
    const totalBikes = mockFleetOwners.reduce((sum, o) => sum + o.totalBikes, 0);
    const avgRoi =
      mockFleetOwners.reduce((sum, o) => sum + o.totalRoi, 0) / total;
    const totalPendingPayouts = mockFleetOwners.reduce(
      (sum, o) => sum + o.pendingPayout,
      0
    );

    return {
      total,
      totalBikes,
      avgRoi: avgRoi.toFixed(1),
      totalPendingPayouts,
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
            Fleet Owners
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track fleet asset ownership, ROI performance, and manage payout processing for all fleet owners.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {/* Total Owners */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Users className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Owners</p>
                <p className="text-lg font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Bikes */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Bike className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Bikes</p>
                <p className="text-lg font-bold text-foreground">
                  {stats.totalBikes.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Average ROI */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg ROI</p>
                <p className={cn("text-lg font-bold", getRoiColor(Number(stats.avgRoi)))}>
                  {stats.avgRoi}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payouts */}
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Wallet className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pending Payouts</p>
                <p className="text-lg font-bold text-foreground">
                  {formatNaira(stats.totalPendingPayouts)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {/* Add Fleet Owner Button */}
          <Button className="h-9 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shrink-0" onClick={() => setShowAddDialog(true)}>
            <Plus className="size-4" />
            Add Fleet Owner
          </Button>
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Search by name, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-sm text-muted-foreground"
        >
          Showing {filteredOwners.length} of {mockFleetOwners.length} owners
        </motion.p>

        {/* Owners Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredOwners.map((owner) => (
              <FleetOwnerCard
                key={owner.id}
                owner={owner}
                isExpanded={expandedId === owner.id}
                onToggle={() =>
                  setExpandedId(expandedId === owner.id ? null : owner.id)
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredOwners.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
          >
            <Search className="mb-4 size-10 text-muted-foreground/30" />
            <p className="text-base font-medium text-muted-foreground">No owners found</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Try adjusting your search criteria
            </p>
          </motion.div>
        )}
      </div>

      {/* Add Fleet Owner Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setFormOwnerCategory("");
          setFormCategoryName("");
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Fleet Owner</DialogTitle>
            <p className="text-sm text-muted-foreground">Register a new fleet owner on the platform.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="e.g. Adebayo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="e.g. Ogundimu" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="owner@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+234 801 234 5678" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerCategory">Owner Category</Label>
                <Select value={formOwnerCategory} onValueChange={(val) => {
                  setFormOwnerCategory(val);
                  // Reset category name when switching away
                  if (val !== "corporate" && val !== "cooperative") {
                    setFormCategoryName("");
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate / Company</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="cooperative">Cooperative Society</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfBikes">Number of Bikes</Label>
                <Input id="numberOfBikes" type="number" placeholder="e.g. 25" min={1} />
              </div>
            </div>

            {/* Dependent: Organization / Cooperative Name field */}
            <AnimatePresence mode="wait">
              {(formOwnerCategory === "corporate" || formOwnerCategory === "cooperative") && (
                <motion.div
                  key="category-name-field"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1">
                    <Label htmlFor="categoryName">
                      {formOwnerCategory === "corporate" ? "Company / Organization Name" : "Cooperative Society Name"}
                    </Label>
                    <Input
                      id="categoryName"
                      placeholder={
                        formOwnerCategory === "corporate"
                          ? "e.g. Adeniyi Ventures Ltd"
                          : "e.g. Ikeja Bike Riders Cooperative"
                      }
                      value={formCategoryName}
                      onChange={(e) => setFormCategoryName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gtbank">GTBank</SelectItem>
                  <SelectItem value="access">Access Bank</SelectItem>
                  <SelectItem value="first-bank">First Bank</SelectItem>
                  <SelectItem value="uba">UBA</SelectItem>
                  <SelectItem value="zenith">Zenith Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" placeholder="0123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input id="accountName" placeholder="Full account name" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setFormOwnerCategory("");
              setFormCategoryName("");
            }}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              setShowAddDialog(false);
              setFormOwnerCategory("");
              setFormCategoryName("");
            }}>Create Owner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// FLEET OWNER CARD SUB-COMPONENT
// ============================================================================

/**
 * Props for the FleetOwnerCard component.
 * @interface FleetOwnerCardProps
 */
interface FleetOwnerCardProps {
  /** The fleet owner data to display */
  owner: FleetOwner;
  /** Whether this card is in the expanded state */
  isExpanded: boolean;
  /** Callback invoked when the card expand/collapse is toggled */
  onToggle: () => void;
}

/**
 * FleetOwnerCard - Renders an individual fleet owner as an interactive card
 * with ROI metrics, fleet utilization, financial data, and expandable details.
 *
 * The summary view displays owner identity, fleet bike utilization progress bar,
 * ROI indicators, and pending payout amounts. Clicking expands to reveal
 * bank details, active days tracking, and detailed earnings breakdown.
 *
 * @param props - FleetOwnerCardProps containing owner data and interaction handlers
 * @returns The rendered FleetOwnerCard component
 */
function FleetOwnerCard({
  owner,
  isExpanded,
  onToggle,
}: FleetOwnerCardProps) {
  /** Calculate the percentage of bikes that are currently active */
  const activeRatio = owner.totalBikes > 0
    ? (owner.activeBikes / owner.totalBikes) * 100
    : 0;

  return (
    <motion.div
      variants={cardVariants}
      layout
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          "cursor-pointer py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isExpanded && "ring-2 ring-emerald-400/30"
        )}
        onClick={onToggle}
      >
        <CardContent className="p-0">
          {/* Card Header: Avatar, Name, ID */}
          <div className="flex items-start gap-3 p-4 pb-3">
            <Avatar className="size-11 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-semibold text-white">
                {getInitials(owner.firstName, owner.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {owner.firstName} {owner.lastName}
                </h3>
                <Badge
                  variant="outline"
                  className="shrink-0 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  {owner.ownerId}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{owner.email}</p>
            </div>
          </div>

          {/* Fleet Stats: Active Bikes Progress */}
          <div className="px-4 pb-3">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bike className="size-3.5 text-muted-foreground/70" />
                <span className="text-xs font-medium text-muted-foreground">Fleet Status</span>
              </div>
              <span className="text-xs font-semibold text-foreground/80">
                {owner.activeBikes}/{owner.totalBikes} active
              </span>
            </div>
            <Progress
              value={activeRatio}
              className={cn("h-1.5", getActiveBikesProgressColor(activeRatio))}
            />
          </div>

          {/* Financial Quick Stats */}
          <div className="grid grid-cols-2 gap-2 px-4 pb-3">
            {/* Total ROI */}
            <div className="rounded-md bg-muted px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <BarChart3 className="size-3 text-muted-foreground/70" />
                <span className="text-[10px] text-muted-foreground/70">Total ROI</span>
              </div>
              <p className={cn("text-xs font-bold", getRoiColor(owner.totalRoi))}>
                {owner.totalRoi}%
              </p>
            </div>

            {/* Monthly ROI */}
            <div className="rounded-md bg-muted px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <TrendingUp className="size-3 text-muted-foreground/70" />
                <span className="text-[10px] text-muted-foreground/70">Monthly ROI</span>
              </div>
              <p className="text-xs font-bold text-emerald-600">
                {owner.monthlyRoi}%
              </p>
            </div>

            {/* Pending Payout */}
            <div className="rounded-md bg-muted px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <Wallet className="size-3 text-muted-foreground/70" />
                <span className="text-[10px] text-muted-foreground/70">Pending</span>
              </div>
              <p className="text-xs font-bold text-foreground/80">
                {formatNaira(owner.pendingPayout)}
              </p>
            </div>

            {/* Total Earnings */}
            <div className="rounded-md bg-muted px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <DollarSign className="size-3 text-muted-foreground/70" />
                <span className="text-[10px] text-muted-foreground/70">Earnings</span>
              </div>
              <p className="text-xs font-bold text-foreground/80">
                {formatNaira(owner.totalEarnings)}
              </p>
            </div>
          </div>

          {/* Footer: Bank Info, Expand */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Landmark className="size-3.5" />
              <span>{owner.bankDetails.bankName}</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="font-mono text-[10px]">
                {maskAccountNumber(owner.bankDetails.accountNumber)}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="size-4 text-muted-foreground/70" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground/70" />
            )}
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
                      <DetailRow label="Email" value={owner.email} />
                      <DetailRow label="Phone" value={owner.phone} />
                    </div>
                  </div>

                  {/* Fleet Utilization Detail */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Fleet Utilization
                    </h4>
                    <div className="space-y-3">
                      {/* Active Bikes Detailed */}
                      <div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            Active Bikes
                          </span>
                          <span className="text-xs font-semibold text-foreground/80">
                            {owner.activeBikes} / {owner.totalBikes} ({activeRatio.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress
                          value={activeRatio}
                          className={cn("h-2", getActiveBikesProgressColor(activeRatio))}
                        />
                      </div>

                      {/* Active Days Per Week */}
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
                        <CalendarClock className="size-4 text-muted-foreground/70" />
                        <div className="flex-1">
                          <p className="text-[11px] text-muted-foreground">
                            Avg Active Days / Week
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {owner.avgActiveDaysPerWeek} days
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold",
                            owner.avgActiveDaysPerWeek >= 6
                              ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                              : owner.avgActiveDaysPerWeek >= 5
                                ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                          )}
                        >
                          {owner.avgActiveDaysPerWeek >= 6
                            ? "Excellent"
                            : owner.avgActiveDaysPerWeek >= 5
                              ? "Good"
                              : "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Financial Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="size-3.5 text-emerald-500" />
                          <span className="text-[11px] text-muted-foreground">Total ROI</span>
                        </div>
                        <p className={cn("mt-1 text-sm font-bold", getRoiColor(owner.totalRoi))}>
                          {owner.totalRoi}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="size-3.5 text-emerald-500" />
                          <span className="text-[11px] text-muted-foreground">Monthly ROI</span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-emerald-600">
                          {owner.monthlyRoi}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="size-3.5 text-amber-500" />
                          <span className="text-[11px] text-muted-foreground">Pending Payout</span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {formatNaira(owner.pendingPayout)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="size-3.5 text-emerald-500" />
                          <span className="text-[11px] text-muted-foreground">Total Earnings</span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {formatNaira(owner.totalEarnings)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Bank Details
                    </h4>
                    <div className="rounded-lg border border-border bg-card p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-3.5 text-muted-foreground/70" />
                          <span className="text-xs text-muted-foreground">Bank</span>
                          <span className="ml-auto text-xs font-medium text-foreground/80">
                            {owner.bankDetails.bankName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Landmark className="size-3.5 text-muted-foreground/70" />
                          <span className="text-xs text-muted-foreground">Account No.</span>
                          <span className="ml-auto font-mono text-xs font-medium text-foreground/80">
                            {maskAccountNumber(owner.bankDetails.accountNumber)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="size-3.5 text-muted-foreground/70" />
                          <span className="text-xs text-muted-foreground">Account Name</span>
                          <span className="ml-auto text-right text-xs font-medium text-foreground/80">
                            {owner.bankDetails.accountName}
                          </span>
                        </div>
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
                      Process Payout
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
