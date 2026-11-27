import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";

/** Where an admin previews the patient area (`/` sends admins to /admin otherwise). */
export const PATIENT_VIEW_HREF = "/?visao=paciente";

/** `patientView`: an admin is looking at the patient pages. */
export function AppHeader({
  isAdmin = false,
  patientView = false,
}: {
  isAdmin?: boolean;
  patientView?: boolean;
}) {
  const home = !isAdmin ? "/" : patientView ? PATIENT_VIEW_HREF : "/admin";

  return (
    // Translucent bar that content scrolls under, clear of the notch.
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 supports-[not(backdrop-filter:blur(0))]:bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
        <Link href={home} className="shrink-0 rounded-md active:opacity-60">
          <Logo className="h-7 sm:h-8" />
        </Link>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link
              href={patientView ? "/admin" : PATIENT_VIEW_HREF}
              className={buttonVariants({ variant: "ghost", className: "h-10 px-3" })}
            >
              {patientView ? "Painel" : "Área do paciente"}
            </Link>
          )}
          <form action={signOut}>
            <Button variant="ghost" type="submit" className="h-10 px-3">
              Sair
            </Button>
          </form>
        </div>
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
