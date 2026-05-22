"use client";

import { Label } from "./components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { useThemeConfig } from "../active-theme";
import { LAYOUT_OPTIONS } from "@/shared/lib/themes";
import { Maximize, Square } from "lucide-react";

export function ContentLayoutSelector() {
  const { theme, setTheme } = useThemeConfig();

  const handleLayoutChange = (value: string) => {
    if (value) {
      setTheme({ ...theme, contentLayout: value as any });
    }
  };

  const layoutOptions = [
    { 
      value: "full", 
      label: "Full", 
      icon: <Maximize className="h-3.5 w-3.5" />,
      tooltip: "Full width layout"
    },
    { 
      value: "centered", 
      label: "Centered", 
      icon: <Square className="h-3.5 w-3.5" />,
      tooltip: "Centered content layout"
    }
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">
          Content layout
        </Label>
        <p className="text-xs text-muted-foreground">
          Choose between full width or centered content.
        </p>
      </div>
      
      <ToggleGroup
        value={theme.contentLayout}
        type="single"
        onValueChange={handleLayoutChange}
        className="grid grid-cols-2 gap-2 w-full"
      >
        {layoutOptions.map((option) => (
          <ToggleGroupItem 
            key={option.value}
            value={option.value}
            className="h-9 px-3 flex items-center justify-center gap-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
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
