import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  tanggalStr: string;
  jenisId: string | number;
  jenisList: Array<{ id: number; kode: string; nama: string }>;
};

export function LaporanFilter({ tanggalStr, jenisId, jenisList }: Props) {
  const jenisIdStr = String(jenisId);

  return (
    <form method="GET" action="/admin/laporan" className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div className="grid gap-2">
        <Label htmlFor="laporan-tanggal">Tanggal</Label>
        <Input
          id="laporan-tanggal"
          type="date"
          name="tanggal"
          defaultValue={tanggalStr}
          className="w-[180px]"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="laporan-jenis">Jenis Absensi</Label>
        <select
          id="laporan-jenis"
          name="jenis"
          defaultValue={jenisIdStr || "all"}
          className={cn(
            "border-input h-9 w-[180px] rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <option value="all">Semua jenis</option>
          {jenisList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nama}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">Terapkan</Button>
    </form>
  );
}
