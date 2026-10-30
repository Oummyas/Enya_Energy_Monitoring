import { AppShell } from "@/components/app-nav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell home>{children}</AppShell>;
}
