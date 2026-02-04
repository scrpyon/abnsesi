"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { siswaCreateSchema, siswaUpdateSchema } from "@/lib/validation/siswa";
import { deleteSiswaPhoto, saveSiswaPhoto } from "@/lib/uploads/images";

export type CreateSiswaState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export type UpdateSiswaState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  return session;
}

export async function createSiswaAction(
  _prevState: CreateSiswaState,
  formData: FormData,
): Promise<CreateSiswaState> {
  await requireAdmin();
  const raw = {
    nis: String(formData.get("nis") ?? ""),
    nama: String(formData.get("nama") ?? ""),
    kelas: String(formData.get("kelas") ?? ""),
    fotoUrl: String(formData.get("fotoUrl") ?? ""),
    jenisKelamin: String(formData.get("jenisKelamin") ?? "LAKI_LAKI"),
  };

  const parsed = siswaCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validasi gagal. Periksa input Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { nis, nama, kelas, fotoUrl, jenisKelamin } = parsed.data;

  const foto = formData.get("foto");
  let finalFotoUrl: string | null = fotoUrl || null;

  if (foto instanceof File && foto.size > 0) {
    try {
      const saved = await saveSiswaPhoto({ nis, file: foto });
      finalFotoUrl = saved.publicPath;
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Gagal upload foto.",
      };
    }
  }

  try {
    await prisma.siswa.create({
      data: {
        nis,
        nama,
        kelas: kelas || null,
        fotoUrl: finalFotoUrl,
        barcode: nis,
        jenisKelamin,
      },
      select: { id: true },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        ok: false,
        message: "NIS atau barcode sudah terdaftar.",
      };
    }

    return {
      ok: false,
      message: "Terjadi kesalahan saat menyimpan data siswa.",
    };
  }

  redirect("/admin/siswa");
}

export async function updateSiswaAction(
  siswaId: number,
  _prevState: UpdateSiswaState,
  formData: FormData,
): Promise<UpdateSiswaState> {
  await requireAdmin();

  const raw = {
    nis: String(formData.get("nis") ?? ""),
    nama: String(formData.get("nama") ?? ""),
    kelas: String(formData.get("kelas") ?? ""),
    fotoUrl: String(formData.get("fotoUrl") ?? ""),
    isAktif: String(formData.get("isAktif") ?? "false"),
    jenisKelamin: String(formData.get("jenisKelamin") ?? "LAKI_LAKI"),
  };

  const parsed = siswaUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validasi gagal. Periksa input Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { nis, nama, kelas, fotoUrl, isAktif, jenisKelamin } = parsed.data;

  const existing = await prisma.siswa.findUnique({
    where: { id: siswaId },
    select: { id: true, fotoUrl: true },
  });
  if (!existing) {
    return { ok: false, message: "Siswa tidak ditemukan." };
  }

  const foto = formData.get("foto");
  let finalFotoUrl: string | null = fotoUrl || null;
  let shouldDeleteOldPhoto = false;

  if (foto instanceof File && foto.size > 0) {
    try {
      const saved = await saveSiswaPhoto({ nis, file: foto });
      finalFotoUrl = saved.publicPath;
      shouldDeleteOldPhoto = true;
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Gagal upload foto.",
      };
    }
  }

  try {
    await prisma.siswa.update({
      where: { id: siswaId },
      data: {
        nis,
        nama,
        kelas: kelas || null,
        fotoUrl: finalFotoUrl,
        barcode: nis,
        isAktif,
        jenisKelamin: jenisKelamin ?? "LAKI_LAKI",
      },
      select: { id: true },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, message: "NIS atau barcode sudah terpakai." };
    }
    return { ok: false, message: "Terjadi kesalahan saat mengupdate siswa." };
  }

  if (shouldDeleteOldPhoto && existing.fotoUrl && existing.fotoUrl !== finalFotoUrl) {
    await deleteSiswaPhoto(existing.fotoUrl);
  }

  redirect("/admin/siswa");
}

export async function toggleSiswaAktifAction(siswaId: number) {
  await requireAdmin();

  const siswa = await prisma.siswa.findUnique({
    where: { id: siswaId },
    select: { id: true, isAktif: true },
  });
  if (!siswa) return { ok: false as const, message: "Siswa tidak ditemukan." };

  await prisma.siswa.update({
    where: { id: siswaId },
    data: { isAktif: !siswa.isAktif },
    select: { id: true },
  });

  return { ok: true as const, message: siswa.isAktif ? "Siswa dinonaktifkan." : "Siswa diaktifkan." };
}

export async function deleteSiswaAction(siswaId: number) {
  await requireAdmin();

  const siswa = await prisma.siswa.findUnique({
    where: { id: siswaId },
    select: { id: true, fotoUrl: true },
  });
  if (!siswa) return { ok: false as const, message: "Siswa tidak ditemukan." };

  try {
    await prisma.siswa.delete({ where: { id: siswaId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return {
        ok: false as const,
        message: "Tidak bisa menghapus siswa karena sudah memiliki data absensi. Nonaktifkan saja.",
      };
    }
    return { ok: false as const, message: "Gagal menghapus siswa." };
  }

  if (siswa.fotoUrl) await deleteSiswaPhoto(siswa.fotoUrl);

  return { ok: true as const, message: "Siswa berhasil dihapus." };
}

