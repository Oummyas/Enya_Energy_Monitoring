import { AppShell } from "@/components/app-nav";

export default function ConsumptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
