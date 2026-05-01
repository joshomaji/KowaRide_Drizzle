/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Risk & Compliance Page Component
 * ============================================================================
 *
 * Comprehensive risk management and compliance monitoring interface for the
 * superadmin dashboard. Displays risk summary statistics, active system
 * alerts with severity-coded visual indicators, and a detailed risk
 * assessment table with expandable factor breakdowns.
 *
 * @module components/admin/risk/risk-page
 * @version 2.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ChevronDown,
  Eye,
  Bell,
  TrendingUp,
  Activity,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { mockAlerts, mockRiskAssessments } from "@/lib/mock-data";
import {
  RiskLevel,
  AlertSeverity,
} from "@/types/admin";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const expandRow = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ============================================================================
// SEVERITY & RISK STYLES
// ============================================================================

function getSeverityStyles(severity: AlertSeverity) {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return {
        bg: "bg-red-50 dark:bg-red-950/20",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800/40",
        dot: "bg-red-500",
        badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40",
        icon: AlertOctagon,
      };
    case AlertSeverity.ERROR:
      return {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        text: "text-orange-700 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800/40",
        dot: "bg-orange-500",
        badge: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40",
        icon: AlertTriangle,
      };
    case AlertSeverity.WARNING:
      return {
        bg: "bg-amber-50 dark:bg-amber-950/20",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800/40",
        dot: "bg-amber-500",
        badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40",
        icon: AlertTriangle,
      };
    case AlertSeverity.INFO:
      return {
        bg: "bg-sky-50 dark:bg-sky-950/20",
        text: "text-sky-700 dark:text-sky-400",
        border: "border-sky-200 dark:border-sky-800/40",
        dot: "bg-sky-500",
        badge: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/40",
        icon: Info,
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-950/20",
        text: "text-gray-700 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-800/40",
        dot: "bg-gray-500",
        badge: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800/40",
        icon: Info,
      };
  }
}

function getRiskLevelStyles(level: RiskLevel) {
  switch (level) {
    case RiskLevel.CRITICAL:
      return { bg: "bg-red-100 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400" };
    case RiskLevel.HIGH:
      return { bg: "bg-orange-100 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400" };
    case RiskLevel.MEDIUM:
      return { bg: "bg-amber-100 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400" };
    case RiskLevel.LOW:
      return { bg: "bg-emerald-100 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400" };
    default:
      return { bg: "bg-gray-100 dark:bg-gray-950/30", text: "text-gray-700 dark:text-gray-400" };
  }
}

