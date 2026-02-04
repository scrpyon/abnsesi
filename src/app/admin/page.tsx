import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// Jadwal sholat default (bisa diubah sesuai kebutuhan)
const jadwalSholat = [
  { nama: "Subuh", waktu: "04:30" },
  { nama: "Dzuhur", waktu: "12:00" },
  { nama: "Ashar", waktu: "15:30" },
  { nama: "Maghrib", waktu: "18:00" },
  { nama: "Isya", waktu: "19:30" },
];

export default async function AdminDashboardPage() {
  const today = new Date();
  const hariIni = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <Card className="w-full max-w-4xl rounded-3xl border-0 bg-gray-100 shadow-lg">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Jadwal Sholat</h2>
            <p className="text-sm text-gray-600">{hariIni}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jadwalSholat.map((sholat) => (
              <div
                key={sholat.nama}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{sholat.nama}</h3>
                <p className="text-3xl font-bold text-primary">{sholat.waktu}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-600">
              Jadwal sholat dapat diubah melalui menu konfigurasi
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

