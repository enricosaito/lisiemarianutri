"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { StatusPage } from "@/components/status-page";
import { Button } from "@/components/ui/button";
import { fontVariables } from "./fonts";
import "./globals.css";

// Replaces the root layout when it fails, so it brings its own document, styles and fonts.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <title>Lisie Maria Nutricionista</title>
        <StatusPage
          eyebrow="Algo deu errado"
          title="ops, tivemos um problema"
          description="Não foi possível carregar o app agora. Tente de novo em instantes."
        >
          <Button onClick={() => retry()} className="h-12 rounded-lg">
            Tentar de novo
          </Button>
        </StatusPage>
      </body>
    </html>
  );
}
