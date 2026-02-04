"use client";

import * as React from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

const SCANNER_ID = "qr-reader-scan-area";

type CameraStatus = "idle" | "starting" | "active" | "error";

export function ScanArea({
  onScanSuccess,
}: {
  onScanSuccess: (barcode: string) => void;
}) {
  const lastScanRef = React.useRef<{ text: string; ts: number } | null>(null);
  const qrRef = React.useRef<Html5Qrcode | null>(null);
  const [cameraStatus, setCameraStatus] = React.useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = React.useState(false);

  const stopScanner = React.useCallback(async () => {
    const qr = qrRef.current;
    if (!qr) return;

    try {
      await qr.stop();
    } catch {
      // ignore
    }
    try {
      await qr.clear();
    } catch {
      // ignore
    }
    qrRef.current = null;
  }, []);

  const getCameras = React.useCallback(async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      return cameras;
    } catch (err: any) {
      console.error("Error getting cameras:", err);
      throw err;
    }
  }, []);

  const findBackCamera = React.useCallback((cameras: Array<{ id: string; label: string }>) => {
    // Cari kamera belakang berdasarkan label (biasanya mengandung "back", "rear", "environment")
    const backCamera = cameras.find(
      (cam) =>
        cam.label.toLowerCase().includes("back") ||
        cam.label.toLowerCase().includes("rear") ||
        cam.label.toLowerCase().includes("environment") ||
        cam.label.toLowerCase().includes("belakang")
    );
    
    // Jika tidak ditemukan, ambil kamera terakhir (biasanya kamera belakang di mobile)
    return backCamera || cameras[cameras.length - 1];
  }, []);

  const startScannerWithDeviceId = React.useCallback(async (deviceId: string) => {
    try {
      setCameraStatus("starting");
      setErrorMessage(null);

      // Pastikan tidak ada instance lama
      await stopScanner();

      const qr = new Html5Qrcode(SCANNER_ID);
      qrRef.current = qr;

      // Deteksi ukuran layar untuk qrbox yang responsif
      const isMobile = window.innerWidth < 768;
      const qrboxSize = isMobile ? Math.min(window.innerWidth * 0.7, 300) : 250;

      await qr.start(
        deviceId,
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const now = Date.now();
          const last = lastScanRef.current;
          // Debounce scan yang sama dalam 2.5 detik
          if (last && last.text === decodedText && now - last.ts < 2500) return;
          lastScanRef.current = { text: decodedText, ts: now };

          onScanSuccess(decodedText);
        },
        () => {
          // abaikan error per-frame
        },
      );

      setCameraStatus("active");
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      throw { errorMsg, deviceId };
    }
  }, [onScanSuccess, stopScanner]);

  const startScannerWithFacingMode = React.useCallback(async (facingMode: "environment" | "user") => {
    try {
      setCameraStatus("starting");
      setErrorMessage(null);

      await stopScanner();

      const qr = new Html5Qrcode(SCANNER_ID);
      qrRef.current = qr;

      const isMobile = window.innerWidth < 768;
      const qrboxSize = isMobile ? Math.min(window.innerWidth * 0.7, 300) : 250;

      await qr.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const now = Date.now();
          const last = lastScanRef.current;
          if (last && last.text === decodedText && now - last.ts < 2500) return;
          lastScanRef.current = { text: decodedText, ts: now };
          onScanSuccess(decodedText);
        },
        () => {
          // abaikan error per-frame
        },
      );

      setCameraStatus("active");
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      throw { errorMsg, facingMode };
    }
  }, [onScanSuccess, stopScanner]);

  const startScanner = React.useCallback(async () => {
    try {
      // Minta izin kamera terlebih dahulu (untuk mobile)
      // Catatan: Di beberapa browser, getUserMedia harus dipanggil dalam konteks user interaction
      // Jadi kita skip di sini dan biarkan html5-qrcode yang menanganinya

      // Coba dapatkan daftar kamera dan pilih kamera belakang
      const cameras = await getCameras();
      console.log("Available cameras:", cameras);

      if (cameras.length === 0) {
        throw new Error("Tidak ada kamera yang tersedia");
      }

      // Coba gunakan deviceId kamera belakang
      const backCamera = findBackCamera(cameras);
      if (backCamera) {
        console.log("Using back camera:", backCamera.label, backCamera.id);
        try {
          await startScannerWithDeviceId(backCamera.id);
          return;
        } catch (err: any) {
          console.log("Failed with deviceId, trying facingMode...", err);
          // Jika gagal, coba dengan facingMode
        }
      }

      // Fallback: coba dengan facingMode
      try {
        await startScannerWithFacingMode("environment");
        return;
      } catch (err: any) {
        console.log("Failed with environment, trying user camera...", err);
        // Coba kamera depan sebagai fallback terakhir
        try {
          await startScannerWithFacingMode("user");
          return;
        } catch {
          // Jika semua gagal, tampilkan error
        }
      }

      throw new Error("Gagal mengakses kamera");
    } catch (err: any) {
      setCameraStatus("error");
      const errorMsg = err?.errorMsg || err?.message || String(err);
      
      console.error("Camera access error:", errorMsg, err);

      if (errorMsg.includes("Permission denied") || errorMsg.includes("NotAllowedError") || errorMsg.includes("permission") || errorMsg.includes("PermissionDeniedError")) {
        setNeedsPermission(true);
        setErrorMessage("Izin kamera diperlukan. Klik tombol 'Aktifkan Kamera' untuk memberikan izin.");
      } else if (errorMsg.includes("NotFoundError") || errorMsg.includes("no camera") || errorMsg.includes("Tidak ada kamera")) {
        setErrorMessage("Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.");
      } else if (errorMsg.includes("NotReadableError") || errorMsg.includes("could not start video") || errorMsg.includes("in use")) {
        setErrorMessage("Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain yang menggunakan kamera.");
      } else if (errorMsg.includes("OverconstrainedError") || errorMsg.includes("constraint")) {
        setErrorMessage("Konfigurasi kamera tidak didukung. Mencoba kamera lain...");
        // Retry dengan kamera lain setelah delay
        setTimeout(() => {
          void startScanner();
        }, 1000);
        return;
      } else {
        setErrorMessage(`Tidak bisa mengakses kamera: ${errorMsg}. Pastikan izin kamera aktif dan browser mendukung akses kamera.`);
      }
    }
  }, [getCameras, findBackCamera, startScannerWithDeviceId, startScannerWithFacingMode]);

  React.useEffect(() => {
    // Cek apakah browser mendukung getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus("error");
      setErrorMessage("Browser tidak mendukung akses kamera. Gunakan browser modern seperti Chrome atau Safari.");
      return;
    }

    // Cek apakah menggunakan HTTPS atau localhost
    const isSecure = window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isSecure) {
      setCameraStatus("error");
      setErrorMessage("Akses kamera memerlukan HTTPS atau localhost. Pastikan menggunakan koneksi aman.");
      return;
    }

    // Delay kecil untuk memastikan DOM sudah siap
    const timer = setTimeout(() => {
      void startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      void stopScanner();
    };
  }, [startScanner, stopScanner]);

  // Styling tambahan: pastikan hanya satu tampilan (video) terlihat, canvas disembunyikan
  React.useEffect(() => {
    const styleId = "qr-reader-custom-style";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      #${SCANNER_ID} {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
      #${SCANNER_ID} video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }
      /* Sembunyikan canvas bawaan html5-qrcode agar tidak tampak dobel */
      #${SCANNER_ID} canvas {
        display: none !important;
      }
      /* Styling untuk border scanner */
      #${SCANNER_ID}::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        border: 3px solid rgba(34, 197, 94, 0.5);
        border-radius: 12px;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
      }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  const handleRequestPermission = async () => {
    setCameraStatus("starting");
    setErrorMessage(null);
    setNeedsPermission(false);
    
    try {
      // Minta izin kamera secara eksplisit
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop stream langsung karena kita hanya perlu izin
      stream.getTracks().forEach((track) => track.stop());
      
      // Setelah izin diberikan, coba start scanner
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay kecil
      void startScanner();
    } catch (err: any) {
      setCameraStatus("error");
      setNeedsPermission(true);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Izin kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser/perangkat, lalu klik 'Coba Lagi'.");
      } else {
        setErrorMessage(`Gagal meminta izin kamera: ${err.message || String(err)}`);
      }
    }
  };

  const handleRetry = async () => {
    setCameraStatus("idle");
    setErrorMessage(null);
    setNeedsPermission(false);
    void startScanner();
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border bg-gray-50 p-4">
      <div className="relative w-full max-w-xs aspect-square">
        {cameraStatus === "active" && (
          <div id={SCANNER_ID} className="h-full w-full overflow-hidden rounded-lg bg-black" />
        )}
        
        {cameraStatus === "starting" && (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-black">
            <div className="text-center text-white">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto" />
              <p className="text-sm">Memulai kamera...</p>
            </div>
          </div>
        )}

        {cameraStatus === "error" && (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray-900 p-6 text-white">
            <div className="mb-4 text-4xl">📷</div>
            <p className="mb-2 text-center text-xs font-medium leading-relaxed">
              {errorMessage || "Tidak bisa mengakses kamera"}
            </p>
            <div className="mt-4 flex flex-col gap-2 w-full">
              {needsPermission ? (
                <button
                  onClick={handleRequestPermission}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Aktifkan Kamera
                </button>
              ) : null}
              <button
                onClick={handleRetry}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  needsPermission
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Coba Lagi
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Pastikan izin kamera sudah diaktifkan di pengaturan browser/perangkat
              </p>
            </div>
          </div>
        )}

        {cameraStatus === "idle" && (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-black">
            <div className="text-center text-white">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto" />
              <p className="text-sm">Menyiapkan scanner...</p>
            </div>
          </div>
        )}
      </div>
      
      {cameraStatus === "active" && (
        <p className="mt-3 text-center text-xs text-gray-600">
          Arahkan kamera ke barcode siswa
        </p>
      )}
    </div>
  );
}
