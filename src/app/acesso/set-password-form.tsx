"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setPassword, type SetPasswordState } from "./actions";

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<SetPasswordState, FormData>(
    setPassword,
    {},
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11 bg-white"
        />
        <p className="text-xs text-muted-foreground">Pelo menos 8 caracteres.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Repita a senha</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11 bg-white"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Salvando…" : "Criar senha e entrar"}
      </Button>
    </form>
  );
}
