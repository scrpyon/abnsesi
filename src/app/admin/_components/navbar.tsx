"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [jenisAbsensi, setJenisAbsensi] = useState<
    Array<{ id: number; kode: string; nama: string }>
  >([]);

  useEffect(() => {
    fetch("/api/jenis-absensi")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setJenisAbsensi(data.data);
      })
      .catch(() => {});
  }, []);

  const sholat = jenisAbsensi.find((j) => j.kode === "SHOLAT");
  const ngaji = jenisAbsensi.find((j) => j.kode === "NGAJI");

  const navItems = [
    {
      id: "jadwal",
      href: "/admin",
      label: "JADWAL SHOLAT",
      isActive: pathname === "/admin",
    },
    {
      id: "scan-sholat",
      href: sholat ? `/admin/scan?jenis=${sholat.id}` : "/admin/scan",
      label: "SCAN SHOLAT",
      isActive: pathname === "/admin/scan" && searchParams.get("jenis") === String(sholat?.id),
    },
    {
      id: "scan-ngaji",
      href: ngaji ? `/admin/scan?jenis=${ngaji.id}` : "/admin/scan",
      label: "SCAN NGAJI",
      isActive: pathname === "/admin/scan" && searchParams.get("jenis") === String(ngaji?.id),
    },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex w-full items-center justify-center gap-2 px-4 py-3 lg:pr-6">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "rounded-lg px-6 py-2.5 text-sm font-semibold uppercase transition-colors",
              item.isActive
                ? "bg-primary text-white"
                : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
