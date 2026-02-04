import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarcodeActions } from "./barcode-actions";

export const dynamic = "force-dynamic";

export default async function SiswaBarcodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siswaId = Number(id);
  if (!Number.isFinite(siswaId)) notFound();

  const siswa = await prisma.siswa.findUnique({
    where: { id: siswaId },
    select: { id: true, nis: true, nama: true, kelas: true, barcode: true, isAktif: true },
  });
  if (!siswa) notFound();

  const barcodeSrc = `/api/barcode/${encodeURIComponent(siswa.barcode)}`;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Barcode Siswa</h1>
        <Button asChild variant="outline">
          <Link href="/admin/siswa">Kembali</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {siswa.nama} ({siswa.nis})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <div className="rounded-lg border bg-white p-4">
            <div className="relative mx-auto aspect-square w-[260px]">
              <Image
                src={barcodeSrc}
                alt={`Barcode ${siswa.nis}`}
                fill
                sizes="260px"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-3 text-center text-sm text-muted-foreground">
              Nilai barcode: <span className="font-mono text-foreground">{siswa.barcode}</span>
            </div>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>
              Gunakan halaman ini untuk cetak. Untuk hasil terbaik, gunakan kertas A6/A7 atau
              stiker label.
            </p>
            <BarcodeActions barcodeSrc={barcodeSrc} nis={siswa.nis} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

