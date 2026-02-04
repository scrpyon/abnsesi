"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Siswa = {
  id: number;
  nis: string;
  nama: string;
  kelas: string | null;
  fotoUrl: string | null;
};

export function SiswaList({
  siswa,
  title,
  onSiswaClick,
  selectedSiswaId,
}: {
  siswa: Siswa[];
  title: string;
  onSiswaClick?: (siswa: Siswa) => void;
  selectedSiswaId?: number;
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border bg-gray-50">
      <div className="border-b bg-white px-4 py-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {siswa.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-500">Tidak ada data</p>
        ) : (
          siswa.map((s) => (
            <button
              key={s.id}
              onClick={() => onSiswaClick?.(s)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border bg-white p-2 text-left transition-colors hover:bg-gray-100",
                selectedSiswaId === s.id && "border-primary bg-primary/5"
              )}
            >
              {s.fotoUrl ? (
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md border">
                  <Image
                    src={s.fotoUrl}
                    alt={s.nama}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-10 shrink-0 rounded-md border bg-gray-200" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{s.nama}</p>
                <p className="truncate text-xs text-gray-500">{s.nis}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
