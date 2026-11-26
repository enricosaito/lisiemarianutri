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
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5">
        <Link href={home}>
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link
              href={patientView ? "/admin" : PATIENT_VIEW_HREF}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {patientView ? "Painel" : "Área do paciente"}
            </Link>
          )}
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
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
