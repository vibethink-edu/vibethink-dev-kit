"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, BarChart3, Users, Settings, Calendar, FileText, CreditCard, MessageCircle, Building2 } from "lucide-react";

import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "./components/ui/sidebar";
import { ScrollArea } from "./components/ui/scroll-area";
import { Button } from "./components/ui/button";

// VibeThink Dashboard - 22+ Complete Sub-Applications
const page_routes = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/",
        icon: Home,
      },
      {
        title: "Analytics",
        href: "/website-analytics-dashboard",
        icon: BarChart3,
      },
      {
        title: "AI Chat",
        href: "/ai-chat-dashboard",
        icon: MessageCircle,
      },
    ]
  },
  {
    title: "Business",
    items: [
      {
        title: "CRM",
        href: "/crm-dashboard",
        icon: Users,
      },
      {
        title: "Sales",
        href: "/sales-dashboard",
        icon: CreditCard,
      },
      {
        title: "E-commerce",
        href: "/ecommerce-dashboard",
        icon: Building2,
      },
      {
        title: "Finance",
        href: "/finance-dashboard",
        icon: CreditCard,
      },
      {
        title: "POS System",
        href: "/pos-system-dashboard",
        icon: CreditCard,
      },
    ]
  },
  {
    title: "Productivity",
    items: [
      {
        title: "Calendar",
        href: "/calendar-dashboard",
        icon: Calendar,
      },
      {
        title: "Tasks",
        href: "/tasks-dashboard",
        icon: FileText,
      },
      {
        title: "Kanban",
        href: "/kanban-dashboard",
        icon: Settings,
      },
      {
        title: "Notes",
        href: "/notes-dashboard",
        icon: FileText,
      },
      {
        title: "Mail",
        href: "/mail-dashboard",
        icon: MessageCircle,
      },
      {
        title: "File Manager",
        href: "/file-manager-dashboard",
        icon: FileText,
      },
    ]
  },
  {
    title: "Management",
    items: [
      {
        title: "Projects",
        href: "/project-management-dashboard",
        icon: Settings,
      },
      {
        title: "Crypto",
        href: "/crypto-dashboard",
        icon: BarChart3,
      },
    ]
  },
  {
    title: "Development",
    items: [
      {
        title: "Test Charts",
        href: "/test-charts",
        icon: BarChart3,
      },
      {
        title: "Debug",
        href: "/debug",
        icon: Settings,
      },
      {
        title: "Mobile Test",
        href: "/mobile-test",
        icon: Settings,
      },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <SidebarContainer collapsible="icon" variant="floating" className="bg-background">
      <SidebarHeader className="items-center justify-center pt-3 transition-all group-data-[collapsible=icon]:pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:text-foreground rounded-none group-data-[collapsible=icon]:px-0! hover:bg-primary/10">
              <Building2 className="h-6 w-6" />
              <div className="truncate font-semibold group-data-[collapsible=icon]:hidden">
                VibeThink Dashboard
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="overflow-hidden">
        <ScrollArea className="h-full">
          {page_routes.map((route, key) => (
            <SidebarGroup key={key}>
              <SidebarGroupLabel className="text-xs tracking-wider uppercase">
                {route.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {route.items.map((item, key) => (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton 
                        asChild
                        isActive={pathname === item.href}
                        className="hover:text-foreground! active:text-foreground! hover:bg-primary/10! active:bg-primary/10!"
                      >
                        <Link href={item.href}>
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Users className="h-4 w-4" />
              <span>Team</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarContainer>
  );
}
