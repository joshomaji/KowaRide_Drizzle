/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Audit Logs Page Component
 * ============================================================================
 *
 * Immutable audit trail viewer for the superadmin dashboard. Provides a
 * searchable, filterable log of all system actions with tamper-evident
 * hash chaining verification. Each entry records the actor, action type,
 * affected entity, and full details for regulatory compliance.
 *
 * Features:
 * - Category filter dropdown (AUTH, FINANCIAL, USER_MGMT, CONFIG, ENFORCEMENT, SYSTEM)
 * - Action text search input
 * - Color-coded category badges
 * - Expandable rows for full detail view
 * - Tamper-evident indicator with lock icon
 * - Responsive table with mobile-friendly layout
 *
 * @module components/admin/audit/audit-page
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Shield,
  Search,
  ChevronDown,
  Lock,
  Filter,
  User,
  FileText,
  Clock,
  Globe,
  Hash,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { mockAuditLogs } from "@/lib/mock-data";
import type { AuditLogEntry } from "@/types/admin";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

/** All possible audit log categories */
const AUDIT_CATEGORIES = [
  "AUTH",
  "FINANCIAL",
  "USER_MGMT",
  "CONFIG",
  "ENFORCEMENT",
  "SYSTEM",
  "OPERATIONS",
  "COMPLIANCE",
] as const;

/**
 * Category display configuration with distinct color coding.
 * Each category maps to a unique color for quick visual identification.
 */
const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  AUTH: { bg: "bg-violet-100", text: "text-violet-700" },
  FINANCIAL: { bg: "bg-emerald-100", text: "text-emerald-700" },
  USER_MGMT: { bg: "bg-sky-100", text: "text-sky-700" },
  CONFIG: { bg: "bg-amber-100", text: "text-amber-700" },
  ENFORCEMENT: { bg: "bg-red-100", text: "text-red-700" },
  SYSTEM: { bg: "bg-gray-100", text: "text-gray-700" },
  OPERATIONS: { bg: "bg-teal-100", text: "text-teal-700" },
  COMPLIANCE: { bg: "bg-purple-100", text: "text-purple-700" },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/** Stagger container for list animations */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

/** Fade-up animation for individual items */
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/** Expand/collapse animation for detail rows */
const expandRow = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Returns the color styles for a given audit category.
 * Falls back to gray styling for unknown categories.
 * @param category - The audit log category
 * @returns Object with bg and text Tailwind classes
 */
function getCategoryStyle(category: string): { bg: string; text: string } {
  return CATEGORY_STYLES[category] || { bg: "bg-gray-100", text: "text-gray-700" };
}

/**
 * Truncates a string to max length with ellipsis.
 * @param text - String to truncate
 * @param maxLength - Max character count
 * @returns Truncated string
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Filter bar component containing category select dropdown
 * and action text search input.
 */
interface FilterBarProps {
  /** Currently selected category filter */
  categoryFilter: string;
  /** Current action search query */
  searchQuery: string;
  /** Callback when category filter changes */
  onCategoryChange: (value: string) => void;
  /** Callback when search query changes */
  onSearchChange: (value: string) => void;
  /** Count of currently filtered results */
  resultCount: number;
}

function FilterBar({
  categoryFilter,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  resultCount,
}: FilterBarProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
    >
      {/* Category Select */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {AUDIT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search actions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* Result Count */}
      <Badge variant="outline" className="text-xs shrink-0">
        {resultCount} {resultCount === 1 ? "entry" : "entries"}
      </Badge>
    </motion.div>
  );
}

/**
 * Single audit log entry row with expandable detail section.
 * Shows timestamp, actor, action, category badge, target, truncated
 * details, and IP address in a responsive grid layout.
 */
interface AuditRowProps {
  /** The audit log entry to display */
  entry: AuditLogEntry;
  /** Whether this row is expanded */
  isExpanded: boolean;
  /** Callback to toggle expansion */
  onToggle: () => void;
}

