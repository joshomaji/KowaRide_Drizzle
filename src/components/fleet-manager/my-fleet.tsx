/**
 * ============================================================================
 * KOWA RIDE - FLEET MANAGER DASHBOARD
 * My Fleet & Assets Page Component
 * ============================================================================
 *
 * Fleet Manager's dedicated fleet view. Shows bikes under their management
 * with status tracking, GPS indicators, and quick maintenance actions.
 *
 * @module components/fleet-manager/my-fleet
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  Wrench,
  MapPin,
  Wifi,
  WifiOff,
  Search,
  AlertTriangle,
  Eye,
  ChevronRight,
  Clock,
  ShieldCheck,
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
  mockBikes,
  mockRiders,
} from "@/lib/mock-data";
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

function getAssetStatusColor(status: AssetStatus): string {
  switch (status) {
    case AssetStatus.ACTIVE:
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    case AssetStatus.IN_MAINTENANCE:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    case AssetStatus.REPORTED_STOLEN:
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    case AssetStatus.IDLE:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400";
    case AssetStatus.DECOMMISSIONED:
      return "bg-gray-100 text-gray-500 dark:bg-gray-800/40 dark:text-gray-500";
    case AssetStatus.TOTAL_LOSS:
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400";
  }
}

function getAssetStatusLabel(status: AssetStatus): string {
  switch (status) {
    case AssetStatus.ACTIVE: return "Active";
    case AssetStatus.IN_MAINTENANCE: return "In Maintenance";
    case AssetStatus.REPORTED_STOLEN: return "Stolen";
    case AssetStatus.IDLE: return "Idle";
    case AssetStatus.DECOMMISSIONED: return "Decommissioned";
    case AssetStatus.TOTAL_LOSS: return "Total Loss";
    default: return status;
  }
}

function formatGpsTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date("2025-01-15T21:00:00Z");
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 5) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function isGpsOnline(lastPingTime: string | null): boolean {
  if (!lastPingTime) return false;
  const pingDate = new Date(lastPingTime);
  const now = new Date("2025-01-15T21:00:00Z");
  const diffMins = (now.getTime() - pingDate.getTime()) / 60000;
  return diffMins < 120; // Online if pinged within last 2 hours
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FMMyFleet() {
  const FM_ID = "fm-001";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter bikes for this FM
  const fmBikes = useMemo(() => {
    return mockBikes.filter((b) => b.fleetManagerId === FM_ID);
  }, []);

  // Compute summary stats
  const stats = useMemo(() => {
    const total = fmBikes.length;
    const active = fmBikes.filter((b) => b.status === AssetStatus.ACTIVE).length;
    const inMaintenance = fmBikes.filter((b) => b.status === AssetStatus.IN_MAINTENANCE).length;
    const gpsOffline = fmBikes.filter((b) => !isGpsOnline(b.lastGpsPing?.timestamp ?? null)).length;
    return { total, active, inMaintenance, gpsOffline };
  }, [fmBikes]);

  // Get rider name for bike
  const getRiderName = (riderId: string | null) => {
    if (!riderId) return "Unassigned";
    const rider = mockRiders.find((r) => r.id === riderId);
    return rider ? `${rider.firstName} ${rider.lastName}` : "Unknown";
  };

  // Filtered bikes
  const filteredBikes = useMemo(() => {
    return fmBikes.filter((bike) => {
      const matchesSearch =
        searchQuery === "" ||
        bike.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.makeModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getRiderName(bike.assignedRiderId).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && bike.status === AssetStatus.ACTIVE) ||
        (statusFilter === "maintenance" && bike.status === AssetStatus.IN_MAINTENANCE) ||
        (statusFilter === "stolen" && bike.status === AssetStatus.REPORTED_STOLEN) ||
        (statusFilter === "offline" && !isGpsOnline(bike.lastGpsPing?.timestamp ?? null));

      return matchesSearch && matchesStatus;
    });
  }, [fmBikes, searchQuery, statusFilter, getRiderName]);

  const summaryCards = [
    {
      title: "Total Bikes",
      value: stats.total,
      icon: Bike,
      iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    },
    {
      title: "Active",
      value: stats.active,
      icon: ShieldCheck,
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "In Maintenance",
      value: stats.inMaintenance,
      icon: Wrench,
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "GPS Offline",
      value: stats.gpsOffline,
      icon: WifiOff,
      iconBg: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    },
  ];

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          My Fleet
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your fleet assets — track bike status, GPS locations, and schedule maintenance.
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
            placeholder="Search by asset ID, model, plate, or rider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-card border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "active", "maintenance", "stolen", "offline"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors border border-border",
                statusFilter === filter
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {filter === "all" ? "All" : filter === "offline" ? "GPS Offline" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bike List */}
      <motion.div
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Bikes Under Your Management
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                {filteredBikes.length} bike{filteredBikes.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground/70">
              Track bike status, GPS connectivity, and schedule maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid md:grid-cols-[1.5fr_1.2fr_1fr_1.5fr_1fr_1fr_1.5fr] gap-4 border-b border-border bg-muted/40 px-4 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Asset ID / Model</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plate Number</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned Rider</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">GPS</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Last Ping</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
            </div>

            <ScrollArea className="max-h-[600px]">
              {filteredBikes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Bike className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No bikes found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredBikes.map((bike) => {
                    const gpsOnline = isGpsOnline(bike.lastGpsPing?.timestamp ?? null);
                    const lastPingLabel = bike.lastGpsPing
                      ? formatGpsTimestamp(bike.lastGpsPing.timestamp)
                      : "Never";

                    return (
                      <div
                        key={bike.id}
                        className={cn(
                          "group grid grid-cols-1 md:grid-cols-[1.5fr_1.2fr_1fr_1.5fr_1fr_1fr_1.5fr] gap-2 md:gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors",
                          bike.status === AssetStatus.REPORTED_STOLEN && "border-l-2 border-l-red-500 bg-red-50/20 dark:bg-red-950/10",
                          bike.status === AssetStatus.IN_MAINTENANCE && "border-l-2 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
                        )}
                      >
                        {/* Asset ID & Model */}
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            bike.status === AssetStatus.ACTIVE
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : bike.status === AssetStatus.IN_MAINTENANCE
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                          )}>
                            <Bike className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{bike.assetId}</p>
                            <p className="text-[10px] text-muted-foreground">{bike.makeModel} ({bike.year})</p>
                          </div>
                        </div>

                        {/* Plate Number */}
                        <div className="flex items-center">
                          <span className="text-sm text-foreground font-mono">{bike.plateNumber}</span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0", getAssetStatusColor(bike.status))}
                          >
                            {getAssetStatusLabel(bike.status)}
                          </Badge>
                        </div>

                        {/* Assigned Rider */}
                        <div className="flex items-center">
                          <span className={cn(
                            "text-sm truncate",
                            bike.assignedRiderId ? "text-foreground" : "text-muted-foreground italic"
                          )}>
                            {getRiderName(bike.assignedRiderId)}
                          </span>
                        </div>

                        {/* GPS Status */}
                        <div className="flex md:justify-center items-center gap-1.5">
                          {gpsOnline ? (
                            <>
                              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-3.5 w-3.5 text-red-500" />
                              <span className="text-[10px] font-medium text-red-600 dark:text-red-400">Offline</span>
                            </>
                          )}
                        </div>

                        {/* Last GPS Ping */}
                        <div className="flex md:justify-center items-center">
                          <span className="text-[11px] text-muted-foreground">{lastPingLabel}</span>
                          {bike.lastGpsPing && (
                            <span className="text-[10px] text-muted-foreground/70 ml-1">
                              · {bike.lastGpsPing.speed}km/h
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:justify-end items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700" title="Schedule Maintenance">
                            <Wrench className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden lg:inline">Maint.</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600 hover:text-red-700" title="Report Issue">
                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden lg:inline">Issue</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-sky-600 hover:text-sky-700" title="View GPS">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden lg:inline">GPS</span>
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

      {/* Bike Value Summary */}
      <motion.div
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Fleet Value Summary</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70">Current estimated value of your fleet assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fmBikes.map((bike) => (
                <div key={bike.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      bike.status === AssetStatus.ACTIVE ? "bg-emerald-500" :
                      bike.status === AssetStatus.IN_MAINTENANCE ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="text-xs text-foreground truncate">{bike.assetId}</span>
                    <span className="text-[10px] text-muted-foreground">· {bike.makeModel}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground ml-2 shrink-0">{formatNaira(bike.currentValue)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Total Fleet Value</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNaira(fmBikes.reduce((sum, b) => sum + b.currentValue, 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Maintenance Schedule</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70">Upcoming and overdue maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {fmBikes
                  .filter((b) => b.nextMaintenanceDate)
                  .sort((a, b) => new Date(a.nextMaintenanceDate!).getTime() - new Date(b.nextMaintenanceDate!).getTime())
                  .map((bike) => {
                    const maintDate = new Date(bike.nextMaintenanceDate!);
                    const now = new Date("2025-01-15");
                    const isOverdue = maintDate < now;
                    const daysUntil = Math.ceil((maintDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <div key={bike.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{bike.assetId}</p>
                          <p className="text-[10px] text-muted-foreground">{bike.makeModel} · Odometer: {bike.odometerKm.toLocaleString()} km</p>
                        </div>
                        <div className="text-right ml-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              isOverdue
                                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                : daysUntil <= 14
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            )}
                          >
                            {isOverdue ? "Overdue" : daysUntil <= 14 ? `${daysUntil}d` : "On Track"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
