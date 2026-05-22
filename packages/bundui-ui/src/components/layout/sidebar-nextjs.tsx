"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronsUpDown, Home, BarChart3, Settings, Users, FileText, HelpCircle } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "./components/ui/dropdown-menu";
import { ScrollArea } from "./components/ui/scroll-area";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "./components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import Icon from "./components/icon";
import { Button } from "./components/ui/button";
import { useMobile } from "./hooks/use-mobile";

// VibeThink Dashboard Routes - All Available Dashboards
const page_routes = [
  {
    title: "Main Dashboard",
    href: "/",
    items: [
      { title: "Overview", href: "/" },
      { title: "Premium", href: "/premium" },
      { title: "Debug", href: "/debug" }
    ]
  },
  {
    title: "Business Intelligence",
    href: "/business",
    items: [
      { title: "Website Analytics", href: "/website-analytics" },
      { title: "Sales Dashboard", href: "/sales-dashboard" },
      { title: "Finance Dashboard", href: "/finance-dashboard" },
      { title: "CRM Dashboard", href: "/crm-dashboard" },
      { title: "E-commerce", href: "/ecommerce-dashboard" }
    ]
  },
  {
    title: "Specialized Tools",
    href: "/tools",
    items: [
      { title: "Crypto Dashboard", href: "/crypto-dashboard" },
      { title: "POS System", href: "/pos-system" },
      { title: "Project Management", href: "/project-management" },
      { title: "File Manager", href: "/file-manager" }
    ]
  },
  {
    title: "AI & Productivity",
    href: "/ai-productivity",
    items: [
      { title: "AI Chat Assistant", href: "/ai-chat" },
      { title: "Notes App", href: "/notes" },
      { title: "Tasks", href: "/tasks" },
      { title: "Calendar", href: "/calendar" }
    ]
  },
  {
    title: "Communication",
    href: "/communication", 
    items: [
      { title: "Mail", href: "/mail" },
      { title: "Kanban Board", href: "/kanban" }
    ]
  },
  {
    title: "Testing & Dev",
    href: "/dev",
    items: [
      { title: "Test Charts", href: "/test-charts" },
      { title: "Test Page", href: "/test" },
      { title: "Mobile Test", href: "/mobile-test" }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useMobile();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet, setOpen]);

  return (
    <SidebarContainer>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center px-2">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">VibeThink Dashboard</span>
              <span className="text-xs text-muted-foreground">Bundui Premium</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <div className="p-2">
            {page_routes.map((section, index) => (
              <Collapsible key={index} defaultOpen className="group/collapsible">
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="group/label w-full text-sm font-medium text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground data-[state=open]:text-sidebar-foreground [&[data-state=open]>svg]:rotate-90">
                      {section.title}
                      <ChevronRight className="ml-auto transition-transform" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items?.map((item, itemIndex) => (
                          <SidebarMenuItem key={itemIndex}>
                            <SidebarMenuButton asChild isActive={pathname === item.href}>
                              <Link href={item.href}>
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2 text-left font-normal"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                  <Users className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Demo User</span>
                  <span className="text-xs text-muted-foreground">demo@vthink.com</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
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
      </SidebarFooter>
    </SidebarContainer>
  );
}
