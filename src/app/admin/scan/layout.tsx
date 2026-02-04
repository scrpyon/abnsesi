"use client";

import * as React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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

  const jenisId = searchParams.get("jenis") ? Number(searchParams.get("jenis")) : null;
  const jenis = jenisAbsensi.find((j) => j.id === jenisId);
  const title = jenis?.kode === "SHOLAT" ? "ABSENSI SHOLAT" : "ABSENSI NGAJI";

  return (
    <>
      {/* Header khusus untuk scan page - menggantikan header default */}
      <header className="sticky top-0 z-30 bg-primary">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-primary/80"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-semibold uppercase text-white">
            {title}
          </h1>
          <div className="w-10" /> {/* Spacer untuk balance */}
        </div>
        <div className="h-0.5 bg-blue-500" />
      </header>
      {children}
    </>
  );
}
