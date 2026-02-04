export function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Format tanggal ke string YYYY-MM-DD (menggunakan waktu lokal) */
export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}/**
 * Konversi string YYYY-MM-DD ke Date untuk disimpan/diquery di DB (MySQL DATE).
 * Pakai tengah hari UTC agar tanggal konsisten di semua timezone.
 */
export function dateStringToDB(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00.000Z");
}