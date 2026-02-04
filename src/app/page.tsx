import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Aplikasi Absensi Siswa</CardTitle>
          <CardDescription>
            Absensi ngaji & sholat berbasis barcode (admin-only).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {session?.user ? (
              <span>
                Masuk sebagai <span className="font-medium text-foreground">{session.user.email ?? session.user.name ?? "User"}</span>
              </span>
            ) : (
              <span>Silakan login untuk mengakses dashboard.</span>
            )}
          </div>

          <div className="flex gap-2">
            {isAdmin ? (
              <Button asChild>
                <Link href="/admin">Buka Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Login Admin</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