function AuditRow({ entry, isExpanded, onToggle }: AuditRowProps) {
  const categoryStyle = getCategoryStyle(entry.category);

  return (
    <motion.div variants={fadeUp}>
      {/* Clickable Row Header */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full text-left p-4 sm:p-5 transition-colors hover:bg-gray-50/50",
          isExpanded && "bg-gray-50/50"
        )}
      >
        <div className="grid grid-cols-12 gap-2 sm:gap-4 items-start">
          {/* Timestamp */}
          <div className="col-span-6 sm:col-span-2 min-w-0">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0 sm:hidden" />
              <p className="text-xs sm:text-sm whitespace-nowrap">
                {format(new Date(entry.timestamp), "MMM d, HH:mm")}
              </p>
            </div>
          </div>

          {/* Actor */}
          <div className="col-span-6 sm:col-span-2 min-w-0">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-sm font-medium text-gray-900 truncate">{entry.actorName}</p>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block">{entry.actorRole}</p>
          </div>

          {/* Action */}
          <div className="col-span-6 sm:col-span-2 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{entry.action}</p>
          </div>

          {/* Category Badge */}
          <div className="col-span-6 sm:col-span-1">
            <Badge
              variant="outline"
              className={cn("text-[10px] sm:text-xs font-medium border", categoryStyle.bg, categoryStyle.text)}
            >
              {entry.category}
            </Badge>
          </div>

          {/* Target */}
          <div className="hidden sm:block sm:col-span-2 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {entry.targetEntity} ({entry.targetId})
            </p>
          </div>

          {/* Details (truncated) */}
          <div className="hidden lg:block lg:col-span-2 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{truncate(entry.details, 60)}</p>
          </div>

          {/* IP Address */}
          <div className="hidden md:flex md:col-span-1 items-center justify-end">
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.ipAddress}</span>
            </div>
          </div>

          {/* Expand Chevron */}
          <div className="flex justify-end col-span-12 sm:col-span-0">
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </div>
      </button>

      {/* Expanded Detail Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={expandRow}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
              <Separator className="mb-4" />
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {/* Full Details */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Full Details
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{entry.details}</p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-200">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Actor ID</p>
                    <p className="text-xs text-gray-700 mt-0.5">{entry.actorId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Target</p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {entry.targetEntity} ({entry.targetId})
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Globe className="h-3 w-3" />IP Address
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5 font-mono">{entry.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Hash className="h-3 w-3" />Entry Hash
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5 font-mono truncate">{entry.previousEntryHash}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Audit Logs page component for the Superadmin Dashboard.
 *
 * Displays an immutable, tamper-evident log of all system actions with:
 * - **Filter bar**: Category dropdown + action text search
 * - **Audit log table**: Responsive rows showing timestamp, actor, action,
 *   category badge, target, details, and IP address
 * - **Expandable details**: Click any row to view the full action details,
 *   actor ID, target entity, IP address, and chain hash
 * - **Tamper-evident indicator**: Lock icon and "Tamper-evident" badge
 *   communicating the immutable nature of the log chain
 *
 * @example
 * ```tsx
 * <AuditPage />
 * ```
 */
export function AuditPage() {
  // ---- State ----
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // ---- Computed: Filtered Logs ----
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      // Category filter
      const matchesCategory =
        categoryFilter === "ALL" || log.category === categoryFilter;

      // Search filter (case-insensitive match on action, actor name, details)
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        log.action.toLowerCase().includes(query) ||
        log.actorName.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.targetEntity.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  // ---- Handlers ----

  /** Toggles the expanded state of an audit log entry */
  const toggleLog = (logId: string) => {
    setExpandedLog((prev) => (prev === logId ? null : logId));
  };

  // ---- Render ----
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Shield className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">Immutable audit trail for regulatory compliance and system monitoring</p>
          </div>
        </div>
      </motion.div>

      {/* Tamper-Evident Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700">
            <span className="font-semibold">Tamper-evident</span> — Every entry is cryptographically chained. Any modification invalidates subsequent hashes.
          </p>
          <Badge className="ml-auto bg-emerald-600 text-white border-0 text-[10px] shrink-0 hidden sm:inline-flex">
            <Lock className="h-3 w-3 mr-1" />
            Blockchain-secured
          </Badge>
        </div>
      </motion.div>

      {/* Main Audit Logs Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-emerald-600" />
                System Audit Trail
              </CardTitle>
              <FilterBar
                categoryFilter={categoryFilter}
                searchQuery={searchQuery}
                onCategoryChange={setCategoryFilter}
                onSearchChange={setSearchQuery}
                resultCount={filteredLogs.length}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                key={`${categoryFilter}-${searchQuery}`}
                className="divide-y"
              >
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((entry) => (
                    <AuditRow
                      key={entry.id}
                      entry={entry}
                      isExpanded={expandedLog === entry.id}
                      onToggle={() => toggleLog(entry.id)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No audit logs match your filters</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => {
                        setCategoryFilter("ALL");
                        setSearchQuery("");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </motion.div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
