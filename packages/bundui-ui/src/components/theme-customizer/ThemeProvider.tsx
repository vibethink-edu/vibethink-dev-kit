"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, ThemeType, THEMES } from "@/shared/lib/themes";

function setThemeCookie(key: string, value: string | null) {
  if (typeof window === "undefined") return;

  if (!value || value === "default" || value === "none") {
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; ${window.location.protocol === "https:" ? "Secure;" : ""}`;
  } else {
    document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === "https:" ? "Secure;" : ""}`;
  }
}

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function VibeThinkThemeProvider({
  children,
  initialTheme
}: {
  children: ReactNode;
  initialTheme?: ThemeType;
}) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const defaultTheme = initialTheme || DEFAULT_THEME;
    return defaultTheme;
  });

  useEffect(() => {
    
    const root = document.documentElement;
    const body = document.body;

    // Apply theme preset - BUNDUI PREMIUM WAY: Only set data attributes, CSS handles colors
    if (theme.preset !== "default") {
      setThemeCookie("theme_preset", theme.preset);
      body.setAttribute("data-theme-preset", theme.preset);
    } else {
      setThemeCookie("theme_preset", null);
      body.removeAttribute("data-theme-preset");
    }

    // Apply border radius - BUNDUI PREMIUM WAY: Only data attributes, CSS handles values
    setThemeCookie("theme_radius", theme.radius);
    body.setAttribute("data-theme-radius", theme.radius);

    // Apply scale - BUNDUI PREMIUM WAY: Only data attributes, CSS handles values
    setThemeCookie("theme_scale", theme.scale);
    body.setAttribute("data-theme-scale", theme.scale);

    // Apply content layout
    setThemeCookie("theme_content_layout", theme.contentLayout);
    body.setAttribute("data-theme-content-layout", theme.contentLayout);

    // Apply sidebar mode
    if (theme.sidebarMode && theme.sidebarMode !== "default") {
      setThemeCookie("theme_sidebar_mode", theme.sidebarMode);
      body.setAttribute("data-sidebar-mode", theme.sidebarMode);
    } else {
      setThemeCookie("theme_sidebar_mode", null);
      body.removeAttribute("data-sidebar-mode");
    }

    // Apply light/dark mode - BUNDUI PREMIUM WAY
    const applyMode = (mode: string) => {
      // Remove existing classes
      root.classList.remove('light', 'dark');
      
      if (mode === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemPrefersDark ? 'dark' : 'light');
      } else {
        root.classList.add(mode); // 'light' or 'dark' in lowercase
      }
    };

    applyMode(theme.mode);
    setThemeCookie("theme_mode", theme.mode);

    // Listen to system changes if mode is 'system'
    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyMode('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

  }, [theme.preset, theme.radius, theme.scale, theme.contentLayout, theme.sidebarMode, theme.mode]);

  // Logs moved to useEffect to reduce render noise

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within a VibeThinkThemeProvider");
  }
  return context;
}
