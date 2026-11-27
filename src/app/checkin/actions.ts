"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  DIFFICULTY_OPTIONS,
  joinChoice,
  SLEEP_LEVELS,
  STRESS_LEVELS,
} from "@/lib/checkin";

/** `question`: the question to scroll back to when there's an error. */
export type CheckinState = { error?: string; question?: number };

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function int(form: FormData, key: string, min: number, max: number) {
  const n = Number(text(form, key));
  return text(form, key) !== "" && Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function decimal(form: FormData, key: string, min: number, max: number) {
  const n = Number(text(form, key).replace(",", "."));
  return text(form, key) !== "" && Number.isFinite(n) && n >= min && n <= max
    ? Math.round(n * 10) / 10
    : null;
}

function choice(form: FormData, key: string, options: readonly string[]) {
  const value = text(form, key);
  return options.includes(value) ? value : null;
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
    if (kg === null) return { error: "Informe quantos kg (pergunta 1).", question: 1 };
    weightChange = direction === "perdi" ? -kg : kg;
  } else if (direction !== "nao_pesei") {
    return { error: "Responda a pergunta 1.", question: 1 };
  }

  const dietScore = int(form, "diet_score", 0, 10);
  if (dietScore === null) {
    return { error: "Escolha uma nota de 0 a 10 (pergunta 2).", question: 2 };
  }

  const dietReason = text(form, "diet_score_reason");
  if (!dietReason) return { error: "Conte o motivo da nota (pergunta 3).", question: 3 };

  const freeMeals = int(form, "free_meals_count", 0, 21);
  if (freeMeals === null) {
    return { error: "Informe o número de refeições livres (pergunta 4).", question: 4 };
  }

  const stress = choice(form, "stress_level", STRESS_LEVELS);
  if (!stress) return { error: "Escolha seu nível de estresse (pergunta 5).", question: 5 };

  const workouts = int(form, "workouts_count", 0, 21);
  if (workouts === null) {
    return { error: "Informe quantas vezes treinou (pergunta 6).", question: 6 };
  }

  const sleep = choice(form, "sleep_level", SLEEP_LEVELS);
  if (!sleep) return { error: "Conte como foi seu sono (pergunta 7).", question: 7 };

  const water = decimal(form, "water_liters", 0, 10);
  if (water === null) {
    return { error: "Informe os litros de água por dia (pergunta 8).", question: 8 };
  }

  const difficulty = choice(form, "difficulty", DIFFICULTY_OPTIONS);
  const difficultyDetails = text(form, "difficulty_details");
  if (!difficulty) return { error: "Responda a pergunta 9.", question: 9 };
  if (difficulty === "Sim" && !difficultyDetails) {
    return { error: "Conte qual dificuldade você está sentindo (pergunta 9).", question: 9 };
  }

  const experience = text(form, "experience");
  if (!experience) {
    return { error: "Conte como está se sentindo (pergunta 10).", question: 10 };
  }

  const { error } = await supabase.from("weekly_checkins").upsert(
    {
      patient_id: profile.id,
      weight_change_kg: weightChange,
      diet_score: dietScore,
      diet_score_reason: dietReason,
      free_meals_count: freeMeals,
      free_meals_details: text(form, "free_meals_details") || null,
      stress: joinChoice(stress, text(form, "stress_details")),
      workouts_count: workouts,
      workouts_details: text(form, "workouts_details") || null,
      sleep: joinChoice(sleep, text(form, "sleep_details")),
      water_liters: water,
      plan_difficulties: joinChoice(difficulty, difficultyDetails),
      experience,
    },
    { onConflict: "patient_id,week_start" },
  );

  if (error) {
    console.error("saveCheckin", error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  // Admins previewing the patient area stay in it.
  redirect(profile.role === "admin" ? "/?visao=paciente&checkin=ok" : "/?checkin=ok");
}
