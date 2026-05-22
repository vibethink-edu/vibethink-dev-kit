"use client";

import React from "react";
import { BellIcon } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "./components/ui/dropdown-menu";

// Mock notifications data
const notifications = [
  { id: 1, title: "New message", desc: "You have a new message", date: "2 min ago", unread: true },
  { id: 2, title: "System update", desc: "System will be updated", date: "1 hour ago", unread: false },
  { id: 3, title: "New user", desc: "New user registered", date: "2 hours ago", unread: true },
];

export default function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="relative">
          <BellIcon />
          <span className="bg-destructive absolute -end-0.5 -top-0.5 block size-2 shrink-0 rounded-full"></span>
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="font-medium">Notifications</div>
        </DropdownMenuLabel>
        {notifications.map((item) => (
          <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-1 p-4">
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-muted-foreground text-xs">{item.desc}</div>
            <div className="text-muted-foreground text-xs">{item.date}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
