import { Suspense } from "react";
import { AppHeader, Eyebrow } from "@/components/app-header";
import { PageLoading } from "@/components/page-loading";
import { requireProfile } from "@/lib/auth";
import { currentWeekStart, formatWeek, type Checkin } from "@/lib/checkin";
import { CheckinForm } from "./checkin-form";

export default function CheckinPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CheckinContent />
    </Suspense>
  );
}

async function CheckinContent() {
  const { supabase, profile } = await requireProfile();
  const week = currentWeekStart();

  const { data: existing } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("patient_id", profile.id)
    .eq("week_start", week)
    .maybeSingle<Checkin>();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader isAdmin={profile.role === "admin"} patientView />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <Eyebrow>Check-in semanal · {formatWeek(week)}</Eyebrow>
        <h1 className="mt-4 font-heading text-5xl italic leading-[1.05]">
          como foi sua semana?
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Responda com sinceridade e detalhes para que possamos acompanhar sua
          evolução e ajustar o que for necessário.
          {existing && " Você já enviou esta semana. Pode editar até domingo."}
        </p>
        <div className="mt-12">
          <CheckinForm existing={existing ?? null} />
        </div>
      </main>
    </div>
  );
}
