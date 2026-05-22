"use client";

/**
 * UnifiedSidebar - Sidebar único para todos los dashboards
 * Usa configuración central de navigation.ts para single point of control
 * IMPORTANTE: NO afecta el dashboard principal que sigue independiente
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, User } from 'lucide-react';

// Configuración central de navegación
import { navigationConfig, appInfo } from '@/shared/config/navigation';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './components/ui/collapsible';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Sidebar,
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
} from './components/ui/sidebar';

export default function UnifiedSidebar() {
  const pathname = usePathname();
  
  // Estados para submenus dinámicos
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});
  
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  
  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-background">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">{appInfo.logo}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{appInfo.name}</span>
                <span className="truncate text-xs">{appInfo.subtitle}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <ScrollArea className="h-full">
          {/* Secciones dinámicas basadas en la configuración */}
          {navigationConfig.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="text-xs tracking-wider uppercase group-data-[collapsible=icon]:hidden">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {section.items.map((item) => {
                    const isExpanded = expandedSections[`${section.label}-${item.label}`];
                    
                    if (item.submenu && item.submenu.length > 0) {
                      return (
                        <SidebarMenuItem key={item.href}>
                          <Collapsible 
                            open={isExpanded} 
                            onOpenChange={() => toggleSection(`${section.label}-${item.label}`)}
                            className="group/collapsible"
                          >
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton 
                                className="hover:text-foreground active:text-foreground hover:bg-primary/10 active:bg-primary/10"
                                tooltip={item.tooltip}
                              >
                                <item.icon className="h-4 w-4" />
                                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 expand-icon ${isExpanded ? 'rotate-180' : ''}`} />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.submenu.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.href}>
                                    <SidebarMenuSubButton asChild className="w-full cursor-pointer">
                                      {subItem.href.startsWith('http') ? (
                                        <a href={subItem.href} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2">
                                          <subItem.icon className="h-3 w-3" />
                                          <span>{subItem.label}</span>
                                        </a>
                                      ) : (
                                        <Link href={subItem.href} className="w-full flex items-center gap-2">
                                          <subItem.icon className="h-3 w-3" />
                                          <span>{subItem.label}</span>
                                        </Link>
                                      )}
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuItem>
                      );
                    }
                    
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild
                          className={`hover:text-foreground active:text-foreground hover:bg-primary/10 active:bg-primary/10 w-full cursor-pointer ${item.badge ? 'justify-between' : ''}`}
                          tooltip={item.tooltip}
                        >
                          <Link href={item.href} className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className={`text-xs rounded-sm px-1.5 py-0.5 pointer-events-none ${
                                item.badge === 'New' 
                                  ? 'bg-blue-500 text-white' 
                                  : item.badge === '4'
                                  ? 'bg-primary text-primary-foreground rounded-full px-1.5'
                                  : 'bg-blue-500 text-white'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="hover:text-foreground active:text-foreground hover:bg-primary/10 active:bg-primary/10"
              tooltip="User Settings"
            >
              <User className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">VibeThink User</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
