"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { newAccessLink, type AccessState } from "../actions";
import { ShareAccess } from "../share-access";

/** First access or forgotten password: makes a fresh one-time link. */
export function AccessLinkButton({ patientId }: { patientId: string }) {
  const [state, setState] = useState<AccessState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-white px-4 sm:w-fit"
        onClick={() => startTransition(async () => setState(await newAccessLink(patientId)))}
      >
        <KeyRound className="size-4" />
        {pending ? "Gerando…" : "Gerar link de acesso"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.access && <ShareAccess access={state.access} />}
    </div>
  );
}
