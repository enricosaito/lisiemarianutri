import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Logo className="justify-center" />

        <div className="mt-16 text-center">
          <p className="inline-block border-y border-brand-brown px-3 py-1 text-xs tracking-[0.2em] uppercase">
            Área do paciente
          </p>
          <h1 className="mt-4 font-heading text-5xl italic leading-[1.05]">
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
