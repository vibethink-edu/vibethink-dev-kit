"use client";

import { Label } from "./components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ColorModeSelector() {
  const { theme, setTheme } = useTheme();

  const colorModeOptions = [
    { 
      value: "light", 
      label: "Light", 
      icon: <Sun className="h-3.5 w-3.5" />,
      tooltip: "Light mode"
    },
    { 
      value: "dark", 
      label: "Dark", 
      icon: <Moon className="h-3.5 w-3.5" />,
      tooltip: "Dark mode"
    }
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="colorMode" className="text-sm font-medium text-foreground">
          Color mode
        </Label>
        <p className="text-xs text-muted-foreground">
          Switch between light and dark mode.
        </p>
      </div>
      
      <ToggleGroup
        value={theme}
        type="single"
        onValueChange={(value) => setTheme(value)}
        className="grid grid-cols-2 gap-2 w-full"
      >
        {colorModeOptions.map((option) => (
          <ToggleGroupItem 
            key={option.value}
            value={option.value}
            className="h-9 px-3 flex items-center justify-center gap-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground text-xs font-medium"
            title={option.tooltip}
          >
            {option.icon}
            <span className="text-xs font-medium">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
