"use client";

import React, { useEffect, useState } from "react";
import { CommandIcon, SearchIcon, icons } from "lucide-react";
import { Input } from "./components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import { DialogHeader, DialogTitle } from "./components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "./components/ui/command";

// VibeThink Dashboard - 22+ Complete Sub-Applications
const page_routes = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", href: "/", icon: "Home" },
      { title: "Analytics", href: "/website-analytics-dashboard", icon: "BarChart3" },
      { title: "AI Chat", href: "/ai-chat-dashboard", icon: "MessageCircle" },
    ]
  },
  {
    title: "Business",
    items: [
      { title: "CRM", href: "/crm-dashboard", icon: "Users" },
      { title: "Sales", href: "/sales-dashboard", icon: "CreditCard" },
      { title: "E-commerce", href: "/ecommerce-dashboard", icon: "Building2" },
      { title: "Finance", href: "/finance-dashboard", icon: "CreditCard" },
      { title: "POS System", href: "/pos-system-dashboard", icon: "CreditCard" },
    ]
  },
  {
    title: "Productivity",
    items: [
      { title: "Calendar", href: "/calendar-dashboard", icon: "Calendar" },
      { title: "Tasks", href: "/tasks-dashboard", icon: "FileText" },
      { title: "Kanban", href: "/kanban-dashboard", icon: "Settings" },
      { title: "Notes", href: "/notes-dashboard", icon: "FileText" },
      { title: "Mail", href: "/mail-dashboard", icon: "Mail" },
      { title: "File Manager", href: "/file-manager-dashboard", icon: "FolderOpen" },
    ]
  },
  {
    title: "Management",
    items: [
      { title: "Projects", href: "/project-management-dashboard", icon: "Briefcase" },
      { title: "Kanban", href: "/kanban-dashboard", icon: "Kanban" },
      { title: "Website Analytics", href: "/website-analytics-dashboard", icon: "Globe" },
      { title: "Crypto", href: "/crypto-dashboard", icon: "Bitcoin" },
    ]
  }
];

type CommandItemProps = {
  item: {
    title: string;
    href: string;
    icon?: string;
  };
};

// MOVER COMPONENTE FUERA DE LA FUNCIÓN PRINCIPAL
const CommandItemComponent: React.FC<CommandItemProps> = ({ item }) => {
  const router = useRouter();
  
  // @ts-expect-error - Lucide icons dynamic import
  const LucideIcon = icons[item.icon];

  return (
    <CommandItem
      onSelect={() => {
        router.push(item.href);
      }}>
      {item.icon && LucideIcon && <LucideIcon className="me-2 h-4 w-4" />}
      <span>{item.title}</span>
    </CommandItem>
  );
};

export default function Search() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="ms-auto lg:me-auto lg:flex-1">
      <div className="relative hidden max-w-sm flex-1 lg:block">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          className="h-9 w-full cursor-pointer rounded-md border pr-4 pl-10 text-sm shadow-xs"
          placeholder="Search..."
          type="search"
          onFocus={() => setOpen(true)}
        />
        <div className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm bg-zinc-200 p-1 font-mono text-xs font-medium sm:flex dark:bg-neutral-700">
          <CommandIcon className="size-3" />
          <span>k</span>
        </div>
      </div>
      <div className="block lg:hidden">
        <Button size="icon" variant="outline" onClick={() => setOpen(true)}>
          <SearchIcon />
        </Button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
        </VisuallyHidden>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {page_routes.map((route) => (
            <React.Fragment key={route.title}>
              <CommandGroup heading={route.title}>
                {route.items.map((item, key) => (
                  <CommandItemComponent key={key} item={item} />
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
