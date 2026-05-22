"use client";

import { DEFAULT_THEME, THEMES } from "@/shared/lib/themes";
import { useThemeConfig } from "../active-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./components/ui/select";
import { Label } from "./components/ui/label";

export function PresetSelector() {
  const { theme, setTheme } = useThemeConfig();

  const handlePreset = (value: string) => {
    setTheme({ ...theme, ...DEFAULT_THEME, preset: value as any });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">
          Theme preset
        </Label>
        <p className="text-xs text-muted-foreground">
          Choose a pre-built theme or create your own.
        </p>
      </div>
      
      <Select value={theme.preset} onValueChange={(value) => handlePreset(value)}>
        <SelectTrigger className="w-full h-10 bg-background/50 border border-border rounded-md hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 focus:ring-1 focus:ring-accent">
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end">
          {THEMES.map((theme) => (
            <SelectItem key={theme.name} value={theme.value}>
              <div className="flex shrink-0 gap-1">
                {theme.colors.map((color, key) => (
                  <span
                    key={key}
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}></span>
                ))}
              </div>
              {theme.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
