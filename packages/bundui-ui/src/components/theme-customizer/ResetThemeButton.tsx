"use client";

import { Button } from "./components/ui/button";
import { useThemeConfig } from "../active-theme";
import { DEFAULT_THEME } from "@/shared/lib/themes";
import { RotateCcw } from "lucide-react";

export function ResetThemeButton() {
  const { setTheme } = useThemeConfig();

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <h4 className="text-sm font-medium text-foreground">Reset Settings</h4>
        <p className="text-xs text-muted-foreground">
          Restore all theme settings to their default values.
        </p>
      </div>
      
      <Button 
        onClick={handleReset}
        variant="outline" 
        className="w-full h-9 gap-2 bg-background/50 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200 group"
      >
        <RotateCcw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-300" />
        <span className="font-medium">Reset to Default</span>
      </Button>
    </div>
  );
}
