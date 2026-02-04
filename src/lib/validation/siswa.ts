import { z } from "zod";

export const siswaCreateSchema = z.object({
  nis: z
    .string()
    .trim()
    .min(3, "NIS minimal 3 karakter.")
    .max(32, "NIS maksimal 32 karakter."),
  nama: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(191, "Nama terlalu panjang."),
  kelas: z
    .string()
    .trim()
    .max(64, "Kelas terlalu panjang.")
    .optional()
    .or(z.literal("")),
  fotoUrl: z
    .string()
    .trim()
    .max(512, "URL/path foto terlalu panjang.")
    .optional()
    .or(z.literal("")),
  jenisKelamin: z
    .string()
    .refine((v) => v === "LAKI_LAKI" || v === "PEREMPUAN", {
      message: "Jenis kelamin harus Laki-laki atau Perempuan",
    })
    .transform((v) => v as "LAKI_LAKI" | "PEREMPUAN"),
});

export type SiswaCreateInput = z.infer<typeof siswaCreateSchema>;

export const siswaUpdateSchema = siswaCreateSchema.extend({
  isAktif: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  jenisKelamin: z
    .string()
    .optional()
    .refine((v) => !v || v === "LAKI_LAKI" || v === "PEREMPUAN", {
      message: "Jenis kelamin harus Laki-laki atau Perempuan",
    })
    .transform((v) => (v ? (v as "LAKI_LAKI" | "PEREMPUAN") : undefined)),
});

export type SiswaUpdateInput = z.infer<typeof siswaUpdateSchema>;

