/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Profile & Password Update Page Component
 * ============================================================================
 *
 * Profile settings page where all user roles (Admin, FM, FO, Rider) can
 * update their profile information and change their password.
 *
 * Features:
 * - Profile Information card with firstName, lastName, phone, email (read-only)
 * - Change Password card with current/new/confirm password fields
 * - Role and KYC status badges
 * - Save button with loading state and toast notifications
 * - Responsive design matching the existing dashboard dark theme
 * - Uses session data + API for real-time profile management
 *
 * @module components/admin/settings/profile-page
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole, KycStatus } from "@/types/admin";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Role display configuration */
const ROLE_LABELS: Record<string, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "Admin",
  [UserRole.FLEET_MANAGER]: "Fleet Manager",
  [UserRole.FLEET_OWNER]: "Fleet Owner",
  [UserRole.RIDER]: "Rider",
  [UserRole.COMPLIANCE_OFFICER]: "Compliance Officer",
};

/** KYC status display configuration */
const KYC_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  [KycStatus.VERIFIED]: { label: "Verified", variant: "default", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  [KycStatus.PENDING]: { label: "Pending", variant: "secondary", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  [KycStatus.IN_REVIEW]: { label: "In Review", variant: "secondary", className: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  [KycStatus.REJECTED]: { label: "Rejected", variant: "destructive", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  [KycStatus.EXPIRED]: { label: "Expired", variant: "outline", className: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Profile & Password Update page component.
 *
 * Provides two main cards:
 * 1. **Profile Information** — Edit firstName, lastName, phone; view email (read-only)
 * 2. **Change Password** — Current password, new password, confirm password
 *
 * Both cards feature loading states, validation, and toast-style feedback.
 */
export function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  // ---- Profile State ----
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // ---- Password State ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // ---- Initialize form from session ----
  useEffect(() => {
    if (session?.user) {
      setFirstName(session.user.firstName || "");
      setLastName(session.user.lastName || "");
      setPhone(session.user.phone || "");
      setAvatarUrl(session.user.avatarUrl || "");
    }
  }, [session]);

  // ---- Profile Save Handler ----
  const handleProfileSave = useCallback(async () => {
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileSuccess(true);

      // Update session data so the header reflects changes
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          avatarUrl: avatarUrl.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`,
        },
      });

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error: any) {
      setProfileError(error.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  }, [firstName, lastName, phone, avatarUrl, session, updateSession]);

  // ---- Password Change Handler ----
  const handlePasswordChange = useCallback(async () => {
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError("");

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  // ---- Derived values ----
  const userRole = session?.user?.role || "SUPER_ADMIN";
  const kycStatus = session?.user?.kycStatus || "PENDING";
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const kycConfig = KYC_LABELS[kycStatus] || KYC_LABELS.PENDING;

  // Check if profile form has changes
  const hasProfileChanges =
    firstName !== (session?.user?.firstName || "") ||
    lastName !== (session?.user?.lastName || "") ||
    phone !== (session?.user?.phone || "") ||
    avatarUrl !== (session?.user?.avatarUrl || "");

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ---------------------------------------------------------------
          Page Header
          --------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
            <UserCircle className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal information and security settings
            </p>
          </div>
        </div>
      </motion.div>

      {/* ---------------------------------------------------------------
          User Summary Banner
          --------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" />}
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl font-bold text-white">
                  {firstName?.[0] || "U"}
                  {lastName?.[0] || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold">
                  {firstName} {lastName}
                </h2>
                <p className="text-sm text-slate-400">{session?.user?.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {roleLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={kycConfig.className}
                  >
                    {kycConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------------
          Two Column Layout: Profile + Password
          --------------------------------------------------------------- */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ===============================================================
            Profile Information Card
            =============================================================== */}
        <motion.div variants={fadeUp}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/20">
                  <User className="h-4 w-4 text-sky-700 dark:text-sky-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar URL */}
              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-sm font-medium">
                  Avatar URL
                </Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  <Phone className="h-3.5 w-3.5 inline mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  <Mail className="h-3.5 w-3.5 inline mr-1" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ""}
                  readOnly
                  disabled
                  className="h-10 bg-muted/50 cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <Separator />

              {/* Feedback & Save */}
              {profileError && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Profile updated successfully!
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {hasProfileChanges ? "You have unsaved changes" : "No pending changes"}
                </p>
                <Button
                  onClick={handleProfileSave}
                  disabled={profileLoading || !hasProfileChanges}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ===============================================================
            Change Password Card
            =============================================================== */}
        <motion.div variants={fadeUp}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <Lock className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription>Update your account security credentials</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Separator />

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password (min. 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {newPassword && newPassword.length < 8 && (
                  <p className="text-[11px] text-amber-500">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-red-500">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Separator />

              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Password strength</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = getPasswordStrength(newPassword);
                      const isActive = level <= strength;
                      const colors = [
                        "bg-red-500",
                        "bg-orange-500",
                        "bg-amber-500",
                        "bg-emerald-500",
                      ];
                      return (
                        <div
                          key={level}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            isActive ? colors[strength - 1] : "bg-muted"
                          )}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {["Weak", "Fair", "Good", "Strong"][getPasswordStrength(newPassword) - 1] || "Too short"}
                  </p>
                </div>
              )}

              {/* Feedback & Save */}
              {passwordError && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Password changed successfully!
                </div>
              )}

              <div className="flex items-center justify-end">
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    passwordLoading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates password strength score (1-4).
 * - 1: Weak (< 8 chars)
 * - 2: Fair (8+ chars, only lowercase)
 * - 3: Good (8+ chars, mixed case or numbers)
 * - 4: Strong (8+ chars, mixed case, numbers, special chars)
 */
function getPasswordStrength(password: string): number {
  if (password.length < 8) return 1;

  let score = 1;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}
