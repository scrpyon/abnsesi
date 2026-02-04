import { prisma } from "@/lib/prisma";
import { ScanPageClient } from "./scan-page-client";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  searchParams,
}: {
  searchParams?: Promise<{ jenis?: string }>;
}) {
  const params = searchParams != null ? await searchParams : {};
  const jenisIdFromUrl = params.jenis ? Number(params.jenis) : null;

  const [jenisAbsensi, siswa] = await Promise.all([
    prisma.jenisAbsensi.findMany({
      where: { isAktif: true },
      select: { id: true, kode: true, nama: true },
      orderBy: [{ kode: "asc" }],
    }),
    prisma.siswa.findMany({
      where: { isAktif: true },
      select: {
        id: true,
        nis: true,
        nama: true,
        kelas: true,
        fotoUrl: true,
        jenisKelamin: true,
      },
      orderBy: [{ nama: "asc" }],
    }),
  ]);

  if (jenisAbsensi.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="rounded-lg border bg-white p-8">
          <p className="text-center text-sm text-gray-500">
            Tidak ada jenis absensi aktif. Jalankan{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5">npm run db:seed</code> untuk membuat
            data awal (Ngaji & Sholat).
          </p>
        </div>
      </div>
    );
  }

  // Tentukan jenis default: dari URL jika valid, atau jenis pertama
  const defaultJenisId =
    jenisIdFromUrl && jenisAbsensi.some((j) => j.id === jenisIdFromUrl)
      ? jenisIdFromUrl
      : jenisAbsensi[0]?.id;

  const jenisKode = jenisAbsensi.find((j) => j.id === defaultJenisId)?.kode;

  return (
    <ScanPageClient
      jenisAbsensi={jenisAbsensi}
      defaultJenisId={defaultJenisId}
      jenisKode={jenisKode}
      siswa={siswa}
    />
  );
}

