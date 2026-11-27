"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AccessLink } from "./actions";

function message({ name, link }: AccessLink) {
  const firstName = name.split(" ")[0];
  return (
    `Oi, ${firstName}! 🤎 Aqui está seu acesso à área de pacientes da Lisie Maria Nutricionista.\n\n` +
    `Toque no link para criar sua senha:\n${link}\n\n` +
    `Depois é só entrar com seu e-mail e a senha que você escolher.`
  );
}

/** The access link plus buttons to copy it or send it on WhatsApp. */
export function ShareAccess({ access }: { access: AccessLink }) {
  const [copied, setCopied] = useState(false);
  const text = message(access);
  // api.whatsapp.com keeps emoji intact (wa.me can mangle them).
  const whatsapp = access.phone
    ? `https://api.whatsapp.com/send?phone=${access.phone}&text=${encodeURIComponent(text)}`
    : null;

  return (
    <div className="flex animate-in flex-col gap-4 rounded-xl border border-border bg-brand-yellow/60 p-4 fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none sm:p-5">
      <p className="text-sm font-medium">Link de acesso de {access.name}</p>
      <p className="break-all rounded-md bg-white px-3 py-2 font-mono text-xs">{access.link}</p>
      <p className="text-xs text-muted-foreground">
        Funciona uma vez. Se expirar, gere outro na página do paciente.
      </p>
      <div className="grid gap-2 sm:flex sm:flex-wrap">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ className: "h-11 rounded-lg px-4" })}
          >
            <MessageCircle className="size-4" /> Enviar no WhatsApp
          </a>
        )}
        <Button
          type="button"
          variant={whatsapp ? "outline" : "default"}
          className="h-11 rounded-lg bg-white px-4"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Mensagem copiada" : "Copiar mensagem"}
        </Button>
      </div>
    </div>
  );
}
