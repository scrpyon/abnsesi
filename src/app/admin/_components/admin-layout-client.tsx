"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { SidebarToggle } from "./sidebar-toggle";
import { Navbar } from "./navbar";

export function AdminLayoutClient({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();
  const isScanPage = pathname === "/admin/scan";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={sidebarOpen ? "lg:pl-64" : "lg:pl-0"}>
        {/* Header hijau dengan hamburger, judul, dan admin - hidden di scan page */}
        {!isScanPage && (
          <>
            <header className="sticky top-0 z-30 bg-primary">
              <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                {/* Hamburger - di dalam header hijau */}
                <SidebarToggle
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
                <h1 className="flex-1 text-center text-lg font-semibold uppercase text-white">
                  Sistem Absensi Santri
                </h1>
                <div className="text-sm font-medium text-white">{userEmail ?? "Admin"}</div>
              </div>
              {/* Garis biru tipis di bawah header */}
              <div className="h-0.5 bg-blue-500" />
            </header>

            {/* Navbar dengan tab: JADWAL SHOLAT, SCAN SHOLAT, SCAN NGAJI */}
            <Navbar />
          </>
        )}

        {/* Main Content */}
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
