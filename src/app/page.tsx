import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageLoading } from "@/components/page-loading";
import { BookOpen, CalendarCheck, Check, ChevronRight } from "lucide-react";
import { AppHeader, Eyebrow } from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";
import { currentWeekStart, formatWeek } from "@/lib/checkin";

const card =
  "group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 outline-none transition-[transform,box-shadow] duration-200 ease-out hover:shadow-md active:scale-[0.98] active:duration-75 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:active:scale-100 sm:p-6";
const badge =
  "mb-2 flex size-9 items-center justify-center rounded-md bg-brand-brown text-sm font-bold text-brand-yellow";

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent {...props} />
    </Suspense>
  );
}

async function HomeContent({ searchParams }: PageProps<"/">) {
  const { supabase, profile } = await requireProfile();
  const params = await searchParams;
  const isAdmin = profile.role === "admin";
  // Admins land on their panel unless they asked for the patient view.
  if (isAdmin && params.visao !== "paciente") redirect("/admin");

  const week = currentWeekStart();
  const { data: thisWeek } = await supabase
    .from("weekly_checkins")
    .select("id")
    .eq("patient_id", profile.id)
    .eq("week_start", week)
    .maybeSingle();
  const justSent = params.checkin === "ok";
  const firstName = profile.full_name?.split(" ")[0];

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader isAdmin={isAdmin} patientView />
      <main className="page-enter mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-14">
        <Eyebrow>Área do paciente</Eyebrow>
        <h1 className="mt-4 font-heading text-5xl italic leading-[1.05] tracking-tight sm:text-6xl">
          {firstName ? `olá, ${firstName}` : "olá, que bom te ver"}
        </h1>

        {justSent && (
          <p className="mt-6 inline-flex animate-in items-center gap-2 rounded-lg bg-brand-yellow px-3 py-2 text-sm fade-in zoom-in-95 duration-500 ease-out motion-reduce:animate-none">
            <Check className="size-4" /> Check-in enviado. Obrigada!
          </p>
        )}

        {/* Each card is one big tap target. */}
        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
          <Link href="/checkin" className={card}>
            <span className={badge}>1</span>
            <CalendarCheck className="size-5" strokeWidth={1.5} />
            <h2 className="font-heading text-3xl font-medium tracking-tight">Check-in semanal</h2>
            <p className="text-sm text-muted-foreground">
              Semana {formatWeek(week)} · {thisWeek ? "enviado ✓" : "ainda não respondido"}
            </p>
            <span
              className={buttonVariants({
                variant: thisWeek ? "outline" : "default",
                className: "mt-auto h-11 w-full rounded-lg px-5 sm:w-fit",
              })}
            >
              {thisWeek ? "Ver ou editar" : "Responder agora"}
              <ChevronRight className="size-4" />
            </span>
          </Link>

          <Link href="/materiais" className={card}>
            <span className={badge}>2</span>
            <BookOpen className="size-5" strokeWidth={1.5} />
            <h2 className="font-heading text-3xl font-medium tracking-tight">Materiais</h2>
            <p className="text-sm text-muted-foreground">
              Guias, listas de mercado e receitas da Lisie.
            </p>
            <span
              className={buttonVariants({
                variant: "outline",
                className: "mt-auto h-11 w-full rounded-lg border-input bg-white px-5 sm:w-fit",
              })}
            >
              Ver materiais
              <ChevronRight className="size-4" />
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
