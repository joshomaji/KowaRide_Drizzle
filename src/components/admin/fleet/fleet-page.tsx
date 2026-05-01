"use client";

import { useState, useMemo } from "react";
import {
  mockBikes,
  mockRiders,
  mockKPIs,
  mockFleetOwners,
  mockFleetManagers,
} from "@/lib/mock-data";
import { BikeAsset, AssetStatus } from "@/types/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bike,
  Search,
  Filter,
  Wrench,
  AlertTriangle,
  MapPin,
  Gauge,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  TrendingDown,
  DollarSign,
  Activity,
  User,
  Building2,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDistance(km: number): string {
  return new Intl.NumberFormat("en-NG").format(km) + " km";
}

const STATUS_CONFIG: Record<
  AssetStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  [AssetStatus.ACTIVE]: {
    label: "Active",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [AssetStatus.IDLE]: {
    label: "Idle",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  [AssetStatus.IN_MAINTENANCE]: {
    label: "In Maintenance",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  [AssetStatus.DECOMMISSIONED]: {
    label: "Decommissioned",
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  [AssetStatus.REPORTED_STOLEN]: {
    label: "Reported Stolen",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    dot: "bg-red-500",
  },
  [AssetStatus.TOTAL_LOSS]: {
    label: "Total Loss",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    dot: "bg-red-600",
  },
};

function StatusBadge({ status }: { status: AssetStatus }) {
  const cfg = STATUS_CONFIG[status];
  const isStolen =
    status === AssetStatus.REPORTED_STOLEN || status === AssetStatus.TOTAL_LOSS;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium text-xs px-2.5 py-0.5",
        cfg.color,
        cfg.bg,
        cfg.border
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          cfg.dot,
          isStolen && "animate-pulse"
        )}
      />
      {cfg.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Stagger animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ---------------------------------------------------------------------------
// Stats Row
// ---------------------------------------------------------------------------

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: string;
  trendColor?: string;
}

function StatsRow() {
  const stats: StatCard[] = [
    {
      title: "Total Assets",
      value: mockKPIs.totalBikes.toLocaleString(),
      icon: <Bike className="h-5 w-5" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Active on Road",
      value: mockKPIs.activeBikes.toLocaleString(),
      icon: <Activity className="h-5 w-5" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "92.5%",
      trendColor: "text-emerald-600",
    },
    {
      title: "In Maintenance",
      value: "156",
      icon: <Wrench className="h-5 w-5" />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "4.5%",
      trendColor: "text-amber-600",
    },
    {
      title: "Stolen / Total Loss",
      value: "8",
      icon: <AlertTriangle className="h-5 w-5" />,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      trend: "0.2%",
      trendColor: "text-red-600",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => (
        <motion.div key={stat.title} variants={itemVariants}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <p
                      className={cn(
                        "text-xs font-medium",
                        stat.trendColor
                      )}
                    >
                      {stat.trend} of total fleet
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    stat.iconBg
                  )}
                >
                  <span className={stat.iconColor}>{stat.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Asset Status Distribution
// ---------------------------------------------------------------------------

function StatusDistribution({ bikes }: { bikes: BikeAsset[] }) {
  const distribution = useMemo(() => {
    const counts = bikes.reduce(
      (acc, bike) => {
        acc[bike.status] = (acc[bike.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.values(AssetStatus).map((status) => ({
      status,
      count: counts[status] || 0,
      percentage: bikes.length
        ? ((counts[status] || 0) / bikes.length) * 100
        : 0,
    }));
  }, [bikes]);

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600" />
            Asset Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {distribution.map((item) => {
              const cfg = STATUS_CONFIG[item.status];
              return (
                <motion.div
                  key={item.status}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 cursor-default select-none",
                    cfg.bg,
                    cfg.border
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0",
                      cfg.dot,
                      (item.status === AssetStatus.REPORTED_STOLEN ||
                        item.status === AssetStatus.TOTAL_LOSS) &&
                        "animate-pulse"
                    )}
                  />
                  <div className="flex flex-col leading-none">
                    <span className={cn("text-xs font-semibold", cfg.color)}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      {item.count} asset{item.count !== 1 ? "s" : ""} &middot;{" "}
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Bike Detail Dialog
// ---------------------------------------------------------------------------

function BikeDetailDialog({
  bike,
  open,
  onOpenChange,
}: {
  bike: BikeAsset | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const rider = bike?.assignedRiderId
    ? mockRiders.find((r) => r.id === bike.assignedRiderId)
    : null;

  const owner = bike?.fleetOwnerId
    ? mockFleetOwners.find((o) => o.id === bike.fleetOwnerId)
    : null;

  const depreciation = bike
    ? ((bike.purchasePrice - bike.currentValue) / bike.purchasePrice) * 100
    : 0;

  if (!bike) return null;

  const isStolen =
    bike.status === AssetStatus.REPORTED_STOLEN ||
    bike.status === AssetStatus.TOTAL_LOSS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-lg font-bold">
                    {bike.assetId}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {bike.makeModel} &middot; {bike.year} &middot; {bike.color}
                  </p>
                </div>
                <StatusBadge status={bike.status} />
              </div>
            </DialogHeader>

            <Separator />

            {/* Asset Identity */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Asset Identity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoField label="Asset ID" value={bike.assetId} />
                <InfoField label="Make / Model" value={bike.makeModel} />
                <InfoField label="Year" value={String(bike.year)} />
                <InfoField label="Color" value={bike.color} />
                <InfoField label="Plate Number" value={bike.plateNumber} />
                <InfoField
                  label="VIN / Chassis"
                  value={bike.vinNumber}
                  mono
                />
                <InfoField
                  label="Registered"
                  value={format(new Date(bike.registeredAt), "MMM d, yyyy")}
                />
                <InfoField
                  label="Odometer"
                  value={formatDistance(bike.odometerKm)}
                />
              </div>
            </div>

            <Separator />

            {/* Financial */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Financial Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InfoField
                  label="Current Value"
                  value={formatCurrency(bike.currentValue)}
                  highlight
                />
                <InfoField
                  label="Purchase Price"
                  value={formatCurrency(bike.purchasePrice)}
                />
                <InfoField
                  label="Depreciation"
                  value={depreciation.toFixed(1) + "%"}
                  valueClass={
                    depreciation > 30
                      ? "text-red-600 font-semibold"
                      : "text-amber-600 font-semibold"
                  }
                />
              </div>
              {/* Value bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>₦0</span>
                  <span>{depreciation.toFixed(0)}% depreciated</span>
                  <span>{formatCurrency(bike.purchasePrice)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${Math.max(0, 100 - depreciation)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* GPS Info */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                GPS Information
              </h4>
              {bike.lastGpsPing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoField
                    label="Location"
                    value={`${bike.lastGpsPing.latitude.toFixed(4)}, ${bike.lastGpsPing.longitude.toFixed(4)}`}
                    mono
                  />
                  <InfoField
                    label="Last Ping"
                    value={format(
                      new Date(bike.lastGpsPing.timestamp),
                      "MMM d, yyyy HH:mm"
                    )}
                  />
                  <InfoField
                    label="Speed"
                    value={`${bike.lastGpsPing.speed} km/h`}
                    valueClass={
                      bike.lastGpsPing.speed === 0 && isStolen
                        ? "text-red-600 font-semibold"
                        : undefined
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No GPS data available
                </p>
              )}
            </div>

            <Separator />

            {/* Maintenance */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                Maintenance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InfoField
                  label="Service Count"
                  value={String(bike.maintenanceCount)}
                />
                <InfoField
                  label="Last Service"
                  value={
                    bike.lastMaintenanceDate
                      ? format(new Date(bike.lastMaintenanceDate), "MMM d, yyyy")
                      : "N/A"
                  }
                />
                <InfoField
                  label="Next Service"
                  value={
                    bike.nextMaintenanceDate
                      ? format(new Date(bike.nextMaintenanceDate), "MMM d, yyyy")
                      : "N/A"
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Bike Owner */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Bike Owner
              </h4>
              {owner ? (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      {owner.firstName[0]}
                      {owner.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {owner.firstName} {owner.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {owner.ownerId} &middot; {owner.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No owner assigned</p>
              )}
            </div>

            <Separator />

            {/* Assigned Rider */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Assigned Rider
              </h4>
              {rider ? (
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      {rider.firstName[0]}
                      {rider.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {rider.firstName} {rider.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rider.riderId} &middot; {rider.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground italic">
                    Unassigned
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2 text-sm"
                onClick={() => onOpenChange(false)}
              >
                <Calendar className="h-4 w-4" />
                Schedule Maintenance
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-sm"
                onClick={() => onOpenChange(false)}
              >
                <AlertTriangle className="h-4 w-4" />
                Report Issue
              </Button>
              <Button
                className="flex-1 gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onOpenChange(false)}
              >
                <MapPin className="h-4 w-4" />
                View GPS History
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/** Small labelled value field used inside the detail dialog */
function InfoField({
  label,
  value,
  mono,
  highlight,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm font-medium",
          mono && "font-mono text-xs",
          highlight && "text-emerald-700",
          valueClass
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main FleetPage
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 6;

export function FleetPage() {
  const [bikes, setBikes] = useState<BikeAsset[]>(mockBikes);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBike, setSelectedBike] = useState<BikeAsset | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Add bike form state
  const [formMakeModel, setFormMakeModel] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formPlate, setFormPlate] = useState("");
  const [formVin, setFormVin] = useState("");
  const [formStatus, setFormStatus] = useState<string>("IDLE");
  const [formFleetOwner, setFormFleetOwner] = useState("");
  const [formFleetManager, setFormFleetManager] = useState("");
  const [formRider, setFormRider] = useState("");
  const [formPurchasePrice, setFormPurchasePrice] = useState("");
  const [formCurrentValue, setFormCurrentValue] = useState("");
  const [formOdometer, setFormOdometer] = useState("0");

  // Rider lookup map
  const riderMap = useMemo(() => {
    const map = new Map<string, (typeof mockRiders)[number]>();
    mockRiders.forEach((r) => map.set(r.id, r));
    return map;
  }, []);

  // Fleet owner lookup map
  const ownerMap = useMemo(() => {
    const map = new Map<string, (typeof mockFleetOwners)[number]>();
    mockFleetOwners.forEach((o) => map.set(o.id, o));
    return map;
  }, []);

  // Filtered / searched bikes
  const filteredBikes = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bikes.filter((bike) => {
      // Status filter
      if (statusFilter !== "ALL" && bike.status !== statusFilter) return false;

      // Search
      if (q) {
        const haystack = [
          bike.assetId,
          bike.makeModel,
          bike.plateNumber,
          bike.vinNumber,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      }

      return true;
    });
  }, [search, statusFilter, bikes]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBikes.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBikes = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredBikes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBikes, safeCurrentPage]);

  // Reset page when filter/search changes
  function handleSearchChange(v: string) {
    setSearch(v);
    setCurrentPage(1);
  }

  function handleStatusChange(v: string) {
    setStatusFilter(v);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fleet & Assets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and manage all bike assets across the fleet.
        </p>
      </div>

      {/* Stats row */}
      <StatsRow />

      {/* Status distribution */}
      <StatusDistribution bikes={bikes} />

      {/* Table section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold">
                  Bike Assets
                </CardTitle>
                <Button
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm shrink-0"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Bike Asset
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search asset ID, make, plate..."
                      className="pl-9 h-9 text-sm"
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                  {/* Status filter */}
                  <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-9 w-full sm:w-44 text-sm">
                      <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      {Object.values(AssetStatus).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_CONFIG[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Asset ID
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Make / Model
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Plate #
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Bike Owner
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Assigned Rider
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Last GPS
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                        Odometer
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                        Value
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBikes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="h-32 text-center text-muted-foreground"
                        >
                          No assets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBikes.map((bike, idx) => {
                        const rider = bike.assignedRiderId
                          ? riderMap.get(bike.assignedRiderId)
                          : null;
                        const isStolen =
                          bike.status === AssetStatus.REPORTED_STOLEN ||
                          bike.status === AssetStatus.TOTAL_LOSS;

                        return (
                          <motion.tr
                            key={bike.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: idx * 0.04,
                            }}
                            className={cn(
                              "border-b transition-colors hover:bg-gray-50 cursor-pointer group",
                              isStolen && "border-l-[3px] border-l-red-500 bg-red-50/40 hover:bg-red-50/70"
                            )}
                            onClick={() => setSelectedBike(bike)}
                          >
                            {/* Asset ID */}
                            <TableCell className="py-3 pr-4">
                              <span className="text-sm font-semibold text-gray-900">
                                {bike.assetId}
                              </span>
                            </TableCell>

                            {/* Make / Model */}
                            <TableCell className="py-3 pr-4">
                              <span className="text-sm text-gray-700">
                                {bike.makeModel}
                              </span>
                              <span className="ml-1.5 text-xs text-muted-foreground">
                                {bike.year}
                              </span>
                            </TableCell>

                            {/* Plate */}
                            <TableCell className="py-3 pr-4">
                              <span className="text-sm font-mono text-gray-700">
                                {bike.plateNumber}
                              </span>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="py-3 pr-4">
                              <StatusBadge status={bike.status} />
                            </TableCell>

                            {/* Bike Owner */}
                            <TableCell className="py-3 pr-4">
                              {(() => {
                                const owner = ownerMap.get(bike.fleetOwnerId);
                                return owner ? (
                                  <div className="flex items-center gap-1.5">
                                    <Building2 className="size-3.5 text-muted-foreground/70 shrink-0" />
                                    <span className="text-sm text-gray-700 truncate">
                                      {owner.firstName} {owner.lastName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm italic text-muted-foreground">—</span>
                                );
                              })()}
                            </TableCell>

                            {/* Assigned Rider */}
                            <TableCell className="py-3 pr-4">
                              {rider ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                                      {rider.firstName[0]}
                                      {rider.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-700">
                                    {rider.firstName} {rider.lastName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm italic text-muted-foreground">
                                  Unassigned
                                </span>
                              )}
                            </TableCell>

                            {/* Last GPS */}
                            <TableCell className="py-3 pr-4">
                              {bike.lastGpsPing ? (
                                <span className="text-xs text-gray-600">
                                  {format(
                                    new Date(bike.lastGpsPing.timestamp),
                                    "MMM d, HH:mm"
                                  )}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  &mdash;
                                </span>
                              )}
                            </TableCell>

                            {/* Odometer */}
                            <TableCell className="py-3 pr-4 text-right">
                              <span className="text-sm tabular-nums text-gray-700">
                                {formatDistance(bike.odometerKm)}
                              </span>
                            </TableCell>

                            {/* Value */}
                            <TableCell className="py-3 pr-4 text-right">
                              <span className="text-sm font-medium tabular-nums">
                                {formatCurrency(bike.currentValue)}
                              </span>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="py-3 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBike(bike);
                                }}
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredBikes.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        safeCurrentPage * ITEMS_PER_PAGE,
                        filteredBikes.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredBikes.length}</span>{" "}
                    assets
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={page === safeCurrentPage ? "default" : "outline"}
                          size="icon"
                          className={cn(
                            "h-8 w-8 text-xs",
                            page === safeCurrentPage &&
                              "bg-emerald-600 hover:bg-emerald-700 text-white"
                          )}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bike Detail Dialog */}
      <BikeDetailDialog
        bike={selectedBike}
        open={!!selectedBike}
        onOpenChange={(open) => !open && setSelectedBike(null)}
      />

      {/* Add Bike Asset Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6 space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Add Bike Asset</DialogTitle>
              </DialogHeader>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="makeModel">Make / Model</Label>
                  <Input
                    id="makeModel"
                    placeholder="e.g. Honda CG 125"
                    value={formMakeModel}
                    onChange={(e) => setFormMakeModel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g. 2024"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g. Red"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    placeholder="e.g. LAG-123-AB"
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="vinNumber">VIN / Chassis Number</Label>
                  <Input
                    id="vinNumber"
                    placeholder="Enter VIN / Chassis Number"
                    value={formVin}
                    onChange={(e) => setFormVin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="IDLE">Idle</SelectItem>
                      <SelectItem value="IN_MAINTENANCE">In Maintenance</SelectItem>
                      <SelectItem value="DECOMMISSIONED">Decommissioned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fleetOwner">Fleet Owner</Label>
                  <Select value={formFleetOwner} onValueChange={setFormFleetOwner}>
                    <SelectTrigger id="fleetOwner">
                      <SelectValue placeholder="Select fleet owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFleetOwners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.firstName} {owner.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fleetManager">Fleet Manager</Label>
                  <Select value={formFleetManager} onValueChange={setFormFleetManager}>
                    <SelectTrigger id="fleetManager">
                      <SelectValue placeholder="Select fleet manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFleetManagers.map((mgr) => (
                        <SelectItem key={mgr.id} value={mgr.id}>
                          {mgr.firstName} {mgr.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rider">Assigned Rider (optional)</Label>
                  <Select value={formRider} onValueChange={setFormRider}>
                    <SelectTrigger id="rider">
                      <SelectValue placeholder="Select rider (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRiders.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.firstName} {r.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (₦)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    placeholder="e.g. 450000"
                    value={formPurchasePrice}
                    onChange={(e) => {
                      setFormPurchasePrice(e.target.value);
                      // Auto-set current value to purchase price if empty
                      if (!formCurrentValue) {
                        setFormCurrentValue(e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value (₦)</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    placeholder="Defaults to purchase price"
                    value={formCurrentValue}
                    onChange={(e) => setFormCurrentValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="odometer">Odometer (km)</Label>
                  <Input
                    id="odometer"
                    type="number"
                    placeholder="0"
                    value={formOdometer}
                    onChange={(e) => setFormOdometer(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <DialogFooter className="flex-row gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    if (!formMakeModel || !formYear || !formPlate || !formFleetOwner || !formFleetManager || !formPurchasePrice) {
                      toast.error("Please fill in all required fields");
                      return;
                    }

                    const newBike: BikeAsset = {
                      id: `bike-${Date.now()}`,
                      assetId: `KR-BIKE-${String(bikes.length + 1).padStart(5, "0")}`,
                      makeModel: formMakeModel,
                      year: Number(formYear),
                      color: formColor || "Unknown",
                      plateNumber: formPlate,
                      vinNumber: formVin || "",
                      status: formStatus as AssetStatus,
                      assignedRiderId: formRider || null,
                      fleetManagerId: formFleetManager,
                      fleetOwnerId: formFleetOwner,
                      registeredAt: new Date().toISOString(),
                      currentValue: Number(formCurrentValue || formPurchasePrice),
                      purchasePrice: Number(formPurchasePrice),
                      odometerKm: Number(formOdometer || 0),
                      lastGpsPing: null,
                      maintenanceCount: 0,
                      lastMaintenanceDate: null,
                      nextMaintenanceDate: null,
                    };

                    setBikes((prev) => [newBike, ...prev]);
                    setShowAddDialog(false);
                    toast.success("Bike asset added successfully");

                    // Reset form
                    setFormMakeModel("");
                    setFormYear("");
                    setFormColor("");
                    setFormPlate("");
                    setFormVin("");
                    setFormStatus("IDLE");
                    setFormFleetOwner("");
                    setFormFleetManager("");
                    setFormRider("");
                    setFormPurchasePrice("");
                    setFormCurrentValue("");
                    setFormOdometer("0");
                    setCurrentPage(1);
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Bike Asset
                </Button>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
