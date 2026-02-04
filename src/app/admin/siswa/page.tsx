import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiswaRowActions } from "@/app/admin/siswa/_components/siswa-row-actions";

export const dynamic = "force-dynamic";

export default async function SiswaListPage() {
  const rawSiswa = await prisma.siswa.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      nis: true,
      nama: true,
      kelas: true,
      barcode: true,
      fotoUrl: true,
      isAktif: true,
      jenisKelamin: true,
      createdAt: true,
    },
  });

  // Generate QR code (barcode) image untuk setiap siswa (default pakai nilai barcode, fallback ke NIS)
  const siswa = await Promise.all(
    rawSiswa.map(async (s) => {
      const value = s.barcode || s.nis;
      let qrDataUrl: string | null = null;
      try {
        qrDataUrl = await QRCode.toDataURL(value, {
          margin: 0,
          width: 96,
        });
      } catch {
        qrDataUrl = null;
      }
      return { ...s, qrDataUrl };
    }),
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Data Siswa</h1>
        <Button asChild>
          <Link href="/admin/siswa/new">Tambah Siswa</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daftar siswa (barcode default = NIS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siswa.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      Belum ada data siswa.
                    </TableCell>
                  </TableRow>
                ) : (
                  siswa.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {s.fotoUrl ? (
                          <div className="relative size-10 overflow-hidden rounded-md border">
                            <Image
                              src={s.fotoUrl}
                              alt={`Foto ${s.nama}`}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="size-10 rounded-md border bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{s.nis}</TableCell>
                      <TableCell>{s.nama}</TableCell>
                      <TableCell>
                        {s.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki"}
                      </TableCell>
                      <TableCell>{s.kelas ?? "-"}</TableCell>
                      <TableCell>{s.isAktif ? "Aktif" : "Nonaktif"}</TableCell>
                      <TableCell className="align-middle">
                        {s.qrDataUrl ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="relative h-16 w-16 overflow-hidden rounded border bg-white">
                              <Image
                                src={s.qrDataUrl}
                                alt={`Barcode ${s.nis}`}
                                fill
                                sizes="64px"
                                className="object-contain"
                              />
                            </div>
                            <span className="block text-[10px] font-mono text-muted-foreground">
                              {s.barcode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">{s.barcode}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <SiswaRowActions siswaId={s.id} isAktif={s.isAktif} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

