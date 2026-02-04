import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toDateOnlyString, dateStringToDB } from "@/lib/datetime";

const bodySchema = z.object({
  barcode: z.string().trim().min(1),
  jenisAbsensiId: z.number().int().positive(),
  tanggal: z.union([z.string(), z.date()]).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Payload tidak valid." },
      { status: 400 },
    );
  }

  const { barcode, jenisAbsensiId, tanggal: tanggalInput } = parsed.data;

  const [siswa, jenisAbsensi] = await Promise.all([
    prisma.siswa.findUnique({
      where: { barcode },
      select: {
        id: true,
        nis: true,
        nama: true,
        kelas: true,
        fotoUrl: true,
        jenisKelamin: true,
        isAktif: true,
      },
    }),
    prisma.jenisAbsensi.findUnique({
      where: { id: jenisAbsensiId },
      select: { id: true, nama: true, isAktif: true },
    }),
  ]);

  if (!siswa || !siswa.isAktif) {
    return NextResponse.json(
      { ok: false, message: "Siswa tidak ditemukan / nonaktif." },
      { status: 404 },
    );
  }

  if (!jenisAbsensi || !jenisAbsensi.isAktif) {
    return NextResponse.json(
      { ok: false, message: "Jenis absensi tidak valid." },
      { status: 400 },
    );
  }

  const now = new Date();
  const tanggalStr =
    typeof tanggalInput === "string" && tanggalInput.trim()
      ? tanggalInput.trim()
      : toDateOnlyString(now);
  const tanggal = dateStringToDB(tanggalStr);

  const existing = await prisma.absensi.findUnique({
    where: {
      siswaId_jenisAbsensiId_tanggal: {
        siswaId: siswa.id,
        jenisAbsensiId,
        tanggal,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { ok: false, message: "Absensi hari ini sudah tercatat." },
      { status: 409 },
    );
  }

  await prisma.absensi.create({
    data: {
      siswaId: siswa.id,
      jenisAbsensiId,
      tanggal,
      waktu: now,
      status: "HADIR",
    },
    select: { id: true },
  });

  return NextResponse.json({
    ok: true,
    siswa: {
      nis: siswa.nis,
      nama: siswa.nama,
      kelas: siswa.kelas,
      fotoUrl: siswa.fotoUrl,
      jenisKelamin: siswa.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki",
    },
    message: `${jenisAbsensi.nama}: ${siswa.nama}`,
  });
}

