"use client";

import { startTransition, useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPatient, type AccessState } from "../actions";
import { ShareAccess } from "../share-access";

export function NewPatientForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<AccessState, FormData>(
    async (prev, data) => {
      const next = await createPatient(prev, data);
      if (next.access) formRef.current?.reset();
      return next;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-10">
      <form
        ref={formRef}
        // Submit via transition so a validation error keeps what was typed.
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => action(data));
        }}
        className="flex w-full max-w-md flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" name="full_name" required className="h-11 bg-white" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 bg-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">WhatsApp (opcional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="(21) 99999-8888"
            className="h-11 bg-white"
          />
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-lg px-8 sm:w-fit">
          {pending ? "Criando…" : "Criar paciente"}
        </Button>
      </form>

      {state.access && <ShareAccess access={state.access} />}
    </div>
  );
}
