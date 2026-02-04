"use client";

import * as React from "react";
import { useActionState } from "react";

import { createSiswaAction, type CreateSiswaState } from "../actions";
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

const initialState: CreateSiswaState = { ok: false, message: "" };

export function SiswaCreateForm() {
  const [state, formAction, isPending] = useActionState(createSiswaAction, initialState);
  const [jenisKelamin, setJenisKelamin] = React.useState<"LAKI_LAKI" | "PEREMPUAN">("LAKI_LAKI");

  const handleJenisKelaminChange = React.useCallback((value: string) => {
    if (value === "LAKI_LAKI" || value === "PEREMPUAN") {
      setJenisKelamin(value);
    }
  }, []);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="jenisKelamin" value={jenisKelamin} />
      {state.ok === false && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="nis">NIS</Label>
        <Input id="nis" name="nis" inputMode="numeric" placeholder="Contoh: 12345" required />
        {state.ok === false && state.fieldErrors?.nis?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.nis[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nama">Nama</Label>
        <Input id="nama" name="nama" placeholder="Nama lengkap" required />
        {state.ok === false && state.fieldErrors?.nama?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.nama[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kelas">Kelas (opsional)</Label>
        <Input id="kelas" name="kelas" placeholder="Contoh: 7A" />
        {state.ok === false && state.fieldErrors?.kelas?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.kelas[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
        <Select value={jenisKelamin} onValueChange={handleJenisKelaminChange} required>
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
        <Input id="fotoUrl" name="fotoUrl" placeholder="Misal: /uploads/siswa/12345.jpg" />
        {state.ok === false && state.fieldErrors?.fotoUrl?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.fotoUrl[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="foto">Upload Foto (opsional, max 2MB)</Label>
        <Input id="foto" name="foto" type="file" accept="image/png,image/jpeg,image/webp" />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}

