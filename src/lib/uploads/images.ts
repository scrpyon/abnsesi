import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const ALLOWED_MIME: Record<string, { ext: string }> = {
  "image/jpeg": { ext: "jpg" },
  "image/png": { ext: "png" },
  "image/webp": { ext: "webp" },
};

export type SaveImageResult = { publicPath: string };

export async function deleteSiswaPhoto(publicPath: string) {
  // Only allow deleting files inside /public/uploads/siswa
  if (!publicPath.startsWith("/uploads/siswa/")) return;

  const rel = publicPath.replace(/^\/uploads\/siswa\//, "");
  if (!rel || rel.includes("..") || rel.includes("/") || rel.includes("\\")) return;

  const absPath = path.join(process.cwd(), "public", "uploads", "siswa", rel);
  await fs.unlink(absPath).catch(() => undefined);
}

export async function saveSiswaPhoto({
  nis,
  file,
}: {
  nis: string;
  file: File;
}): Promise<SaveImageResult> {
  const mime = file.type;
  const rule = ALLOWED_MIME[mime];
  if (!rule) {
    throw new Error("Tipe file tidak didukung. Gunakan JPG/PNG/WebP.");
  }

  // 2MB limit
  const maxBytes = 2 * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error("Ukuran foto maksimal 2MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "siswa");
  await fs.mkdir(uploadDir, { recursive: true });

  const safeNis = nis.replace(/[^a-zA-Z0-9_-]/g, "");
  const suffix = crypto.randomUUID();
  const filename = `${safeNis || "siswa"}-${suffix}.${rule.ext}`;
  const absPath = path.join(uploadDir, filename);

  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, bytes);

  return { publicPath: `/uploads/siswa/${filename}` };
}

