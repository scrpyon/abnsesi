"use client";

import * as React from "react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ScanClient({
  jenisAbsensi,
  defaultJenisId,
}: {
  jenisAbsensi: Array<{ id: number; kode: string; nama: string }>;
  defaultJenisId?: number;
}) {
  const initialJenisId = defaultJenisId ?? jenisAbsensi[0]?.id;
  const [jenisId, setJenisId] = React.useState<string>(
    initialJenisId ? String(initialJenisId) : ""
  );
  const lastScanRef = React.useRef<{ text: string; ts: number } | null>(null);

  React.useEffect(() => {
    if (!jenisId) return;

    let stopped = false;
    let started = false;
    const qr = new Html5Qrcode("qr-reader");

    const start = async () => {
      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            const now = Date.now();
            const last = lastScanRef.current;
            if (last && last.text === decodedText && now - last.ts < 2500) return;
            lastScanRef.current = { text: decodedText, ts: now };

            const res = await fetch("/api/absensi/scan", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                barcode: decodedText,
                jenisAbsensiId: Number(jenisId),
              }),
            });

            const json = (await res.json().catch(() => null)) as
              | { ok: true; siswa: { nis: string; nama: string }; message?: string }
              | { ok: false; message: string }
              | null;

            if (!res.ok || !json || json.ok === false) {
              toast.error(json?.message ?? "Gagal memproses scan.");
              return;
            }

            toast.success(
              json.message ?? `Tercatat: ${json.siswa.nama} (${json.siswa.nis})`,
            );
          },
          () => {
            // ignore per-frame decode errors to keep UI clean
          },
        );
        if (!stopped) started = true;
      } catch {
        if (!stopped) toast.error("Tidak bisa mengakses kamera. Pastikan izin kamera aktif.");
      }
    };

    void start();

    return () => {
      stopped = true;
      const cleanup = async () => {
        if (!started) {
          try {
            qr.clear();
          } catch {
            // ignore
          }
          return;
        }
        try {
          await qr.stop();
        } catch {
          // Scanner already stopped or never fully started (race)
        }
        try {
          qr.clear();
        } catch {
          // ignore
        }
      };
      void cleanup();
    };
  }, [jenisId]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Jenis Absensi</Label>
        <Select value={jenisId} onValueChange={setJenisId}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis" />
          </SelectTrigger>
          <SelectContent>
            {jenisAbsensi.map((j) => (
              <SelectItem key={j.id} value={String(j.id)}>
                {j.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border p-3">
        <div id="qr-reader" />
      </div>

      <p className="text-sm text-muted-foreground">
        Arahkan kamera ke barcode siswa. Sistem akan mencatat kehadiran untuk hari ini.
      </p>
    </div>
  );
}

