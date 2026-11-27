"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DIFFICULTY_OPTIONS,
  QUESTIONS,
  SLEEP_LEVELS,
  splitChoice,
  STRESS_LEVELS,
  type Checkin,
} from "@/lib/checkin";
import { saveCheckin, type CheckinState } from "./actions";
import { ChoiceChips, Stepper } from "./inputs";

type Direction = "perdi" | "ganhei" | "mantive" | "nao_pesei";

const DIRECTIONS = [
  ["perdi", "Perdi"],
  ["ganhei", "Ganhei"],
  ["mantive", "Mantive"],
  ["nao_pesei", "Não me pesei"],
] as const;

const SCORES = Array.from({ length: 11 }, (_, i) => String(i));
const TOTAL = 10;

function initialDirection(kg: number | null | undefined): Direction | undefined {
  if (kg === undefined) return undefined;
  if (kg === null) return "nao_pesei";
  if (Number(kg) === 0) return "mantive";
  return Number(kg) < 0 ? "perdi" : "ganhei";
}

/** Question numbers still unanswered. Mirrors the checks in saveCheckin. */
function missingQuestions(data: FormData): number[] {
  const v = (key: string) => String(data.get(key) ?? "").trim();
  const direction = v("weight_direction");
  const missing: [number, boolean][] = [
    [1, !direction || ((direction === "perdi" || direction === "ganhei") && !v("weight_kg"))],
    [2, !v("diet_score")],
    [3, !v("diet_score_reason")],
    [4, !v("free_meals_count")],
    [5, !v("stress_level")],
    [6, !v("workouts_count")],
    [7, !v("sleep_level")],
    [8, !v("water_liters")],
    [9, !v("difficulty") || (v("difficulty") === "Sim" && !v("difficulty_details"))],
    [10, !v("experience")],
  ];
  return missing.filter(([, isMissing]) => isMissing).map(([n]) => n);
}

function Question({
  n,
  label,
  hint,
  invalid,
  children,
}: {
  n: number;
  label: string;
  hint?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <FieldSet
      id={`q${n}`}
      aria-invalid={invalid || undefined}
      className="scroll-mt-24 gap-4 border-t border-border pt-8"
    >
      <FieldLegend id={`q${n}-label`} className="mb-0 flex items-start gap-3 text-base">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-bold transition-colors duration-300",
            invalid ? "bg-destructive text-white" : "bg-brand-brown text-brand-yellow",
          )}
        >
          {n}
        </span>
        <span className="pt-1 leading-snug">{label}</span>
      </FieldLegend>
      <div className="flex flex-col gap-3 sm:pl-11">
        {hint && <FieldDescription className="-mt-1">{hint}</FieldDescription>}
        {children}
      </div>
    </FieldSet>
  );
}

/** Content that appears in response to a choice: fades and rises in, no layout jump on removal. */
function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-top-1 duration-300 ease-out motion-reduce:animate-none">
      {children}
    </div>
  );
}

const longText = "min-h-28 bg-white text-base leading-relaxed";
const shortText = "min-h-20 bg-white text-base leading-relaxed";

