"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export type CheckinState = { error?: string };

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function int(form: FormData, key: string, min: number, max: number) {
  const n = Number(text(form, key));
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function decimal(form: FormData, key: string, min: number, max: number) {
  const n = Number(text(form, key).replace(",", "."));
  return text(form, key) !== "" && Number.isFinite(n) && n >= min && n <= max
    ? Math.round(n * 10) / 10
    : null;
}

// Saves (or edits) this week's check-in. Patient and week come from the
// session and the DB defaults; RLS only allows the current week.
export async function saveCheckin(
  _prev: CheckinState,
  form: FormData,
): Promise<CheckinState> {
  const { supabase, profile } = await requireProfile();

  const direction = text(form, "weight_direction");
  let weightChange: number | null = null;
  if (direction === "mantive") weightChange = 0;
  else if (direction === "perdi" || direction === "ganhei") {
    const kg = decimal(form, "weight_kg", 0.1, 30);
    if (kg === null) return { error: "Informe quantos kg (pergunta 1)." };
    weightChange = direction === "perdi" ? -kg : kg;
  } else if (direction !== "nao_pesei") {
    return { error: "Responda a pergunta 1." };
  }

  const dietScore = int(form, "diet_score", 0, 10);
  const freeMeals = int(form, "free_meals_count", 0, 21);
  const workouts = int(form, "workouts_count", 0, 21);
  const water = decimal(form, "water_liters", 0, 10);
  if (dietScore === null) return { error: "Escolha uma nota de 0 a 10 (pergunta 2)." };
  if (freeMeals === null) return { error: "Informe o número de refeições livres (pergunta 4)." };
  if (workouts === null) return { error: "Informe quantas vezes treinou (pergunta 6)." };
  if (water === null) return { error: "Informe os litros de água por dia (pergunta 8)." };

  const required = {
    diet_score_reason: text(form, "diet_score_reason"),
    stress: text(form, "stress"),
    sleep: text(form, "sleep"),
    plan_difficulties: text(form, "plan_difficulties"),
    experience: text(form, "experience"),
  };
  if (Object.values(required).some((v) => v === "")) {
    return { error: "Responda todas as perguntas." };
  }

  const { error } = await supabase.from("weekly_checkins").upsert(
    {
      patient_id: profile.id,
      weight_change_kg: weightChange,
      diet_score: dietScore,
      free_meals_count: freeMeals,
      free_meals_details: text(form, "free_meals_details") || null,
      workouts_count: workouts,
      workouts_details: text(form, "workouts_details") || null,
      water_liters: water,
      ...required,
    },
    { onConflict: "patient_id,week_start" },
  );

  if (error) {
    console.error("saveCheckin", error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  redirect("/?checkin=ok");
}
