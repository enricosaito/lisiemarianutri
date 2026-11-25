import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";

export function AppHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5">
        <Link href={isAdmin ? "/admin" : "/"}>
          <Logo />
        </Link>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}

/** Small uppercase label between two rules, as in the brand PDF. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-block border-y border-brand-brown px-3 py-1 text-xs tracking-[0.2em] uppercase">
      {children}
    </p>
  );
}
