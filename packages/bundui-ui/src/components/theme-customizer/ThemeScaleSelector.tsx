"use client";

import { Label } from "./components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { useThemeConfig } from "../active-theme";
import { BanIcon } from "lucide-react";

export function ThemeScaleSelector() {
  const { theme, setTheme } = useThemeConfig();

  const handleScaleChange = (value: string) => {
    if (value) {
      setTheme({ ...theme, scale: value as any });
    }
  };

  const scaleOptions = [
    { value: "reset", label: <BanIcon className="h-3.5 w-3.5" />, tooltip: "Default scale" },
    { value: "xs", label: "XS", tooltip: "Extra small (95%)" },
    { value: "lg", label: "LG", tooltip: "Large (105%)" }
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="scale" className="text-sm font-medium text-foreground">
          Scale
        </Label>
        <p className="text-xs text-muted-foreground">
          Adjust the overall scale of your components.
        </p>
      </div>
      
      <ToggleGroup
        value={theme.scale}
        type="single"
        onValueChange={handleScaleChange}
        className="grid grid-cols-3 gap-2 w-full"
      >
        {scaleOptions.map((option) => (
          <ToggleGroupItem 
            key={option.value}
            value={option.value}
            className="h-9 px-3 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground text-xs font-medium"
            title={option.tooltip}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
