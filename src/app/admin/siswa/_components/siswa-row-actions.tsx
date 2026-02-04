"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { deleteSiswaAction, toggleSiswaAktifAction } from "../actions";

export function SiswaRowActions({
  siswaId,
  isAktif,
}: {
  siswaId: number;
  isAktif: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const onToggle = () => {
    startTransition(async () => {
      const res = await toggleSiswaAktifAction(siswaId);
      if (!res.ok) toast.error(res.message);
      else toast.success(res.message);
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!confirm("Hapus siswa ini? (Jika sudah ada absensi, penghapusan akan ditolak.)")) return;
    startTransition(async () => {
      const res = await deleteSiswaAction(siswaId);
      if (!res.ok) toast.error(res.message);
      else toast.success(res.message);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={pending}>
          Aksi
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/siswa/${siswaId}/barcode`}>Barcode</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/siswa/${siswaId}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={onToggle}>
          {isAktif ? "Nonaktifkan" : "Aktifkan"}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => e.preventDefault()}
          onClick={onDelete}
        >
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

