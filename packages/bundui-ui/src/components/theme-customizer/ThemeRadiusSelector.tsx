"use client";

import { Label } from "./components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { useThemeConfig } from "../active-theme";
import { BanIcon } from "lucide-react";

export function ThemeRadiusSelector() {
  const { theme, setTheme } = useThemeConfig();

  const radiusOptions = [
    { value: "none", label: <BanIcon className="h-3.5 w-3.5" />, tooltip: "No radius" },
    { value: "sm", label: "SM", tooltip: "Small radius" },
    { value: "md", label: "MD", tooltip: "Medium radius" },
    { value: "lg", label: "LG", tooltip: "Large radius" },
    { value: "xl", label: "XL", tooltip: "Extra large radius" }
  ];

  return (
    <div className="flex flex-col gap-4">
      <Label htmlFor="roundedCorner">Radius:</Label>
      <ToggleGroup
        value={theme.radius}
        type="single"
        onValueChange={(value) => setTheme({ ...theme, radius: value as any })}
        className="*:border-input w-full gap-3 *:rounded-md *:border"
      >
        {radiusOptions.map((option) => (
          <ToggleGroupItem 
            key={option.value}
            variant="outline"
            value={option.value}
            className="text-xs data-[variant=outline]:border-l-1"
            title={option.tooltip}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
