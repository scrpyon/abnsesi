import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiswaEditForm } from "./siswa-edit-form";

export const dynamic = "force-dynamic";

export default async function SiswaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siswaId = Number(id);
  if (!Number.isFinite(siswaId)) notFound();

  const siswa = await prisma.siswa.findUnique({
    where: { id: siswaId },
    select: {
      id: true,
      nis: true,
      nama: true,
      kelas: true,
      fotoUrl: true,
      isAktif: true,
      jenisKelamin: true,
    },
  });
  if (!siswa) notFound();

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Siswa</h1>
        <Button asChild variant="outline">
          <Link href="/admin/siswa">Kembali</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{siswa.nama}</CardTitle>
          <CardDescription>Ubah data siswa dan foto (opsional).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-3">
            <div className="text-sm font-medium">Foto saat ini</div>
            {siswa.fotoUrl ? (
              <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-lg border">
                <Image
                  src={siswa.fotoUrl}
                  alt={`Foto ${siswa.nama}`}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square w-full max-w-[240px] rounded-lg border bg-muted" />
            )}
          </div>

          <SiswaEditForm
            siswaId={siswa.id}
            defaultValues={{
              nis: siswa.nis,
              nama: siswa.nama,
              kelas: siswa.kelas,
              fotoUrl: siswa.fotoUrl,
              isAktif: siswa.isAktif,
              jenisKelamin: siswa.jenisKelamin,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

