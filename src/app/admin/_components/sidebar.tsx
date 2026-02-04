"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Users, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin/siswa", label: "Data Siswa", icon: Users },
    { href: "/admin/laporan", label: "Laporan", icon: FileText },
  ];

  return (
    <>

      {/* Overlay - hanya di mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar - Desktop: toggle, Mobile: toggle */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 transform border-r bg-card transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header Sidebar */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onToggle}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    onToggle();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
