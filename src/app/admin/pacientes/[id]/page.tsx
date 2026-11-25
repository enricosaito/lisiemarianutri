import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppHeader, Eyebrow } from "@/components/app-header";
import { PageLoading } from "@/components/page-loading";
import { requireAdmin, type Profile } from "@/lib/auth";
import { formatWeek, formatWeight, QUESTIONS, type Checkin } from "@/lib/checkin";
import { AccessLinkButton } from "./access-link-button";

function withDetails(main: string, details: string | null) {
  return details ? `${main} — ${details}` : main;
}

export default function PatientHistoryPage(props: PageProps<"/admin/pacientes/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PatientHistory {...props} />
    </Suspense>
  );
}

async function PatientHistory({ params }: PageProps<"/admin/pacientes/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: patient }, { data: checkins }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, role")
      .eq("id", id)
      .maybeSingle<Profile>(),
    supabase
      .from("weekly_checkins")
      .select("*")
      .eq("patient_id", id)
      .order("week_start", { ascending: false })
      .returns<Checkin[]>(),
  ]);
  if (!patient) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader isAdmin />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Pacientes
        </Link>
        <div className="mt-6">
          <Eyebrow>Histórico de check-ins</Eyebrow>
        </div>
        <h1 className="mt-4 font-heading text-5xl italic leading-[1.05]">
          {patient.full_name || patient.email}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[patient.full_name && patient.email, patient.phone && `WhatsApp +${patient.phone}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-6">
          <AccessLinkButton patientId={patient.id} />
        </div>

        {!checkins?.length ? (
          <p className="mt-10 text-sm text-muted-foreground">Nenhum check-in ainda.</p>
        ) : (
          <>
            {/* Week-over-week numbers at a glance */}
            <div className="mt-10 overflow-x-auto border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs tracking-wide uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Semana</th>
                    <th className="px-4 py-3 font-medium">Peso</th>
                    <th className="px-4 py-3 font-medium">Nota</th>
                    <th className="px-4 py-3 font-medium">Ref. livres</th>
                    <th className="px-4 py-3 font-medium">Treinos</th>
                    <th className="px-4 py-3 font-medium">Água/dia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {checkins.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{formatWeek(c.week_start)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatWeight(c.weight_change_kg)}
                      </td>
                      <td className="px-4 py-3">{c.diet_score}/10</td>
                      <td className="px-4 py-3">{c.free_meals_count}</td>
                      <td className="px-4 py-3">{c.workouts_count}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {Number(c.water_liters).toLocaleString("pt-BR")} L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Full answers, newest first */}
            <div className="mt-10 flex flex-col gap-4">
              {checkins.map((c, i) => {
                const answers: [string, string][] = [
                  [QUESTIONS.weight, formatWeight(c.weight_change_kg)],
                  [QUESTIONS.dietScore, `${c.diet_score}/10`],
                  [QUESTIONS.dietReason, c.diet_score_reason],
                  [QUESTIONS.freeMeals, withDetails(String(c.free_meals_count), c.free_meals_details)],
                  [QUESTIONS.stress, c.stress],
                  [QUESTIONS.workouts, withDetails(String(c.workouts_count), c.workouts_details)],
                  [QUESTIONS.sleep, c.sleep],
                  [QUESTIONS.water, `${Number(c.water_liters).toLocaleString("pt-BR")} L`],
                  [QUESTIONS.difficulties, c.plan_difficulties],
                  [QUESTIONS.experience, c.experience],
                ];
                return (
                  <details
                    key={c.id}
                    open={i === 0}
                    className="group border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                      <span className="font-heading text-2xl font-medium">
                        Semana {formatWeek(c.week_start)}
                      </span>
                      <span className="text-xs text-muted-foreground group-open:hidden">
                        ver respostas
                      </span>
                    </summary>
                    <ol className="flex flex-col gap-5 border-t border-border px-5 py-5">
                      {answers.map(([q, a], n) => (
                        <li key={q} className="flex gap-4">
                          <span className="flex size-7 shrink-0 items-center justify-center bg-brand-brown text-xs font-bold text-brand-yellow">
                            {n + 1}
                          </span>
                          <div>
                            <p className="text-xs text-muted-foreground">{q}</p>
                            <p className="mt-1 text-sm whitespace-pre-line">{a}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </details>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
