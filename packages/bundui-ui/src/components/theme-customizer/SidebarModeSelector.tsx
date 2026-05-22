"use client";

import { Label } from "./components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";
import { useSidebar } from "./components/ui/sidebar";

export function SidebarModeSelector() {
  const { state, setOpen } = useSidebar();

  const handleModeChange = (value: string) => {
    if (value === "full") {
      setOpen(true); // Expand to default mode
    } else if (value === "centered") {
      setOpen(false); // Collapse to icon mode
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Label>Sidebar mode:</Label>
      <ToggleGroup
        type="single"
        value={state === "expanded" ? "full" : "centered"}
        onValueChange={handleModeChange}
        className="*:border-input w-full gap-4 *:rounded-md *:border">
        <ToggleGroupItem variant="outline" value="full">
          Default
        </ToggleGroupItem>
        <ToggleGroupItem
          variant="outline"
          value="centered"
          className="data-[variant=outline]:border-l-1">
          Icon
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
