"use client";

import * as React from "react";
import { Check, Plus, Send } from "lucide-react";

import { cn } from "./lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "./components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";

const users = [
  {
    name: "Olivia Martin",
    email: "m@example.com",
    avatar: `https://bundui-images.netlify.app/avatars/01.png`
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: `https://bundui-images.netlify.app/avatars/07.png`
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    avatar: `https://bundui-images.netlify.app/avatars/02.png`
  },
  {
    name: "Jackson Lee",
    email: "lee@example.com",
    avatar: `https://bundui-images.netlify.app/avatars/09.png`
  },
  {
    name: "William Kim",
    email: "will@email.com",
    avatar: `https://bundui-images.netlify.app/avatars/06.png`
  }
] as const;

type User = (typeof users)[number];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  const [messages, setMessages] = React.useState([
    {
      role: "agent",
      content: "Hi, how can I help you today?"
    },
    {
      role: "user",
      content: "Hey, I'm having trouble with my account."
    },
    {
      role: "agent",
      content: "What seems to be the problem?"
    },
    {
      role: "user",
      content: "I can't log in."
    }
  ]);
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://bundui-images.netlify.app/avatars/04.png`} />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm leading-none font-medium">Sofia Davis</p>
              <p className="text-muted-foreground text-sm">m@example.com</p>
            </div>
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add user to chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}>
                {message.content}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              disabled={inputLength === 0}
              onClick={() => {
                if (inputLength === 0) return;
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "user",
                    content: input
                  }
                ]);
                setInput("");
              }}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-6 pb-4 pt-6">
            <DialogTitle>Add users to chat</DialogTitle>
            <DialogDescription>
              Add users to your chat to start a conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col overflow-hidden rounded-t-[inherit]">
            <Command className="overflow-hidden rounded-t-none">
              <CommandInput placeholder="Search users..." />
              <CommandList className="max-h-[200px] overflow-auto">
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup className="p-2">
                  {users.map((user) => {
                    const isSelected = selectedUsers.includes(user);
                    return (
                      <CommandItem
                        key={user.email}
                        onSelect={() => {
                          if (isSelected) {
                            setSelectedUsers(selectedUsers.filter((u) => u !== user));
                          } else {
                            setSelectedUsers([...selectedUsers, user]);
                          }
                        }}>
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}>
                          <Check className={cn("h-4 w-4")} />
                        </div>
                        <Avatar className="mr-2 h-6 w-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span className="ml-2 text-muted-foreground">{user.email}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
          <DialogFooter className="flex items-center border-t px-6 py-4">
            <div className="flex flex-1 items-center justify-start">
              <p className="text-sm text-muted-foreground">
                {selectedUsers.length} of {users.length} users selected.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUsers([]);
                setOpen(false);
              }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
              }}>
              Add to chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


