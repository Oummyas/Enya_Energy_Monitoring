import { AppShell } from "@/components/app-nav";

export default function ApartmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
