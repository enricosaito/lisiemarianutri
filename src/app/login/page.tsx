import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="page-enter flex flex-1 items-center justify-center px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm">
        <Logo variant="stacked" className="mx-auto" />

        <div className="mt-14 text-center">
          <p className="inline-block border-y border-brand-brown px-3 py-1 text-xs tracking-[0.2em] uppercase">
            Área do paciente
          </p>
          <h1 className="mt-4 font-heading text-4xl italic leading-[1.05] tracking-tight sm:text-5xl">
            seu espaço de nutrição
          </h1>
        </div>

        <div className="mt-12">
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Seu acesso é criado pela nutricionista. Não recebeu? Fale com a Lisie.
        </p>
      </div>
    </main>
  );
}
