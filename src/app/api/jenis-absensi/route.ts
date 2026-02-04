import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const jenisAbsensi = await prisma.jenisAbsensi.findMany({
    where: { isAktif: true },
    select: { id: true, kode: true, nama: true },
    orderBy: [{ kode: "asc" }],
  });

  return NextResponse.json({ ok: true, data: jenisAbsensi });
}
