"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronRight, 
  ChevronsUpDown, 
  Home, 
  BarChart3, 
  Settings, 
  Users, 
  FileText, 
  HelpCircle,
  Menu,
  X,
  Activity,
  Brain,
  Blocks,
  Sparkles
} from "lucide-react";

import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Badge } from "./components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "./components/ui/dropdown-menu";

interface SimpleDashboardLayoutProps {
  children: React.ReactNode;
}

// Navigation configuration
const navigation = [
  {
    title: "Dashboard",
    icon: Home,
    items: [
      { title: "Overview", href: "/" },
      { title: "Analytics", href: "/analytics" },
      { title: "Reports", href: "/reports" }
    ]
  },
  {
    title: "AI Tools", 
    icon: Brain,
    items: [
      { title: "Chat Assistant", href: "/ai/chat" },
      { title: "Document AI", href: "/ai/documents" },
      { title: "Image Generator", href: "/ai/images" }
    ]
  },
  {
    title: "Apps",
    icon: Blocks,
    items: [
      { title: "Calendar", href: "/apps/calendar" },
      { title: "Mail", href: "/apps/mail" },
      { title: "Tasks", href: "/apps/tasks" }
    ]
  },
  {
    title: "Pages",
    icon: FileText,
    items: [
      { title: "Premium", href: "/premium" },
      { title: "Debug", href: "/debug" },
      { title: "Test", href: "/test" },
      { title: "Charts", href: "/test-charts" }
    ]
  },
  {
    title: "Others",
    icon: Sparkles,
    items: [
      { title: "Components", href: "/components" },
      { title: "Blocks", href: "/blocks" },
      { title: "Templates", href: "/templates" }
    ]
  }
];

export default function SimpleDashboardLayout({ children }: SimpleDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    "Dashboard": true,
    "Pages": true
  });
  const pathname = usePathname();

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r border-border bg-muted/20`}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="size-4" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">VibeThink Dashboard</span>
                <span className="text-xs text-muted-foreground">Bundui Premium</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-2">
            {navigation.map((section, index) => (
              <div key={index} className="mb-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium text-muted-foreground"
                  onClick={() => sidebarOpen && toggleSection(section.title)}
                >
                  <section.icon className="mr-2 h-4 w-4" />
                  {sidebarOpen && (
                    <>
                      {section.title}
                      <ChevronRight 
                        className={`ml-auto h-4 w-4 transition-transform ${
                          expandedSections[section.title] ? 'rotate-90' : ''
                        }`} 
                      />
                    </>
                  )}
                </Button>
                
                {sidebarOpen && expandedSections[section.title] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <Link key={itemIndex} href={item.href}>
                        <Button
                          variant={pathname === item.href ? "secondary" : "ghost"}
                          className="w-full justify-start text-sm"
                          size="sm"
                        >
                          {item.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-left font-normal"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                  <Users className="size-4" />
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-medium">Demo User</span>
                      <span className="text-xs text-muted-foreground">demo@vthink.com</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <Users className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 size-4" />
                Help
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ Premium Active
            </Badge>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
