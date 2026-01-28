import { cookies } from "next/headers";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("sake_role")?.value ?? "f2";
  const user = cookieStore.get("sake_user")?.value ?? "";

  return (
    <DashboardShell role={role} user={user}>
      {children}
    </DashboardShell>
  );
}
