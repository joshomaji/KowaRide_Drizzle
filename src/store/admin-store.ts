/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Global State Management (Zustand Store)
 * ============================================================================
 *
 * This store manages the global application state for the Superadmin dashboard.
 * It handles sidebar collapse state, active navigation section, data filters,
 * and notification state.
 *
 * @module store/admin-store
 * @version 1.0.0
 * @author Kowa Ride Engineering Team
 * ============================================================================
 */

import { create } from "zustand";
import { AdminSection } from "@/types/admin";

// ============================================================================
// STORE INTERFACES
// ============================================================================

/** Sidebar state and navigation management */
interface NavigationState {
  /** Current active section in the admin panel */
  activeSection: AdminSection;
  /** Whether the sidebar is in collapsed (icon-only) mode */
  sidebarCollapsed: boolean;
  /** Whether the mobile sidebar overlay is open */
  mobileSidebarOpen: boolean;
}

/** Search and filter state */
interface FilterState {
  /** Global search query string */
  searchQuery: string;
  /** Date range filter for data tables and charts */
  dateRange: { from: Date | null; to: Date | null };
}

/** Notification state */
interface NotificationState {
  /** Number of unread notifications/alerts */
  unreadCount: number;
}

/** Combined admin store state */
export interface AdminStore {
  // Navigation
  activeSection: AdminSection;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;

  // Filters
  searchQuery: string;
  dateRange: { from: Date | null; to: Date | null };

  // Notifications
  unreadCount: number;

  // Navigation Actions
  setActiveSection: (section: AdminSection) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // Filter Actions
  setSearchQuery: (query: string) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;

  // Notification Actions
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

/**
 * Primary Zustand store for the Superadmin dashboard.
 *
 * Usage:
 * ```typescript
 * const { activeSection, setActiveSection } = useAdminStore();
 * ```
 */
export const useAdminStore = create<AdminStore>((set) => ({
  // ------------------------------------------------------------------
  // Initial State
  // ------------------------------------------------------------------
  activeSection: AdminSection.OVERVIEW,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  searchQuery: "",
  dateRange: { from: null, to: null },
  unreadCount: 7,

  // ------------------------------------------------------------------
  // Navigation Actions
  // ------------------------------------------------------------------

  /** Switch the active admin section */
  setActiveSection: (section) =>
    set({ activeSection: section, mobileSidebarOpen: false }),

  /** Toggle sidebar between expanded and collapsed states */
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  /** Explicitly set sidebar collapsed state (useful for responsive behavior) */
  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  /** Open/close the mobile sidebar overlay */
  setMobileSidebarOpen: (open) =>
    set({ mobileSidebarOpen: open }),

  // ------------------------------------------------------------------
  // Filter Actions
  // ------------------------------------------------------------------

  /** Update the global search query */
  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  /** Update the date range filter */
  setDateRange: (range) =>
    set({ dateRange: range }),

  // ------------------------------------------------------------------
  // Notification Actions
  // ------------------------------------------------------------------

  /** Set the total unread notification count */
  setUnreadCount: (count) =>
    set({ unreadCount: count }),

  /** Decrement unread count by 1 (after viewing a notification) */
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
