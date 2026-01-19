"use client";

import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChatLayoutProps = {
  conversations: ReactNode;
  chat: ReactNode;
  className?: string;
};

export function ChatLayout({ conversations, chat, className }: ChatLayoutProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Conversations Sidebar */}
      <div className="hidden w-80 border-r border-border bg-muted/30 md:block">
        <ScrollArea className="h-full">
          <div className="p-4">{conversations}</div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">{chat}</div>
    </div>
  );
}

type ConversationItemProps = {
  title: string;
  preview?: string;
  isActive?: boolean;
  onClick?: () => void;
};

export function ConversationItem({
  title,
  preview,
  isActive = false,
  onClick,
}: ConversationItemProps) {
  return (
    <Card
      className={cn(
        "mb-2 cursor-pointer transition-colors hover:bg-accent",
        isActive && "bg-accent",
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h3 className="mb-1 truncate font-semibold text-foreground">{title}</h3>
        {preview && (
          <p className="truncate text-sm text-muted-foreground">{preview}</p>
        )}
      </CardContent>
    </Card>
  );
}

