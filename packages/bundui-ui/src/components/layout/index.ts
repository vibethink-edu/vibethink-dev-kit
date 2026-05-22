/**
 * 🏗️ Bundui Layout Components - Export Index
 *
 * Central export point for all Bundui layout components
 * following https://shadcnuikit.com/dashboard/default structure
 */

// 🏗️ MAIN LAYOUT SYSTEM
export { default as BunduiLayout, BunduiLayout as default } from "./layout";
export type { BunduiLayoutProps } from "./layout";

// 🎯 HEADER COMPONENTS
export { default as BunduiHeader } from "./header";
export type { BunduiHeaderProps } from "./header";

// 🧭 SIDEBAR COMPONENT
export { default as BunduiSidebar } from "./sidebar";

// 📐 LAYOUT CONSTANTS
export * from "./constants";

// 🔍 HEADER SUB-COMPONENTS
export { default as BunduiSearch } from "./header/search";
export { default as BunduiUserMenu } from "./header/user-menu";
export { default as BunduiThemeSwitch } from "./header/theme-switch";
export { default as BunduiNotifications } from "./header/notifications";

/**
 * 📋 USAGE EXAMPLES:
 *
 * Full layout system:
 * ```tsx
 * import { BunduiLayout } from '@/shared/components/bundui-premium/components/layout';
 *
 * <BunduiLayout>
 *   <YourPageContent />
 * </BunduiLayout>
 * ```
 *
 * Individual components:
 * ```tsx
 * import { BunduiHeader, BunduiSidebar } from '@/shared/components/bundui-premium/components/layout';
 * ```
 *
 * Header sub-components:
 * ```tsx
 * import { BunduiSearch, BunduiUserMenu } from '@/shared/components/bundui-premium/components/layout';
 * ```
 *
 * Constants:
 * ```tsx
 * import { HEADER_CONSTANTS, SIDEBAR_CONSTANTS } from '@/shared/components/bundui-premium/components/layout';
 * ```
 */