export function CheckinForm({ existing }: { existing: Checkin | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, action, pending] = useActionState<CheckinState, FormData>(async (prev, data) => {
    const next = await saveCheckin(prev, data);
    // A server-side error points back at its question.
    if (next.error) {
      setMessage(next.error);
      setFlagged(next.question);
      if (next.question) goTo(next.question);
    }
    return next;
  }, {});
  const [direction, setDirection] = useState<Direction | undefined>(
    initialDirection(existing?.weight_change_kg),
  );
  const stress = splitChoice(existing?.stress, STRESS_LEVELS);
  const sleep = splitChoice(existing?.sleep, SLEEP_LEVELS);
  const initialDifficulty = splitChoice(existing?.plan_difficulties, DIFFICULTY_OPTIONS);
  const [difficulty, setDifficulty] = useState(initialDifficulty.choice);

  // A saved check-in already answers everything; a new one starts empty.
  const [missing, setMissing] = useState<number[]>(() =>
    existing ? [] : Array.from({ length: TOTAL }, (_, i) => i + 1),
  );
  const [flagged, setFlagged] = useState<number | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const needsKg = direction === "perdi" || direction === "ganhei";
  const answered = TOTAL - missing.length;

  // Progress reads the real form values, so it never drifts from what gets submitted.
  function refreshProgress() {
    requestAnimationFrame(() => {
      if (!formRef.current) return;
      const next = missingQuestions(new FormData(formRef.current));
      setMissing(next);
      if (flagged && !next.includes(flagged)) {
        setFlagged(undefined);
        setMessage(undefined);
      }
    });
  }

  function goTo(n: number) {
    const el = document.getElementById(`q${n}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    el.querySelector<HTMLElement>("input:not([type=hidden]), textarea, button")?.focus({
      preventScroll: true,
    });
  }

  return (
    <form
      ref={formRef}
      noValidate
      onInput={refreshProgress}
      onClick={refreshProgress}
      // Submit via transition so React doesn't reset the answers on an error.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const stillMissing = missingQuestions(data);
        if (stillMissing.length) {
          const first = stillMissing[0];
          setFlagged(first);
          setMessage(`Falta responder a pergunta ${first}.`);
          goTo(first);
          return;
        }
        startTransition(() => action(data));
      }}
      className="pb-36"
    >
      <div className="page-enter flex flex-col gap-8">
        <Question n={1} label={QUESTIONS.weight} invalid={flagged === 1}>
          <ChoiceChips
            name="weight_direction"
            aria-labelledby="q1-label"
            options={DIRECTIONS}
            defaultValue={initialDirection(existing?.weight_change_kg)}
            onValueChange={(v) => setDirection(v as Direction)}
            className="sm:grid sm:grid-cols-4"
          />
          {needsKg && (
            <Reveal>
              <Stepper
                name="weight_kg"
                aria-labelledby="q1-label"
                unit="kg"
                min={0.1}
                max={30}
                step={0.5}
                decimals={1}
                defaultValue={
                  existing?.weight_change_kg ? Math.abs(Number(existing.weight_change_kg)) : null
                }
              />
            </Reveal>
          )}
        </Question>

        <Question n={2} label={QUESTIONS.dietScore} invalid={flagged === 2}>
          <ChoiceChips
            name="diet_score"
            aria-labelledby="q2-label"
            options={SCORES}
            defaultValue={existing ? String(existing.diet_score) : undefined}
            className="grid-cols-6 gap-1.5 sm:grid sm:grid-cols-11"
            chipClassName="px-0 tabular-nums"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 · muito ruim</span>
            <span>10 · perfeita</span>
          </div>
        </Question>

        <Question n={3} label={QUESTIONS.dietReason} invalid={flagged === 3}>
          <Textarea
            name="diet_score_reason"
            aria-labelledby="q3-label"
            defaultValue={existing?.diet_score_reason}
            placeholder="Conte com suas palavras…"
            className={longText}
          />
        </Question>

        <Question n={4} label={QUESTIONS.freeMeals} invalid={flagged === 4}>
          <Stepper
            name="free_meals_count"
            aria-labelledby="q4-label"
            unit="refeições"
            min={0}
            max={21}
            step={1}
            defaultValue={existing?.free_meals_count}
          />
          <Textarea
            name="free_meals_details"
            aria-label="Quais foram e em quais quantidades?"
            placeholder="Quais foram e em quais quantidades? (opcional)"
            defaultValue={existing?.free_meals_details ?? undefined}
            className={shortText}
          />
        </Question>

        <Question n={5} label={QUESTIONS.stress} invalid={flagged === 5}>
          <ChoiceChips
            name="stress_level"
            aria-labelledby="q5-label"
            options={STRESS_LEVELS}
            defaultValue={stress.choice}
            className="grid-cols-3"
          />
          <Textarea
            name="stress_details"
            aria-label="Isso influenciou suas escolhas alimentares?"
            placeholder="Isso influenciou suas escolhas alimentares? (opcional)"
            defaultValue={stress.details}
            className={shortText}
          />
        </Question>

        <Question n={6} label={QUESTIONS.workouts} invalid={flagged === 6}>
          <Stepper
            name="workouts_count"
            aria-labelledby="q6-label"
            unit="treinos"
            min={0}
            max={21}
            step={1}
            defaultValue={existing?.workouts_count}
          />
          <Input
            name="workouts_details"
            aria-label="Quais treinos realizou?"
            placeholder="Quais treinos? Ex.: musculação, corrida (opcional)"
            defaultValue={existing?.workouts_details ?? undefined}
            className="h-12 bg-white"
          />
        </Question>

        <Question n={7} label={QUESTIONS.sleep} invalid={flagged === 7}>
          <ChoiceChips
            name="sleep_level"
            aria-labelledby="q7-label"
            options={SLEEP_LEVELS}
            defaultValue={sleep.choice}
            className="grid-cols-3"
            chipClassName="px-2"
          />
          <Input
            name="sleep_details"
            aria-label="Sentiu-se mais cansado(a) ou disposto(a)?"
            placeholder="Mais cansado(a) ou disposto(a)? (opcional)"
            defaultValue={sleep.details}
            className="h-12 bg-white"
          />
        </Question>

        <Question n={8} label={QUESTIONS.water} invalid={flagged === 8}>
          <Stepper
            name="water_liters"
            aria-labelledby="q8-label"
            unit="L/dia"
            min={0}
            max={10}
            step={0.5}
            decimals={1}
            defaultValue={existing?.water_liters}
          />
        </Question>

        <Question n={9} label={QUESTIONS.difficulties} invalid={flagged === 9}>
          <ChoiceChips
            name="difficulty"
            aria-labelledby="q9-label"
            options={DIFFICULTY_OPTIONS}
            defaultValue={initialDifficulty.choice}
            onValueChange={setDifficulty}
            className="max-w-xs"
          />
          {difficulty && (
            <Reveal key={difficulty}>
              <Textarea
                name="difficulty_details"
                aria-label="Detalhes da dificuldade"
                placeholder={
                  difficulty === "Sim"
                    ? "Qual dificuldade? O que gostaria de ajustar?"
                    : "Algum comentário? (opcional)"
                }
                defaultValue={initialDifficulty.details}
                className={longText}
              />
            </Reveal>
          )}
        </Question>

        <Question n={10} label={QUESTIONS.experience} invalid={flagged === 10}>
          <Textarea
            name="experience"
            aria-labelledby="q10-label"
            defaultValue={existing?.experience}
            placeholder="Conte sua experiência…"
            className={longText}
          />
        </Question>
      </div>

      {/* Floating action bar: progress and submit stay within thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 supports-[not(backdrop-filter:blur(0))]:bg-background">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p
              aria-live="polite"
              className={cn(
                "truncate text-xs",
                message ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {message ?? `${answered} de ${TOTAL} respondidas`}
            </p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full origin-left rounded-full bg-brand-brown transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                style={{ transform: `scaleX(${answered / TOTAL})` }}
              />
            </div>
          </div>
          <Button type="submit" disabled={pending} className="h-12 shrink-0 rounded-xl px-6">
            {pending ? "Enviando…" : existing ? "Salvar" : "Enviar check-in"}
          </Button>
        </div>
      </div>
    </form>
  );
}
