"use client";

import { Button } from "@/components/ui/button";

export function BarcodeActions({ barcodeSrc, nis }: { barcodeSrc: string; nis: string }) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={() => {
          window.print();
        }}
      >
        Cetak
      </Button>
      <Button asChild variant="outline">
        <a href={barcodeSrc} download={`barcode-${nis}.png`}>
          Download PNG
        </a>
      </Button>
    </div>
  );
}

