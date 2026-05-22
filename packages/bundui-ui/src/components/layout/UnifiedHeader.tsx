"use client";

/**
 * UnifiedHeader - Header único para todos los dashboards
 * Extraído del BunduiCompleteLayout para ser el punto único de control
 * de la barra superior en todo el sistema VibeThink
 */

import React from 'react';
import { Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from './components/ui/dropdown-menu';
import { SidebarTrigger, useSidebar } from './components/ui/sidebar';
import {
  PresetSelector,
  ThemeScaleSelector,
  ThemeRadiusSelector,
  ColorModeSelector,
  ContentLayoutSelector,
  SidebarModeSelector,
  ResetThemeButton,
} from './components/theme-customizer';

export default function UnifiedHeader() {
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 md:gap-4 bg-header/50 backdrop-blur-xl border-b border-header-border text-header-foreground lg:h-[60px] px-4 md:px-6">
      {/* Sidebar Trigger */}
      <SidebarTrigger />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-header-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        {/* Theme Customizer */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative hover:bg-primary/10 hover:text-header-foreground">
              <Settings className="h-4 w-4 animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="shadow-xl bg-background border rounded-lg overflow-y-auto w-80 p-6 max-h-[85vh]"
            align="end"
            side="bottom"
          >
            <div className="space-y-6">
              <div className="pb-2 border-b">
                <h3 className="font-semibold text-base">Theme Customizer</h3>
                <p className="text-sm text-muted-foreground">Customize your dashboard appearance</p>
              </div>
              
              <PresetSelector />
              <ThemeScaleSelector />
              <ThemeRadiusSelector />
              <ColorModeSelector />
              <ContentLayoutSelector />
              <SidebarModeSelector />
              
              <div className="pt-4 border-t">
                <ResetThemeButton />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button variant="outline" size="icon" onClick={toggleTheme} className="hover:bg-primary/10 hover:text-header-foreground">
          {theme === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-header-foreground">
              <Avatar className="h-8 w-8">
                <AvatarFallback>VT</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
