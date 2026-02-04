import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiswaCreateForm } from "./siswa-create-form";

export default function SiswaCreatePage() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tambah Siswa</h1>
        <Button asChild variant="outline">
          <Link href="/admin/siswa">Kembali</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Siswa</CardTitle>
          <CardDescription>Barcode otomatis mengikuti NIS.</CardDescription>
        </CardHeader>
        <CardContent>
          <SiswaCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}

