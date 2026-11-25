"use client";

import { startTransition, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QUESTIONS, type Checkin } from "@/lib/checkin";
import { saveCheckin, type CheckinState } from "./actions";

type Direction = "perdi" | "ganhei" | "mantive" | "nao_pesei";

function initialDirection(kg: number | null | undefined): Direction | undefined {
  if (kg === undefined) return undefined;
  if (kg === null) return "nao_pesei";
  if (Number(kg) === 0) return "mantive";
  return Number(kg) < 0 ? "perdi" : "ganhei";
}

function Question({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-border pt-8">
      <legend className="contents">
        <span className="flex items-start gap-4">
          <span className="flex size-8 shrink-0 items-center justify-center bg-brand-brown text-sm font-bold text-brand-yellow">
            {n}
          </span>
          <span className="pt-1 text-base font-medium">{label}</span>
        </span>
      </legend>
      <div className="flex flex-col gap-3 sm:pl-12">{children}</div>
    </fieldset>
  );
}

const pill =
  "cursor-pointer border border-input bg-white px-3 py-2 text-sm transition-colors has-checked:border-brand-brown has-checked:bg-brand-brown has-checked:text-brand-yellow has-focus-visible:ring-2 has-focus-visible:ring-ring/50";

export function CheckinForm({ existing }: { existing: Checkin | null }) {
  const [state, action, pending] = useActionState<CheckinState, FormData>(
    saveCheckin,
    {},
  );
  const [direction, setDirection] = useState<Direction | undefined>(
    initialDirection(existing?.weight_change_kg),
  );
  const needsKg = direction === "perdi" || direction === "ganhei";

  return (
    <form
      // Submit via transition so React doesn't reset the answers on an error.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-8"
    >
      <Question n={1} label={QUESTIONS.weight}>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["perdi", "Perdi"],
              ["ganhei", "Ganhei"],
              ["mantive", "Mantive"],
              ["nao_pesei", "Não me pesei"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className={pill}>
              <input
                type="radio"
                name="weight_direction"
                value={value}
                required
                checked={direction === value}
                onChange={() => setDirection(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        {needsKg && (
          <label className="flex items-center gap-2 text-sm">
            <Input
              name="weight_kg"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0.1"
              max="30"
              required
              defaultValue={
                existing?.weight_change_kg
                  ? Math.abs(Number(existing.weight_change_kg))
                  : undefined
              }
              className="h-10 w-28 bg-white"
            />
            kg
          </label>
        )}
      </Question>

      <Question n={2} label={QUESTIONS.dietScore}>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 11 }, (_, i) => (
            <label key={i} className={`${pill} w-10 text-center`}>
              <input
                type="radio"
                name="diet_score"
                value={i}
                required
                defaultChecked={existing?.diet_score === i}
                className="sr-only"
              />
              {i}
            </label>
          ))}
        </div>
      </Question>

      <Question n={3} label={QUESTIONS.dietReason}>
        <Textarea
          name="diet_score_reason"
          required
          defaultValue={existing?.diet_score_reason}
          className="min-h-24 bg-white"
        />
      </Question>

      <Question n={4} label={QUESTIONS.freeMeals}>
        <label className="flex items-center gap-2 text-sm">
          <Input
            name="free_meals_count"
            type="number"
            inputMode="numeric"
            min="0"
            max="21"
            required
            defaultValue={existing?.free_meals_count}
            className="h-10 w-20 bg-white"
          />
          refeições livres
        </label>
        <Textarea
          name="free_meals_details"
          placeholder="Quais foram e em quais quantidades?"
          defaultValue={existing?.free_meals_details ?? undefined}
          className="min-h-20 bg-white"
        />
      </Question>

      <Question n={5} label={QUESTIONS.stress}>
        <Textarea
          name="stress"
          required
          defaultValue={existing?.stress}
          className="min-h-24 bg-white"
        />
      </Question>

      <Question n={6} label={QUESTIONS.workouts}>
        <label className="flex items-center gap-2 text-sm">
          <Input
            name="workouts_count"
            type="number"
            inputMode="numeric"
            min="0"
            max="21"
            required
            defaultValue={existing?.workouts_count}
            className="h-10 w-20 bg-white"
          />
          treinos
        </label>
        <Textarea
          name="workouts_details"
          placeholder="Quais treinos realizou?"
          defaultValue={existing?.workouts_details ?? undefined}
          className="min-h-20 bg-white"
        />
      </Question>

      <Question n={7} label={QUESTIONS.sleep}>
        <Textarea
          name="sleep"
          required
          defaultValue={existing?.sleep}
          className="min-h-24 bg-white"
        />
      </Question>

      <Question n={8} label={QUESTIONS.water}>
        <label className="flex items-center gap-2 text-sm">
          <Input
            name="water_liters"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="10"
            required
            defaultValue={existing?.water_liters}
            className="h-10 w-24 bg-white"
          />
          litros por dia
        </label>
      </Question>

      <Question n={9} label={QUESTIONS.difficulties}>
        <Textarea
          name="plan_difficulties"
          required
          defaultValue={existing?.plan_difficulties}
          className="min-h-24 bg-white"
        />
      </Question>

      <Question n={10} label={QUESTIONS.experience}>
        <Textarea
          name="experience"
          required
          defaultValue={existing?.experience}
          className="min-h-24 bg-white"
        />
      </Question>

      <div className="flex flex-col gap-3 border-t border-border pt-8 sm:pl-12">
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="h-11 w-full sm:w-fit sm:px-10">
          {pending ? "Enviando…" : existing ? "Salvar alterações" : "Enviar check-in"}
        </Button>
      </div>
    </form>
  );
}
