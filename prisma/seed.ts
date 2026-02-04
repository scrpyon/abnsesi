import bcrypt from "bcryptjs";
import { JenisKelamin } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function seedJenisAbsensi() {
  await prisma.jenisAbsensi.upsert({
    where: { kode: "NGAJI" },
    update: { nama: "Ngaji", isAktif: true },
    create: { kode: "NGAJI", nama: "Ngaji", isAktif: true },
  });

  await prisma.jenisAbsensi.upsert({
    where: { kode: "SHOLAT" },
    update: { nama: "Sholat", isAktif: true },
    create: { kode: "SHOLAT", nama: "Sholat", isAktif: true },
  });
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim() || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin12345";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, name: "Admin", role: "ADMIN", passwordHash },
  });
}

async function seedDummySiswa() {
  // Cek dulu apakah sudah ada data siswa supaya tidak dobel setiap seed.
  const existingCount = await prisma.siswa.count();
  if (existingCount >= 100) {
    console.log(`Skip seed siswa, sudah ada ${existingCount} data.`);
    return;
  }

  const siswaData = Array.from({ length: 100 }).map((_, index) => {
    const nomor = index + 1;
    const nis = `202600${nomor.toString().padStart(3, "0")}`;

    // Selang-seling jenis kelamin.
    const jenisKelamin =
      nomor % 2 === 0 ? JenisKelamin.LAKI_LAKI : JenisKelamin.PEREMPUAN;

    return {
      nis,
      nama: `Siswa Dummy ${nomor}`,
      kelas: `X-${(nomor % 5) + 1}`,
      fotoUrl: null,
      jenisKelamin,
      barcode: nis, // barcode disamakan dengan NIS supaya mudah discan.
      isAktif: true,
    };
  });

  await prisma.siswa.createMany({
    data: siswaData,
    skipDuplicates: true,
  });

  console.log("Berhasil menambah 100 data siswa dummy (atau melengkapi sampai 100).");
}

async function main() {
  await seedJenisAbsensi();
  await seedAdminUser();
  await seedDummySiswa();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

