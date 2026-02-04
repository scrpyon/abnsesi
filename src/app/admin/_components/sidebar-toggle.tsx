"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SidebarToggle({
  isOpen,
  onToggle,
  className,
}: {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-white hover:bg-primary/80", className)}
      onClick={onToggle}
      aria-label="Toggle menu"
    >
      {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </Button>
  );
}