function getProgressColor(score: number): string {
  if (score >= 80) return "[&>div]:bg-red-500";
  if (score >= 60) return "[&>div]:bg-orange-500";
  if (score >= 40) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-emerald-500";
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({ label, value, icon: Icon, accentClass, iconBgClass }: {
  label: string;
  value: number;
  icon: React.ElementType;
  accentClass: string;
  iconBgClass: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconBgClass)}>
              <Icon className={cn("h-5 w-5", accentClass)} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className={cn("text-xl sm:text-2xl font-bold tracking-tight", accentClass)}>{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// FACTOR ROW
// ============================================================================

function FactorRow({ factor, index }: {
  factor: { name: string; score: number; value: string | number; isAcceptable: boolean };
  index: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-muted-foreground truncate">{factor.name}</span>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">{factor.score}/100</span>
        </div>
        <Progress value={factor.score} className={cn("h-2", getProgressColor(factor.score))} />
        <p className="text-xs text-muted-foreground mt-0.5">Value: {String(factor.value)}</p>
      </div>
      {factor.isAcceptable ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RiskPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);

  const totalAssessments = mockRiskAssessments.length;
  const criticalItems = useMemo(
    () => mockRiskAssessments.filter((a) => a.riskLevel === RiskLevel.CRITICAL).length,
    []
  );
  const highRiskItems = useMemo(
    () => mockRiskAssessments.filter((a) => a.riskLevel === RiskLevel.HIGH).length,
    []
  );
  const unresolvedAlerts = useMemo(
    () => alerts.filter((a) => !a.isResolved).length,
    [alerts]
  );

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isAcknowledged: true } : a))
    );
  };

  const handleResolve = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isResolved: true, isAcknowledged: true } : a))
    );
  };

  const toggleAssessment = (entityId: string) => {
    setExpandedAssessment((prev) => (prev === entityId ? null : entityId));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
            <ShieldAlert className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">Risk & Compliance</h1>
            <p className="text-sm text-muted-foreground truncate">Monitor risk assessments, system alerts, and compliance metrics</p>
          </div>
        </div>
      </motion.div>

      {/* ================================================================
          SECTION 1: Risk Summary Stats
          ================================================================ */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Assessments"
          value={totalAssessments}
          icon={Activity}
          accentClass="text-emerald-600 dark:text-emerald-400"
          iconBgClass="bg-emerald-100 dark:bg-emerald-950/30"
        />
        <StatCard
          label="Critical Items"
          value={criticalItems}
          icon={AlertOctagon}
          accentClass="text-red-600 dark:text-red-400"
          iconBgClass="bg-red-100 dark:bg-red-950/30"
        />
        <StatCard
          label="High Risk Items"
          value={highRiskItems}
          icon={AlertTriangle}
          accentClass="text-orange-600 dark:text-orange-400"
          iconBgClass="bg-orange-100 dark:bg-orange-950/30"
        />
        <StatCard
          label="Unresolved Alerts"
          value={unresolvedAlerts}
          icon={Bell}
          accentClass="text-amber-600 dark:text-amber-400"
          iconBgClass="bg-amber-100 dark:bg-amber-950/30"
        />
      </motion.div>

      {/* ================================================================
          SECTION 2: Active Alerts
          ================================================================ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                Active Alerts
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {unresolvedAlerts} unresolved
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[480px] overflow-y-auto overscroll-contain divide-y">
              {alerts.map((alert, idx) => {
                const styles = getSeverityStyles(alert.severity);
                const SeverityIcon = styles.icon;

                return (
                  <motion.div
                    key={alert.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      "px-4 py-3.5 transition-colors hover:bg-muted/30",
                      alert.isResolved && "opacity-50"
                    )}
                  >
                    <div className="flex gap-3 min-w-0">
                      {/* Severity Icon + Badge */}
                      <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
                        <div className="relative">
                          <SeverityIcon className={cn("h-4.5 w-4.5", styles.text)} />
                          {!alert.isAcknowledged && !alert.isResolved && (
                            <span
                              className={cn(
                                "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full",
                                styles.dot,
                                "animate-pulse"
                              )}
                            />
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] px-1 py-0 border leading-tight", styles.badge)}
                        >
                          {alert.severity}
                        </Badge>
                      </div>

                      {/* Alert Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Title + Time */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "text-sm font-semibold leading-snug min-w-0 truncate",
                            alert.isResolved && "line-through",
                            styles.text
                          )}>
                            {alert.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                            {format(new Date(alert.createdAt), "MMM d, HH:mm")}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {alert.description}
                        </p>

                        {/* Entity + Status Tags */}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1 shrink-0">
                            <TrendingUp className="h-3 w-3" />
                            {alert.entityType}
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Eye className="h-3 w-3" />
                            {alert.isAcknowledged ? "Acknowledged" : "Unacknowledged"}
                          </span>
                        </div>

                        {/* Recommended Action */}
                        {!alert.isResolved && (
                          <div className="mt-1.5 rounded-md bg-muted/50 px-2.5 py-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                              Recommended Action
                            </p>
                            <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                              {alert.recommendedAction}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-0.5">
                          {!alert.isAcknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          {!alert.isResolved && (
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleResolve(alert.id)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                          {alert.isResolved && (
                            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800/40 dark:bg-emerald-950/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ================================================================
          SECTION 3: Risk Assessments Table
          ================================================================ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Risk Assessments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Use native overflow-y-auto instead of ScrollArea for better reliability */}
            <div className="max-h-[520px] overflow-y-auto overscroll-contain divide-y">
              {mockRiskAssessments.map((assessment, idx) => {
                const isExpanded = expandedAssessment === assessment.entityId;
                const riskStyles = getRiskLevelStyles(assessment.riskLevel);
                const topFactor = assessment.factors.reduce(
                  (max, f) => (f.score > max.score ? f : max),
                  assessment.factors[0]
                );

                return (
                  <motion.div
                    key={assessment.entityId}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Row Header */}
                    <button
                      type="button"
                      onClick={() => toggleAssessment(assessment.entityId)}
                      className={cn(
                        "w-full text-left px-4 py-3.5 transition-colors hover:bg-muted/30",
                        isExpanded && "bg-muted/20"
                      )}
                    >
                      <div className="grid grid-cols-[1fr_auto_140px_auto] sm:grid-cols-[2fr_auto_1fr_1fr_auto] items-center gap-3 sm:gap-4 min-w-0">
                        {/* Entity ID + Type */}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {assessment.entityId}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
                            {assessment.entityType}
                          </p>
                        </div>

                        {/* Risk Level Badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] sm:text-xs font-medium border shrink-0",
                            riskStyles.bg,
                            riskStyles.text
                          )}
                        >
                          {assessment.riskLevel}
                        </Badge>

                        {/* Risk Score Progress */}
                        <div className="flex items-center gap-2 min-w-0">
                          <Progress
                            value={assessment.riskScore}
                            className={cn("h-2 flex-1", getProgressColor(assessment.riskScore))}
                          />
                          <span className="text-xs font-medium text-muted-foreground w-7 text-right shrink-0">
                            {assessment.riskScore}
                          </span>
                        </div>

                        {/* Top Factor (desktop only) */}
                        <div className="hidden sm:block min-w-0">
                          <p className="text-xs text-muted-foreground truncate">
                            Top: {topFactor.name}
                          </p>
                        </div>

                        {/* Expand Chevron */}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 justify-self-end",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </button>

                    {/* Expanded Factor Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          variants={expandRow}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <Separator className="mb-3" />
                            <div className="bg-muted/30 rounded-lg p-4">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Risk Factor Breakdown — {assessment.entityId}
                              </p>
                              <div className="space-y-1">
                                {assessment.factors.map((factor, fIdx) => (
                                  <FactorRow key={factor.name} factor={factor} index={fIdx} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
