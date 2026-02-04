import { prisma } from "@/lib/prisma";
import { toDateOnly, dateStringToDB } from "@/lib/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LaporanFilter } from "./_components/laporan-filter";

export const dynamic = "force-dynamic";

function formatWaktu(date: Date) {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams?: Promise<{ tanggal?: string; jenis?: string }>;
}) {
  const params = searchParams != null ? await searchParams : {};
  const today = toDateOnly(new Date());
  const tanggalParam = params.tanggal?.trim();
  const parsedDate = tanggalParam
    ? (() => {
        const d = new Date(tanggalParam);
        return isNaN(d.getTime()) ? today : toDateOnly(d);
      })()
    : today;
  const rawJenis = params.jenis?.trim();
  const jenisIdParam =
    rawJenis && rawJenis !== "all" ? Number(rawJenis) : null;
  const filterJenisId =
    jenisIdParam != null && !Number.isNaN(jenisIdParam) ? jenisIdParam : "";
  const tanggalStr =
    parsedDate.getFullYear() +
    "-" +
    String(parsedDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(parsedDate.getDate()).padStart(2, "0");

  // Query dengan tanggal yang dinormalisasi (timezone-safe untuk MySQL DATE)
  const tanggalForQuery = dateStringToDB(tanggalStr);

  const [jenisList, absensi] = await Promise.all([
    prisma.jenisAbsensi.findMany({
      where: { isAktif: true },
      select: { id: true, kode: true, nama: true },
      orderBy: [{ kode: "asc" }],
    }),
    prisma.absensi.findMany({
      where: {
        tanggal: tanggalForQuery,
        ...(jenisIdParam && jenisIdParam > 0 ? { jenisAbsensiId: jenisIdParam } : {}),
      },
      orderBy: [{ waktu: "asc" }],
      select: {
        id: true,
        waktu: true,
        status: true,
        siswa: { select: { nis: true, nama: true, kelas: true } },
        jenisAbsensi: { select: { nama: true } },
      },
    }),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-xl font-semibold">Laporan Absensi</h1>
        <p className="text-sm text-muted-foreground">
          Lihat daftar kehadiran per tanggal dan jenis absensi.
        </p>
      </div>

      <LaporanFilter
        tanggalStr={tanggalStr}
        jenisId={filterJenisId}
        jenisList={jenisList}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daftar kehadiran — {parsedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {jenisIdParam && jenisIdParam > 0
              ? ` — ${jenisList.find((j) => j.id === jenisIdParam)?.nama ?? ""}`
              : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absensi.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      Tidak ada data absensi untuk filter ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  absensi.map((a, i) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{a.siswa.nis}</TableCell>
                      <TableCell>{a.siswa.nama}</TableCell>
                      <TableCell>{a.siswa.kelas ?? "-"}</TableCell>
                      <TableCell>{a.jenisAbsensi.nama}</TableCell>
                      <TableCell>{formatWaktu(a.waktu)}</TableCell>
                      <TableCell>{a.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {absensi.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Total: {absensi.length} catatan.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
