import Link from "next/link";
import { Button } from "./ui/button";
import { UserAvatar } from "./user-avatar";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

// "header" is the account box of the app header
export async function AuthButton({
  variant = "default",
}: {
  variant?: "default" | "header";
}) {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  if (user && variant === "header") {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-muted/70 py-1.5 pl-1.5 pr-2 shadow-sm">
        <UserAvatar className="h-11 w-11" />
        <LogoutButton className="h-9 px-4 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500" />
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
