import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminLayoutClient } from "@/app/admin/_components/admin-layout-client";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <AdminLayoutClient userEmail={session.user.email}>{children}</AdminLayoutClient>
  );
}

