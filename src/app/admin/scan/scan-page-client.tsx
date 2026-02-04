"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SiswaList } from "./_components/siswa-list";
import { SiswaInfo } from "./_components/siswa-info";
import { PilihanWaktu } from "./_components/pilihan-waktu";
import { ScanArea } from "./_components/scan-area";

type Siswa = {
  id: number;
  nis: string;
  nama: string;
  kelas: string | null;
  fotoUrl: string | null;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
};

type JenisAbsensi = {
  id: number;
  kode: string;
  nama: string;
};

export function ScanPageClient({
  jenisAbsensi,
  defaultJenisId,
  jenisKode,
  siswa,
}: {
  jenisAbsensi: JenisAbsensi[];
  defaultJenisId?: number;
  jenisKode?: string;
  siswa: Siswa[];
}) {
  const router = useRouter();
  // Waktu realtime hanya di-set di client setelah mount agar tidak terjadi mismatch SSR
  const [now, setNow] = React.useState<Date | null>(null);
  const [tanggal, setTanggal] = React.useState(() => {
    const today = new Date();
    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  });

  // Update waktu realtime setiap detik (untuk tampilan jam) - hanya di client
  React.useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sinkronkan tanggal (YYYY-MM-DD) dengan waktu realtime
  React.useEffect(() => {
    if (!now) return;
    const t =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    setTanggal(t);
  }, [now]);

  // Pilihan waktu berdasarkan jenis absensi
  const waktuOptions =
    jenisKode === "SHOLAT"
      ? [
          { id: "SUBUH", label: "SUBUH" },
          { id: "DZUHUR", label: "DZUHUR" },
          { id: "ASAR", label: "ASAR" },
          { id: "MAGHRIB", label: "MAGHRIB" },
          { id: "ISYA", label: "ISYA'" },
        ]
      : [
          { id: "PAGI", label: "NGAJI PAGI" },
          { id: "SORE", label: "NGAJI SORE" },
        ];

  const [waktuTerpilih, setWaktuTerpilih] = React.useState(waktuOptions[0]?.id || "");
  const [jenisAbsensiId] = React.useState(defaultJenisId);
  
  // Update waktu options jika jenis berubah
  React.useEffect(() => {
    if (waktuOptions.length > 0 && !waktuOptions.find((o) => o.id === waktuTerpilih)) {
      setWaktuTerpilih(waktuOptions[0].id);
    }
  }, [jenisKode, waktuOptions, waktuTerpilih]);
  const [siswaTerpilih, setSiswaTerpilih] = React.useState<{
    nis: string;
    nama: string;
    kelas: string | null;
    fotoUrl: string | null;
    jenisKelamin?: string;
  } | null>(null);

  // Filter siswa berdasarkan jenis kelamin
  const siswaLaki = siswa.filter((s) => s.jenisKelamin === "LAKI_LAKI");
  const siswaPerempuan = siswa.filter((s) => s.jenisKelamin === "PEREMPUAN");

  const handleScan = async (barcode: string) => {
    if (!jenisAbsensiId) {
      toast.error("Pilih jenis absensi terlebih dahulu");
      return;
    }

    const res = await fetch("/api/absensi/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        barcode,
        jenisAbsensiId,
        tanggal,
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | {
          ok: true;
          siswa: {
            nis: string;
            nama: string;
            kelas?: string | null;
            fotoUrl?: string | null;
            jenisKelamin?: string;
          };
          message?: string;
        }
      | { ok: false; message: string }
      | null;

    if (!res.ok || !json || json.ok === false) {
      const errorMessage =
        json && "message" in json && typeof json.message === "string"
          ? json.message
          : "Gagal memproses scan.";
      toast.error(errorMessage);
      return;
    }

    // Tampilkan data siswa
    const siswaData = siswa.find((s) => s.nis === json.siswa.nis);
    setSiswaTerpilih({
      nis: json.siswa.nis,
      nama: json.siswa.nama,
      kelas: json.siswa.kelas ?? siswaData?.kelas ?? null,
      fotoUrl: json.siswa.fotoUrl ?? siswaData?.fotoUrl ?? null,
      jenisKelamin:
        siswaData?.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki",
    });

    const successMessage =
      "message" in json && typeof json.message === "string"
        ? json.message
        : `Tercatat: ${json.siswa.nama} (${json.siswa.nis})`;
    toast.success(successMessage);
  };

  // Parameter mengikuti bentuk data yang diterima SiswaList (tanpa jenisKelamin)
  const handleSiswaClick = (s: {
    id: number;
    nis: string;
    nama: string;
    kelas: string | null;
    fotoUrl: string | null;
  }) => {
    const fullData = siswa.find((item) => item.id === s.id);

    setSiswaTerpilih({
      nis: s.nis,
      nama: s.nama,
      kelas: s.kelas,
      fotoUrl: s.fotoUrl,
      jenisKelamin:
        fullData?.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki",
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 px-4 py-6 overflow-hidden bg-gray-50">
      {/* Kiri: Daftar Siswa Perempuan */}
      <div className="w-64 shrink-0">
        <SiswaList
          siswa={siswaPerempuan}
          title="Siswa Perempuan"
          onSiswaClick={handleSiswaClick}
          selectedSiswaId={
            siswaTerpilih ? siswa.find((s) => s.nis === siswaTerpilih.nis)?.id : undefined
          }
        />
      </div>

      {/* Tengah: Waktu, Kontrol, dan Scanner */}
      <div className="flex flex-1 flex-col gap-4 min-w-0 overflow-hidden">
        {/* Waktu Realtime (besar & jelas) */}
        <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Waktu sekarang
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {now
              ? now.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "--:--:--"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {now
              ? now.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </p>
        </div>

        {/* Pilihan Waktu Sholat/Ngaji */}
        <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {jenisKode === "SHOLAT" ? "Waktu Sholat" : "Waktu Ngaji"}
          </label>
          <PilihanWaktu
            options={waktuOptions}
            selected={waktuTerpilih}
            onSelect={setWaktuTerpilih}
          />
        </div>

        {/* Scanner + Data Siswa */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-sm">
              <ScanArea onScanSuccess={handleScan} />
            </div>
          </div>

          <div className="shrink-0 w-full max-w-md rounded-2xl bg-white p-4 shadow-sm">
            <SiswaInfo siswa={siswaTerpilih} />
          </div>
        </div>
      </div>

      {/* Kanan: Daftar Siswa Laki-laki */}
      <div className="w-64 shrink-0">
        <SiswaList
          siswa={siswaLaki}
          title="Siswa Laki-laki"
          onSiswaClick={handleSiswaClick}
          selectedSiswaId={
            siswaTerpilih ? siswa.find((s) => s.nis === siswaTerpilih.nis)?.id : undefined
          }
        />
      </div>
    </div>
  );
}
