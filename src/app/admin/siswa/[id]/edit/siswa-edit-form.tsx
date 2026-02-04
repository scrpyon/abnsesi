"use client";

import * as React from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UpdateSiswaState } from "../../actions";
import { updateSiswaAction } from "../../actions";

const initialState: UpdateSiswaState = { ok: false, message: "" };

export function SiswaEditForm({
  siswaId,
  defaultValues,
}: {
  siswaId: number;
  defaultValues: {
    nis: string;
    nama: string;
    kelas: string | null;
    fotoUrl: string | null;
    isAktif: boolean;
    jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  };
}) {
  const boundAction = React.useMemo(() => updateSiswaAction.bind(null, siswaId), [siswaId]);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [jenisKelamin, setJenisKelamin] = React.useState(defaultValues.jenisKelamin);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="jenisKelamin" value={jenisKelamin} />
      {state.ok === false && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="nis">NIS</Label>
        <Input
          id="nis"
          name="nis"
          inputMode="numeric"
          defaultValue={defaultValues.nis}
          required
        />
        {state.ok === false && state.fieldErrors?.nis?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.nis[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nama">Nama</Label>
        <Input id="nama" name="nama" defaultValue={defaultValues.nama} required />
        {state.ok === false && state.fieldErrors?.nama?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.nama[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kelas">Kelas (opsional)</Label>
        <Input id="kelas" name="kelas" defaultValue={defaultValues.kelas ?? ""} />
        {state.ok === false && state.fieldErrors?.kelas?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.kelas[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
        <Select value={jenisKelamin} onValueChange={setJenisKelamin} required>
          <SelectTrigger id="jenisKelamin">
            <SelectValue placeholder="Pilih jenis kelamin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
            <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
          </SelectContent>
        </Select>
        {state.ok === false && state.fieldErrors?.jenisKelamin?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.jenisKelamin[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fotoUrl">Foto URL/Path (opsional)</Label>
        <Input id="fotoUrl" name="fotoUrl" defaultValue={defaultValues.fotoUrl ?? ""} />
        {state.ok === false && state.fieldErrors?.fotoUrl?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.fotoUrl[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="foto">Ganti Foto (opsional, max 2MB)</Label>
        <Input id="foto" name="foto" type="file" accept="image/png,image/jpeg,image/webp" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAktif"
          value="true"
          defaultChecked={defaultValues.isAktif}
          className="size-4"
        />
        Aktif
      </label>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}

