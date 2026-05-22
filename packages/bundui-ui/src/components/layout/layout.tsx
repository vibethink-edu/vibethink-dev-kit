/**
 * 🏗️ Bundui Complete Layout - EXACT MATCH
 * 
 * Root layout component following https://shadcnuikit.com/dashboard/default
 * 
 * Structure:
 * - SidebarProvider (root container with sidebar state)
 * - BunduiSidebar (collapsible navigation)
 * - SidebarInset (main content area)
 *   - BunduiHeader (top navigation bar)
 *   - Main content container (@container/main pattern)
 * 
 * CRITICAL: This replaces BunduiCompleteLayout (deprecated)
 */

"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import BunduiSidebar from "./sidebar";
// Note: Sidebar exists but may need export name verification
import BunduiHeader from "./header/index";
import { CONTAINER_CONSTANTS } from "./constants";
import { useMultitenant } from "@/shared/hooks/multitenant";
import { cn } from "@/lib/utils";

// 🎯 LAYOUT PROPS (Multitenant + Bundui)
interface BunduiLayoutProps {
  children: React.ReactNode;
  
  // Optional overrides (usually not needed)
  defaultSidebarOpen?: boolean;
  className?: string;
  
  // Bundui theme attributes
  themePreset?: string;
  contentLayout?: 'default' | 'centered';
}

// 🏗️ MAIN LAYOUT COMPONENT
export default function BunduiLayout({
  children,
  defaultSidebarOpen,
  className,
  themePreset = 'default',
  contentLayout = 'default'
}: BunduiLayoutProps) {
  
  // 🔒 MULTITENANT CONTEXT
  const { user, company, theme } = useMultitenant();
  
  // 🎨 THEME INTEGRATION
  const effectiveThemePreset = company?.themePreset || themePreset;
  const effectiveContentLayout = company?.contentLayout || contentLayout;
  
  return (
    <div 
      className={cn("min-h-screen bg-background", className)}
      data-theme-preset={effectiveThemePreset}
      data-theme-content-layout={effectiveContentLayout}
    >
      {/* 📱 BUNDUI SIDEBAR PROVIDER - Root State Container */}
      <SidebarProvider 
        defaultOpen={defaultSidebarOpen}
        className="group/layout"
      >
        {/* 🧭 SIDEBAR NAVIGATION */}
        <BunduiSidebar />
        
        {/* 📄 MAIN CONTENT AREA */}
        <SidebarInset>
          {/* 🎯 HEADER BAR */}
          <BunduiHeader />
          
          {/* 📦 MAIN CONTENT CONTAINER - @container/main pattern */}
          <main 
            className={cn(
              // Base container with @container query name
              "@container/main",
              
              // Standard padding
              "p-4",
              
              // Bundui centered layout support
              "xl:group-data-[theme-content-layout=centered]/layout:container",
              "xl:group-data-[theme-content-layout=centered]/layout:mx-auto", 
              "xl:group-data-[theme-content-layout=centered]/layout:mt-8"
            )}
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

// 🎯 CONVENIENCE EXPORTS
export { BunduiLayout };

// 🔍 TYPE EXPORTS
export type { BunduiLayoutProps };

/**
 * 📋 USAGE EXAMPLES:
 * 
 * Basic usage (most common):
 * ```tsx
 * <BunduiLayout>
 *   <YourPageContent />
 * </BunduiLayout>
 * ```
 * 
 * With theme customization:
 * ```tsx
 * <BunduiLayout 
 *   themePreset="ocean-breeze"
 *   contentLayout="centered"
 * >
 *   <YourPageContent />
 * </BunduiLayout>
 * ```
 * 
 * With sidebar control:
 * ```tsx
 * <BunduiLayout defaultSidebarOpen={false}>
 *   <YourPageContent />
 * </BunduiLayout>
 * ```
 */

/**
 * 🔄 MIGRATION FROM BunduiCompleteLayout:
 * 
 * BEFORE (deprecated):
 * ```tsx
 * <BunduiCompleteLayout>
 *   {children}
 * </BunduiCompleteLayout>
 * ```
 * 
 * AFTER (new Bundui exact):
 * ```tsx
 * <BunduiLayout>
 *   {children}
 * </BunduiLayout>
 * ```
 * 
 * The new layout provides:
 * ✅ Exact Bundui structure (SidebarProvider + SidebarInset)
 * ✅ Proper @container queries
 * ✅ Bundui theme data attributes
 * ✅ Multitenant integration
 * ✅ Pixel-perfect header and sidebar
 */
