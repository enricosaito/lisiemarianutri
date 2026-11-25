import { ClipboardList, CalendarCheck, BookOpen } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";

const SECTIONS = [
  {
    n: 1,
    title: "Questionário",
    text: "Conte sobre sua rotina, histórico e objetivos.",
    icon: ClipboardList,
  },
  {
    n: 2,
    title: "Check-ins",
    text: "Registre peso, medidas e como foi a semana.",
    icon: CalendarCheck,
  },
  {
    n: 3,
    title: "Materiais",
    text: "Guias, listas de mercado e receitas da Lisie.",
    icon: BookOpen,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Logo />
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <p className="inline-block border-y border-brand-brown px-3 py-1 text-xs tracking-[0.2em] uppercase">
          Área do paciente
        </p>
        <h1 className="mt-4 font-heading text-5xl italic leading-[1.05] sm:text-6xl">
          olá, que bom te ver
        </h1>
        {email && <p className="mt-3 text-sm text-muted-foreground">{email}</p>}

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {SECTIONS.map(({ n, title, text, icon: Icon }) => (
            <div key={n} className="flex flex-col">
              <span className="flex size-10 items-center justify-center bg-brand-brown text-sm font-bold text-brand-yellow">
                {n}
              </span>
              <div className="flex flex-1 flex-col gap-3 border border-border bg-card p-6">
                <Icon className="size-5" strokeWidth={1.5} />
                <h2 className="font-heading text-3xl font-medium">{title}</h2>
                <p className="text-sm text-muted-foreground">{text}</p>
                <span className="mt-auto w-fit bg-brand-yellow px-2 py-1 text-xs tracking-wide">
                  em breve
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
