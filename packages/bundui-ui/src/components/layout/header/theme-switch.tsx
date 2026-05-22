"use client";

import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./components/ui/button";
import { useThemeConfig } from "./components/theme-customizer";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemeConfig();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    setTheme({ ...theme, mode: newMode });
  };

  return (
    <Button
      size="icon"
      variant="outline"
      className="relative"
      onClick={toggleTheme}>
      {theme.mode === "light" ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
