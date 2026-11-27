"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { StatusPage } from "@/components/status-page";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      eyebrow="Algo deu errado"
      title="ops, tivemos um problema"
      description="Não foi possível carregar esta página agora. Tente de novo em instantes."
    >
      <Button onClick={() => retry()} className="h-12 rounded-lg">
        Tentar de novo
      </Button>
      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "h-12 rounded-lg border-input bg-white",
        })}
      >
        Voltar ao início
      </Link>
    </StatusPage>
  );
}
