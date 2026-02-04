"use client";

import Image from "next/image";

type SiswaInfo = {
  nis: string;
  nama: string;
  kelas: string | null;
  fotoUrl: string | null;
  jenisKelamin?: string;
};

export function SiswaInfo({ siswa }: { siswa: SiswaInfo | null }) {
  if (!siswa) {
    return (
      <div className="rounded-lg border bg-gray-50 p-4">
        <p className="text-center text-sm text-gray-500">
          Scan barcode siswa untuk menampilkan data
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="flex items-start gap-4">
        {siswa.fotoUrl ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-white">
            <Image
              src={siswa.fotoUrl}
              alt={siswa.nama}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="size-20 shrink-0 rounded-lg border bg-gray-200" />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-xs text-gray-500">NIS</p>
            <p className="text-sm font-semibold text-gray-900">{siswa.nis}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nama</p>
            <p className="text-sm font-semibold text-gray-900">{siswa.nama}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Jenis Kelamin</p>
              <p className="text-sm font-semibold text-gray-900">
                {siswa.jenisKelamin ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kelas</p>
              <p className="text-sm font-semibold text-gray-900">{siswa.kelas ?? "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
