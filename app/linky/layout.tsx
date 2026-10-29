import { AppShell } from "@/components/app-nav";

export default function LinkyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
