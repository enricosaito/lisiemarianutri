// Weekly check-in ("CHECK-IN SEMANAL | LISIE NUTRI"): questions, row type and
// week helpers shared by the patient form and the admin history.

export type Checkin = {
  id: string;
  patient_id: string;
  week_start: string; // YYYY-MM-DD, Monday (São Paulo time)
  weight_change_kg: number | null;
  diet_score: number;
  diet_score_reason: string;
  free_meals_count: number;
  free_meals_details: string | null;
  stress: string;
  workouts_count: number;
  workouts_details: string | null;
  sleep: string;
  water_liters: number;
  plan_difficulties: string;
  experience: string;
  created_at: string;
  updated_at: string;
};

export const QUESTIONS = {
  weight: "Teve perda ou ganho de peso nesta semana? Quanto?",
  dietScore: "De 0 a 10, qual nota você daria para sua alimentação nesta semana?",
  dietReason: "Qual o motivo dessa nota? Onde acha que poderia ter feito melhor?",
  freeMeals:
    "Quantas refeições livres você fez nesta semana? Quais foram e em quais quantidades?",
  stress:
    "Como foi seu nível de estresse ou ansiedade? Isso influenciou suas escolhas alimentares?",
  workouts: "Quantas vezes você treinou nesta semana? Quais treinos realizou?",
  sleep: "Como foram suas noites de sono? Sentiu-se mais cansado(a) ou disposto(a)?",
  water: "Quantos litros de água em média você tem bebido por dia?",
  difficulties:
    "Está sentindo alguma dificuldade em seguir o plano alimentar? Precisa de algum ajuste?",
  experience:
    "Como você está se sentindo dentro do acompanhamento? Conte sua experiência!",
} as const;

// Questions 5, 7 and 9 are a quick choice plus optional details, stored together
// in one text column as "Choice — details" so admins read them as one answer.
export const STRESS_LEVELS = ["Baixo", "Moderado", "Alto"] as const;
export const SLEEP_LEVELS = ["Dormi bem", "Regular", "Dormi mal"] as const;
export const DIFFICULTY_OPTIONS = ["Não", "Sim"] as const;

const CHOICE_SEPARATOR = " — ";

export function joinChoice(choice: string, details: string): string {
  return details ? `${choice}${CHOICE_SEPARATOR}${details}` : choice;
}

/** Splits a stored answer back into choice + details. Older free-text answers become details only. */
export function splitChoice(
  value: string | null | undefined,
  options: readonly string[],
): { choice?: string; details: string } {
  if (!value) return { details: "" };
  const [head, ...rest] = value.split(CHOICE_SEPARATOR);
  return options.includes(head)
    ? { choice: head, details: rest.join(CHOICE_SEPARATOR) }
    : { details: value };
}

/** Monday of the current week in São Paulo, as YYYY-MM-DD. Mirrors the DB's current_week_start(). */
export function currentWeekStart(now = new Date()): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(now);
  const d = new Date(`${today}T00:00:00Z`);
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

/** "23/11 – 29/11/2026" for a week starting on the given YYYY-MM-DD. */
export function formatWeek(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const dm = (d: Date) =>
    `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${dm(start)} – ${dm(end)}/${end.getUTCFullYear()}`;
}

export function formatWeight(kg: number | null): string {
  if (kg === null) return "Não se pesou";
  if (Number(kg) === 0) return "Manteve";
  const n = Math.abs(Number(kg)).toLocaleString("pt-BR");
  return Number(kg) < 0 ? `Perdeu ${n} kg` : `Ganhou ${n} kg`;
}
