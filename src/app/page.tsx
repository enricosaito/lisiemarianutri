import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageLoading } from "@/components/page-loading";
import { BookOpen, CalendarCheck, Check } from "lucide-react";
import { AppHeader, Eyebrow } from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";
import { currentWeekStart, formatWeek } from "@/lib/checkin";

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent {...props} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: PageProps<"/">) {
  const { supabase, profile } = await requireProfile();
  if (profile.role === "admin") redirect("/admin");

  const week = currentWeekStart();
  const { data: thisWeek } = await supabase
    .from("weekly_checkins")
    .select("id")
    .eq("patient_id", profile.id)
    .eq("week_start", week)
    .maybeSingle();
  const justSent = (await searchParams).checkin === "ok";
  const firstName = profile.full_name?.split(" ")[0];

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <Eyebrow>Área do paciente</Eyebrow>
        <h1 className="mt-4 font-heading text-5xl italic leading-[1.05] sm:text-6xl">
          {firstName ? `olá, ${firstName}` : "olá, que bom te ver"}
        </h1>

        {justSent && (
          <p className="mt-6 inline-flex items-center gap-2 bg-brand-yellow px-3 py-2 text-sm">
            <Check className="size-4" /> Check-in enviado. Obrigada!
          </p>
        )}

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <section className="flex flex-col">
            <span className="flex size-10 items-center justify-center bg-brand-brown text-sm font-bold text-brand-yellow">
              1
            </span>
            <div className="flex flex-1 flex-col gap-3 border border-border bg-card p-6">
              <CalendarCheck className="size-5" strokeWidth={1.5} />
              <h2 className="font-heading text-3xl font-medium">Check-in semanal</h2>
              <p className="text-sm text-muted-foreground">
                Semana {formatWeek(week)} ·{" "}
                {thisWeek ? "enviado ✓" : "ainda não respondido"}
              </p>
              <Link
                href="/checkin"
                className={buttonVariants({
                  variant: thisWeek ? "outline" : "default",
                  className: "mt-auto h-10 w-fit px-5",
                })}
              >
                {thisWeek ? "Ver ou editar" : "Responder agora"}
              </Link>
            </div>
          </section>

          <section className="flex flex-col">
            <span className="flex size-10 items-center justify-center bg-brand-brown text-sm font-bold text-brand-yellow">
              2
            </span>
            <div className="flex flex-1 flex-col gap-3 border border-border bg-card p-6">
              <BookOpen className="size-5" strokeWidth={1.5} />
              <h2 className="font-heading text-3xl font-medium">Materiais</h2>
              <p className="text-sm text-muted-foreground">
                Guias, listas de mercado e receitas da Lisie.
              </p>
              <span className="mt-auto w-fit bg-brand-yellow px-2 py-1 text-xs tracking-wide">
                em breve
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
