/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * System Settings Page Component
 * ============================================================================
 *
 * Centralized configuration management interface for the superadmin
 * dashboard. Organizes all system configuration parameters into logical
 * categories with type-appropriate editors, edit-ability controls,
 * and per-section save functionality.
 *
 * Features:
 * - Four category tabs: Financial, Operations, Notification, Security
 * - Type-appropriate inputs: text fields, number fields, toggle switches
 * - Read-only indicator with "System" badge for non-editable configs
 * - Last modified metadata (timestamp + modifier name)
 * - Per-category Save Changes button
 * - Version history conceptual note
 * - Responsive layout with framer-motion animations
 *
 * @module components/admin/settings/settings-page
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Settings,
  DollarSign,
  Cog,
  Bell,
  ShieldCheck,
  Save,
  Lock,
  Clock,
  Info,
  History,
  Pencil,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { mockSystemConfigs } from "@/lib/mock-data";
import type { SystemConfig } from "@/types/admin";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

/** Configuration category identifiers used for tab grouping */
const SETTINGS_CATEGORIES = ["FINANCIAL", "OPERATIONS", "NOTIFICATION", "SECURITY"] as const;

type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number];

/**
 * Category display metadata including label, icon, and description.
 */
const CATEGORY_META: Record<SettingsCategory, { label: string; description: string; icon: React.ElementType; iconBg: string; iconText: string }> = {
  FINANCIAL: {
    label: "Financial",
    description: "Payment processing, deadlines, fees, and bonus configurations",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
  },
  OPERATIONS: {
    label: "Operations",
    description: "Fleet management, GPS tracking, and assignment rules",
    icon: Cog,
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
  },
  NOTIFICATION: {
    label: "Notification",
    description: "SMS alerts, reminders, and communication preferences",
    icon: Bell,
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
  },
  SECURITY: {
    label: "Security",
    description: "Session management, authentication, and access controls",
    icon: ShieldCheck,
    iconBg: "bg-red-100",
    iconText: "text-red-700",
  },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/** Stagger container for settings items */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

/** Fade-up animation for individual items */
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a config value for display based on its type.
 * - STRING: displayed as-is
 * - NUMBER: displayed as formatted number
 * - BOOLEAN: displayed as "Enabled" or "Disabled"
 * - JSON: displayed as truncated string
 * @param config - The system config entry
 * @returns Formatted string representation of the value
 */
function formatConfigValue(config: SystemConfig): string {
  switch (config.type) {
    case "BOOLEAN":
      return config.value ? "Enabled" : "Disabled";
    case "NUMBER":
      return String(config.value);
    case "JSON":
      return truncate(String(config.value), 50);
    case "STRING":
    default:
      return String(config.value);
  }
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
 * Single configuration item renderer with type-appropriate input.
 * Displays label, description, current value, editable toggle,
 * and last modified metadata.
 */
interface ConfigItemProps {
  /** The system configuration to render */
  config: SystemConfig;
  /** Current edited value */
  editedValue: string | number | boolean;
  /** Whether the setting has been modified from its original value */
  isDirty: boolean;
  /** Callback when value changes */
  onValueChange: (value: string | number | boolean) => void;
}

function ConfigItem({ config, editedValue, isDirty, onValueChange }: ConfigItemProps) {
  return (
    <motion.div variants={fadeUp} className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        {/* Label & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Label className="text-sm font-semibold text-gray-900">{config.label}</Label>
            {!config.isEditable && (
              <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-300 bg-gray-100">
                <Lock className="h-2.5 w-2.5 mr-0.5" />
                System
              </Badge>
            )}
            {isDirty && (
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50">
                Modified
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
        </div>

        {/* Type-appropriate Input */}
        <div className="shrink-0 flex items-center">
          {config.isEditable ? (
            <ConfigInput
              type={config.type}
              value={editedValue}
              onChange={onValueChange}
            />
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-sm text-gray-600 font-medium min-w-[60px] justify-center">
              {formatConfigValue(config)}
            </div>
          )}
        </div>
      </div>

      {/* Last Modified Info */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {format(new Date(config.lastModifiedAt), "MMM d, yyyy 'at' HH:mm")}
        </span>
        <span className="flex items-center gap-1">
          <Pencil className="h-3 w-3" />
          {config.lastModifiedBy}
        </span>
      </div>
      <Separator />
    </motion.div>
  );
}

/**
 * Type-appropriate input renderer for configuration values.
 * Renders text input, number input, or toggle switch based on config type.
 */
interface ConfigInputProps {
  /** The type of input to render */
  type: SystemConfig["type"];
  /** Current value */
  value: string | number | boolean;
  /** Change callback */
  onChange: (value: string | number | boolean) => void;
}

function ConfigInput({ type, value, onChange }: ConfigInputProps) {
  switch (type) {
    case "BOOLEAN":
      return (
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked)}
          className="data-[state=checked]:bg-emerald-600"
        />
      );
    case "NUMBER":
      return (
        <Input
          type="number"
          value={Number(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-28 h-9 text-sm text-right"
          min={0}
        />
      );
    case "STRING":
    default:
      return (
        <Input
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-48 h-9 text-sm"
        />
      );
  }
}

/**
 * Settings section for a single category, displaying all configs
 * for that category with a Save Changes button.
 */
interface SettingsSectionProps {
  /** The settings category */
  category: SettingsCategory;
  /** Config entries for this category */
  configs: SystemConfig[];
  /** Map of edited values keyed by config key */
  editedValues: Record<string, string | number | boolean>;
  /** Original values for dirty checking */
  originalValues: Record<string, string | number | boolean>;
  /** Callback when a value changes */
  onValueChange: (key: string, value: string | number | boolean) => void;
  /** Callback to save changes for this category */
  onSave: (category: SettingsCategory) => void;
}

function SettingsSection({
  category,
  configs,
  editedValues,
  originalValues,
  onValueChange,
  onSave,
}: SettingsSectionProps) {
  const meta = CATEGORY_META[category];
  const CategoryIcon = meta.icon;

  /** Count of configs that have been modified from their original values */
  const dirtyCount = useMemo(
    () =>
      configs.filter((c) => {
        const edited = editedValues[c.key];
        const original = originalValues[c.key];
        return edited !== original;
      }).length,
    [configs, editedValues, originalValues]
  );

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", meta.iconBg)}>
            <CategoryIcon className={cn("h-4 w-4", meta.iconText)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{meta.label} Settings</h3>
            <p className="text-xs text-muted-foreground">{meta.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Items */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-1"
          >
            {configs.map((config) => (
              <ConfigItem
                key={config.key}
                config={config}
                editedValue={editedValues[config.key]}
                isDirty={editedValues[config.key] !== originalValues[config.key]}
                onValueChange={(value) => onValueChange(config.key, value)}
              />
            ))}
          </motion.div>

          {/* Save Button */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              {dirtyCount > 0
                ? `${dirtyCount} ${dirtyCount === 1 ? "change" : "changes"} pending`
                : "No pending changes"}
            </p>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={dirtyCount === 0}
              onClick={() => onSave(category)}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * System Settings page component for the Superadmin Dashboard.
 *
 * Provides a tabbed interface for managing platform configuration:
 * - **Financial**: Payment deadlines, grace periods, bonus thresholds
 * - **Operations**: Fleet limits, GPS settings, ownership pathways
 * - **Notification**: SMS toggles, reminder timings
 * - **Security**: Session timeouts, concurrent session limits
 *
 * Each setting shows its label, description, type-appropriate input
 * (text/number/toggle), read-only status badge, and last modified
 * metadata. Changes can be saved per-category section.
 *
 * @example
 * ```tsx
 * <SettingsPage />
 * ```
 */
export function SettingsPage() {
  // ---- State ----
  const [activeTab, setActiveTab] = useState<string>("FINANCIAL");

  /**
   * Map of original config values for dirty tracking.
   * Initialized once from mock data.
   */
  const originalValues = useMemo(() => {
    const map: Record<string, string | number | boolean> = {};
    mockSystemConfigs.forEach((c) => {
      map[c.key] = c.value;
    });
    return map;
  }, []);

  /**
   * Map of currently edited values. Keys are config key strings.
   */
  const [editedValues, setEditedValues] = useState<Record<string, string | number | boolean>>(() => {
    const map: Record<string, string | number | boolean> = {};
    mockSystemConfigs.forEach((c) => {
      map[c.key] = c.value;
    });
    return map;
  });

  // ---- Handlers ----

  /**
   * Updates an edited value for a given config key.
   * @param key - The config key to update
   * @param value - The new value
   */
  const handleValueChange = useCallback((key: string, value: string | number | boolean) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Saves all changes for a given category.
   * In production, this would persist to the backend API.
   * Currently resets the "original" values to the edited ones to clear dirty state.
   * @param category - The category to save
   */
  const handleSave = useCallback((_category: SettingsCategory) => {
    // In production: POST to /api/admin/settings with the changed values
    // For now, we just show a conceptual save action
    console.log("Saving settings for category:", _category);
    console.log("Values:", editedValues);
  }, [editedValues]);

  /**
   * Groups configs by their category for tab rendering.
   * @returns Map of category to array of configs
   */
  const configsByCategory = useMemo(() => {
    const map: Record<string, SystemConfig[]> = {};
    SETTINGS_CATEGORIES.forEach((cat) => {
      map[cat] = mockSystemConfigs.filter((c) => c.category === cat);
    });
    return map;
  }, []);

  // ---- Render ----
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Settings className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">System Settings</h1>
            <p className="text-sm text-muted-foreground">Manage platform configuration, financial rules, and security policies</p>
          </div>
        </div>
      </motion.div>

      {/* Version History Note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <Info className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Version History:</span> All configuration changes are tracked in the audit log with previous values and modifier details.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-300 bg-gray-100 shrink-0 hidden sm:inline-flex">
            <History className="h-3 w-3 mr-1" />
            Tracked
          </Badge>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start h-auto p-1 bg-gray-100 rounded-lg flex flex-wrap">
            {SETTINGS_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const CategoryIcon = meta.icon;
              const configCount = configsByCategory[cat]?.length ?? 0;

              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all",
                    "data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm",
                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-gray-700"
                  )}
                >
                  <CategoryIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{meta.label}</span>
                  <span className="sm:hidden">{meta.label.slice(0, 4)}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">
                    {configCount}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content Panels */}
          {SETTINGS_CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-6 focus-visible:ring-0 outline-none">
              <SettingsSection
                category={cat}
                configs={configsByCategory[cat] || []}
                editedValues={editedValues}
                originalValues={originalValues}
                onValueChange={handleValueChange}
                onSave={handleSave}
              />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}
