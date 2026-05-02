/**
 * ============================================================================
 * KOWA RIDE - FLEET MANAGER DASHBOARD
 * Risk & Compliance Page Component
 * ============================================================================
 *
 * Fleet Manager's risk page — shows ONLY risks related to riders under
 * their management. Includes risk cards, unpaid day tracking, and
 * escalation quick actions.
 *
 * @module components/fleet-manager/risk-compliance
 * @version 1.0.0
 * ============================================================================
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  ArrowUpRight,
  Clock,
  XCircle,
  CheckCircle2,
  Activity,
  TrendingDown,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  mockRiders,
  mockRiskAssessments,
  mockAlerts,
} from "@/lib/mock-data";
import {
  RiderStatus,
  RiskLevel,
  UnpaidDayAction,
  AlertSeverity,
} from "@/types/admin";

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

function getRiskLevelColor(level: RiskLevel): { bg: string; text: string; badge: string; dot: string } {
  switch (level) {
    case RiskLevel.CRITICAL:
      return {
        bg: "bg-red-100 dark:bg-red-950/40",
        text: "text-red-600 dark:text-red-400",
        badge: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
        dot: "bg-red-500",
      };
    case RiskLevel.HIGH:
      return {
        bg: "bg-orange-100 dark:bg-orange-950/40",
        text: "text-orange-600 dark:text-orange-400",
        badge: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
        dot: "bg-orange-500",
      };
    case RiskLevel.MEDIUM:
      return {
        bg: "bg-amber-100 dark:bg-amber-950/40",
        text: "text-amber-600 dark:text-amber-400",
        badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        dot: "bg-amber-500",
      };
    case RiskLevel.LOW:
      return {
        bg: "bg-emerald-100 dark:bg-emerald-950/40",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
  }
}

function getEscalationLabel(action: UnpaidDayAction): { label: string; color: string } {
  switch (action) {
    case UnpaidDayAction.NONE:
      return { label: "None", color: "text-muted-foreground" };
    case UnpaidDayAction.SMS_WARNING:
      return { label: "SMS Warning Sent", color: "text-amber-600 dark:text-amber-400" };
    case UnpaidDayAction.FM_CALL:
      return { label: "FM Call Required", color: "text-orange-600 dark:text-orange-400" };
    case UnpaidDayAction.FINAL_WARNING:
      return { label: "Final Warning", color: "text-red-600 dark:text-red-400" };
    case UnpaidDayAction.SUSPENDED:
      return { label: "Suspended", color: "text-red-700 dark:text-red-300" };
    case UnpaidDayAction.BIKE_RETRIEVAL:
      return { label: "Bike Retrieval", color: "text-red-800 dark:text-red-200" };
  }
}

function getRiskScoreColor(score: number): string {
  if (score >= 75) return "text-red-600 dark:text-red-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function getRiskProgressColor(score: number): string {
  if (score >= 75) return "bg-red-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-emerald-500";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FMRiskCompliance() {
  const FM_ID = "fm-001";

  // Get FM riders
  const fmRiders = useMemo(() => {
    return mockRiders.filter((r) => r.fleetManagerId === FM_ID);
  }, []);

  // Get risk assessments for FM's riders
  const fmRiderIds = useMemo(() => new Set(fmRiders.map((r) => r.id)), [fmRiders]);
  const fmRiskAssessments = useMemo(() => {
    return mockRiskAssessments.filter((ra) => fmRiderIds.has(ra.entityId));
  }, [fmRiderIds]);

  // Build risk cards for FM riders with risk data
  const riderRiskCards = useMemo(() => {
    return fmRiders
      .map((rider) => {
        const riskAssessment = fmRiskAssessments.find((ra) => ra.entityId === rider.id);
        // For riders without formal risk assessments, compute basic risk from their data
        const computedRiskScore = riskAssessment
          ? riskAssessment.riskScore
          : rider.unpaidDays >= 3
            ? 70 + rider.unpaidDays * 5
            : rider.unpaidDays > 0
              ? 40 + rider.unpaidDays * 10
              : rider.repaymentRate >= 90
                ? 10
                : 30;

        const computedRiskLevel = riskAssessment
          ? riskAssessment.riskLevel
          : computedRiskScore >= 75
            ? RiskLevel.HIGH
            : computedRiskScore >= 50
              ? RiskLevel.MEDIUM
              : RiskLevel.LOW;

        const keyFactors = riskAssessment
          ? riskAssessment.factors
          : [
              { name: "Repayment Rate", score: 100 - rider.repaymentRate, value: `${rider.repaymentRate}%`, isAcceptable: rider.repaymentRate >= 90 },
              { name: "Unpaid Days", score: rider.unpaidDays * 20, value: `${rider.unpaidDays} days`, isAcceptable: rider.unpaidDays === 0 },
              { name: "Payment Streak", score: rider.paymentStreak > 0 ? 0 : 50, value: rider.paymentStreak > 0 ? `${rider.paymentStreak}d` : "None", isAcceptable: rider.paymentStreak > 0 },
            ];

        return {
          rider,
          riskScore: computedRiskScore,
          riskLevel: computedRiskLevel,
          keyFactors,
          escalation: rider.unpaidDayAction,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [fmRiders, fmRiskAssessments]);

  // Unpaid days tracker (sorted by overdue days, descending)
  const unpaidTracker = useMemo(() => {
    return fmRiders
      .filter((r) => r.unpaidDays > 0)
      .sort((a, b) => b.unpaidDays - a.unpaidDays);
  }, [fmRiders]);

  // Compute alert counts by severity
  const alertCounts = useMemo(() => {
    // Get alerts that are relevant to FM's riders or their bikes
    const fmBikeIds = new Set();
    // Also include general alerts that might affect FM operations
    const relevantAlerts = mockAlerts.filter((a) => !a.isResolved);
    return {
      critical: relevantAlerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length,
      error: relevantAlerts.filter((a) => a.severity === AlertSeverity.ERROR).length,
      warning: relevantAlerts.filter((a) => a.severity === AlertSeverity.WARNING).length,
      info: relevantAlerts.filter((a) => a.severity === AlertSeverity.INFO).length,
      total: relevantAlerts.length,
    };
  }, []);

  const severityCards = [
    {
      title: "Critical",
      value: alertCounts.critical,
      icon: XCircle,
      iconBg: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
      valueColor: "text-red-600 dark:text-red-400",
    },
    {
      title: "Error",
      value: alertCounts.error,
      icon: AlertTriangle,
      iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
      valueColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Warning",
      value: alertCounts.warning,
      icon: Clock,
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      valueColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Info",
      value: alertCounts.info,
      icon: Activity,
      iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
      valueColor: "text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <section className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Risk & Compliance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor rider risk levels, track overdue payments, and take escalation actions.
        </p>
      </div>

      {/* Alert Severity Cards */}
      <motion.div
        className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {severityCards.map((card) => {
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
                  <p className={cn("text-2xl font-bold tracking-tight", card.valueColor)}>{card.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{card.title} Alert{card.value !== 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Rider Risk Cards */}
      <motion.div
        className="mb-6"
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Rider Risk Assessment</h2>
          <Badge variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {riderRiskCards.filter((r) => r.riskScore >= 50).length} at risk
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {riderRiskCards.map((item) => {
            const riskColors = getRiskLevelColor(item.riskLevel);
            const escalationInfo = getEscalationLabel(item.escalation);

            return (
              <motion.div key={item.rider.id} variants={fadeUpItem}>
                <Card className={cn(
                  "border-border bg-card transition-all duration-200 hover:shadow-md",
                  item.riskScore >= 75 && "border-red-200 dark:border-red-900/50",
                  item.riskScore >= 50 && item.riskScore < 75 && "border-amber-200 dark:border-amber-900/50"
                )}>
                  <CardContent className="p-4">
                    {/* Rider Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border">
                        <AvatarImage src={item.rider.avatarUrl} alt={`${item.rider.firstName} ${item.rider.lastName}`} />
                        <AvatarFallback className="bg-muted text-[10px] font-semibold">
                          {item.rider.firstName[0]}{item.rider.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.rider.firstName} {item.rider.lastName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn("h-2 w-2 rounded-full", riskColors.dot)} />
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", riskColors.badge)}>
                            {item.riskLevel}
                          </Badge>
                          {item.rider.unpaidDays > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                              {item.rider.unpaidDays}d overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-lg font-bold", getRiskScoreColor(item.riskScore))}>
                          {item.riskScore}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Risk Score</p>
                      </div>
                    </div>

                    {/* Risk Score Progress */}
                    <div className="mb-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className={cn("h-full rounded-full", getRiskProgressColor(item.riskScore))}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(item.riskScore, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Key Risk Factors */}
                    <div className="space-y-1.5 mb-3">
                      {item.keyFactors.slice(0, 3).map((factor, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{factor.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-[10px] font-medium",
                              factor.isAcceptable ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {factor.value}
                            </span>
                            {factor.isAcceptable ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Escalation Status */}
                    <div className="flex items-center justify-between border-t border-border pt-2 mb-2">
                      <span className="text-[10px] text-muted-foreground">Escalation:</span>
                      <span className={cn("text-[10px] font-medium", escalationInfo.color)}>
                        {escalationInfo.label}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px] gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
                        <PhoneCall className="h-3 w-3" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px] gap-1 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-900/50 dark:text-sky-400 dark:hover:bg-sky-950/30">
                        <MessageSquare className="h-3 w-3" />
                        SMS
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px] gap-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30">
                        <ArrowUpRight className="h-3 w-3" />
                        Escalate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Unpaid Days Tracker */}
      <motion.div
        variants={fadeInChart}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Unpaid Days Tracker
              </CardTitle>
              <Badge variant="destructive" className="text-[10px]">
                {unpaidTracker.length} rider{unpaidTracker.length !== 1 ? "s" : ""} overdue
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground/70">
              Riders sorted by overdue days — take action before escalation increases
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {unpaidTracker.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mb-3 text-emerald-500" />
                <p className="text-sm font-medium">All riders are up to date</p>
                <p className="text-xs mt-1">No overdue payments to track</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="divide-y divide-border">
                  {unpaidTracker.map((rider) => {
                    const escalationInfo = getEscalationLabel(rider.unpaidDayAction);
                    const owedAmount = rider.unpaidDays * rider.dailyPaymentAmount;

                    return (
                      <div
                        key={rider.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                          rider.unpaidDays >= 3 && "border-l-2 border-l-red-500 bg-red-50/20 dark:bg-red-950/10",
                          rider.unpaidDays >= 2 && rider.unpaidDays < 3 && "border-l-2 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
                        )}
                      >
                        <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                          <AvatarImage src={rider.avatarUrl} alt={`${rider.firstName} ${rider.lastName}`} />
                          <AvatarFallback className="bg-muted text-[10px] font-semibold">
                            {rider.firstName[0]}{rider.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground truncate">
                              {rider.firstName} {rider.lastName}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm font-bold",
                                rider.unpaidDays >= 3
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-amber-600 dark:text-amber-400"
                              )}>
                                {rider.unpaidDays} day{rider.unpaidDays > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">
                                Owed: {formatNaira(owedAmount)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">
                                Rate: {rider.repaymentRate}%
                              </span>
                            </div>
                            <span className={cn("text-[10px] font-medium", escalationInfo.color)}>
                              {escalationInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" title="Initiate Call">
                            <PhoneCall className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-sky-600 hover:text-sky-700" title="Send Warning SMS">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" title="Escalate to Admin">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
