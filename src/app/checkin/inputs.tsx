"use client";

import { useState } from "react";
import { Radio } from "@base-ui/react/radio";
import { Minus, Plus } from "lucide-react";
import { cn } from "cn";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup } from "@/components/ui/radio-group";

/** Single choice shown as tappable chips (a radio group under the hood, so it posts with the form).
 * Uncontrolled: pass `onValueChange` to react to picks. */
export function ChoiceChips({
  name,
  options,
  defaultValue,
  onValueChange,
  className,
  chipClassName,
  "aria-labelledby": labelledBy,
}: {
  name: string;
  options: readonly (string | readonly [value: string, label: string])[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  chipClassName?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <RadioGroup
      name={name}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(String(v))}
      aria-labelledby={labelledBy}
      className={cn("grid-cols-2 sm:flex sm:flex-wrap", className)}
    >
      {options.map((option) => {
        const [optionValue, label] = typeof option === "string" ? [option, option] : option;
        return (
          <Radio.Root
            key={optionValue}
            value={optionValue}
            aria-label={label}
            className={cn(
              // Instant press feedback, then a quick color settle on selection.
              "flex h-12 min-w-12 cursor-pointer items-center justify-center rounded-lg border border-input bg-white px-4 text-sm font-medium select-none",
              "transition-[transform,background-color,border-color,color] duration-200 ease-out active:scale-[0.96] active:duration-75",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              "data-checked:border-brand-brown data-checked:bg-brand-brown data-checked:text-brand-yellow",
              "motion-reduce:transition-colors motion-reduce:active:scale-100",
              chipClassName,
            )}
          >
            {label}
          </Radio.Root>
        );
      })}
    </RadioGroup>
  );
}

/** Number field with large − / + buttons for thumbs. Typing still works (comma or dot). */
export function Stepper({
  name,
  unit,
  min,
  max,
  step,
  defaultValue,
  decimals = 0,
  required,
  "aria-labelledby": labelledBy,
}: {
  name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue?: number | null;
  decimals?: number;
  required?: boolean;
  "aria-labelledby"?: string;
}) {
  const format = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: decimals });
  const [value, setValue] = useState(
    defaultValue === null || defaultValue === undefined ? "" : format(Number(defaultValue)),
  );
  const current = Number(value.replace(",", "."));

  function nudge(direction: 1 | -1) {
    // From empty, "−" lands on the minimum and "+" on the first step.
    const next =
      value === "" || !Number.isFinite(current)
        ? direction > 0
          ? Math.max(min, step)
          : min
        : Math.min(max, Math.max(min, Math.round((current + direction * step) * 10) / 10));
    setValue(format(next));
  }

  return (
    <InputGroup className="h-12 w-full max-w-64 bg-white">
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          size="icon-sm"
          aria-label="Diminuir"
          disabled={value !== "" && current <= min}
          onClick={() => nudge(-1)}
          className="size-10 active:scale-90 motion-reduce:active:scale-100"
        >
          <Minus />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        name={name}
        inputMode={decimals ? "decimal" : "numeric"}
        autoComplete="off"
        required={required}
        placeholder="–"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
        aria-labelledby={labelledBy}
        className="h-full text-center text-lg font-semibold tabular-nums md:text-lg"
      />
      <InputGroupAddon align="inline-end" className="gap-1">
        <span className="pr-1 text-xs font-normal">{unit}</span>
        <InputGroupButton
          size="icon-sm"
          aria-label="Aumentar"
          disabled={value !== "" && current >= max}
          onClick={() => nudge(1)}
          className="size-10 active:scale-90 motion-reduce:active:scale-100"
        >
          <Plus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
