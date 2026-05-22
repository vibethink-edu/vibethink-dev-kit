"use client";

import React from "react";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import UnifiedSidebar from "./components/layout/UnifiedSidebar";
import UnifiedHeader from "./components/layout/UnifiedHeader";
import { Toaster } from "./components/ui/sonner";

interface DashboardLayoutCompactProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Layout compacto para dashboard - Versión con menos padding para corregir spacing
 * Idéntico a DashboardLayout pero con padding reducido para igualar al dashboard principal
 */
export default function DashboardLayoutCompact({ 
  children, 
  defaultOpen = true 
}: DashboardLayoutCompactProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <UnifiedSidebar />
      <SidebarInset>
        <UnifiedHeader />
        <div className="flex-1 space-y-4 p-1 md:p-2">
          {children}
        </div>
        <Toaster position="top-center" />
      </SidebarInset>
    </SidebarProvider>
  );
} 
