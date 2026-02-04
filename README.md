# Absensi Siswa (Ngaji & Sholat) — Barcode

Tech stack:
- Next.js (App Router) + TypeScript (strict)
- MySQL 8.0+ + Prisma ORM
- NextAuth.js v5 (`next-auth@beta`) + Prisma Adapter
- Tailwind CSS + shadcn/ui
- Barcode scanning: `html5-qrcode`

## Setup

1) Salin env

```bash
copy .env.example .env
```

2) Set `DATABASE_URL` (MySQL 8.0+), lalu buat secret auth

```bash
npx auth secret
```

Tempel hasilnya ke `AUTH_SECRET` di `.env`.

3) Migrasi database + seed data awal (jenis absensi + admin)

```bash
npm run db:migrate
npm run db:seed
```

4) Jalankan dev server

```bash
npm run dev
```

Buka `http://localhost:3000`.

Login admin: gunakan `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` dari `.env`.

## Struktur inti

- `prisma/schema.prisma`: schema database (`siswa`, `absensi`, `jenis_absensi`, `users`, `konfigurasi`)
- `src/auth.ts`: konfigurasi NextAuth (Credentials + Prisma adapter)
- `src/middleware.ts`: proteksi RBAC untuk semua route `/admin/*`
- `src/app/admin/*`: area admin (Server Components)
- `src/app/api/absensi/scan/route.ts`: endpoint pencatatan absensi via barcode
- `src/lib/validation/*`: Zod schemas untuk validasi input

## Catatan kamera (barcode scanning)

`html5-qrcode` butuh izin kamera browser. Untuk mobile, idealnya pakai HTTPS (atau localhost saat development).
