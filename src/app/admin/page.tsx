import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, UserPlus } from "lucide-react";
import { AppHeader, Eyebrow } from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { PageLoading } from "@/components/page-loading";
import { requireAdmin, type Profile } from "@/lib/auth";
import { currentWeekStart, formatWeek } from "@/lib/checkin";

export default function AdminPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const { supabase } = await requireAdmin();
  const week = currentWeekStart();

  const [{ data: patients }, { data: checkins }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "patient")
      .order("full_name")
      .returns<Profile[]>(),
    supabase
      .from("weekly_checkins")
      .select("patient_id, week_start")
      .order("week_start", { ascending: false }),
  ]);

  // Latest week and total count per patient.
  const stats = new Map<string, { last: string; count: number }>();
  for (const c of checkins ?? []) {
    const s = stats.get(c.patient_id);
    if (s) s.count++;
    else stats.set(c.patient_id, { last: c.week_start, count: 1 });
  }
  const answered = (patients ?? []).filter((p) => stats.get(p.id)?.last === week).length;

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader isAdmin />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14">
        <Eyebrow>Painel da nutricionista</Eyebrow>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-5xl italic leading-[1.05]">pacientes</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Semana {formatWeek(week)} · {answered} de {patients?.length ?? 0} responderam o
              check-in
            </p>
          </div>
          <Link href="/admin/pacientes/novo" className={buttonVariants({ className: "h-10 px-4" })}>
            <UserPlus className="size-4" /> Adicionar paciente
          </Link>
        </div>

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {(patients ?? []).map((p) => {
            const s = stats.get(p.id);
            const done = s?.last === week;
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/pacientes/${p.id}`}
                  className="flex items-center gap-4 px-2 py-4 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.full_name || p.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s
                        ? `Último check-in: ${formatWeek(s.last)} · ${s.count} no total`
                        : "Nenhum check-in ainda"}
                    </p>
                  </div>
                  <span
                    className={
                      done
                        ? "bg-brand-brown px-2 py-1 text-xs text-brand-yellow"
                        : "bg-brand-yellow px-2 py-1 text-xs"
                    }
                  >
                    {done ? "respondeu" : "pendente"}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
          {patients?.length === 0 && (
            <li className="px-2 py-6 text-sm text-muted-foreground">
              Nenhum paciente cadastrado ainda.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}
