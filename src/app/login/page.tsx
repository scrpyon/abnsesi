import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");

  const params = searchParams != null ? await searchParams : {};
  const callbackUrl =
    typeof params?.callbackUrl === "string" && params.callbackUrl.length > 0
      ? params.callbackUrl
      : "/admin";

  const initialError =
    params?.error === "CredentialsSignin"
      ? "Email atau password salah."
      : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Login Admin</CardTitle>
          <CardDescription>Masuk untuk mengelola absensi dan data siswa.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl} initialError={initialError} />
        </CardContent>
      </Card>
    </main>
  );
}

