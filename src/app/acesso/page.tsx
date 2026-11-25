import { Suspense } from "react";
import { Eyebrow } from "@/components/app-header";
import { Logo } from "@/components/logo";
import { SetPasswordForm } from "./set-password-form";

// Landing page of the access link Lisie sends on WhatsApp.
export default function AccessPage({ searchParams }: PageProps<"/acesso">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Logo variant="stacked" className="mx-auto" />
        <div className="mt-14 text-center">
          <Eyebrow>Primeiro acesso</Eyebrow>
          <h1 className="mt-4 font-heading text-5xl italic leading-[1.05]">
            crie sua senha
          </h1>
        </div>
        <div className="mt-12">
          <Suspense>
            <TokenForm searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function TokenForm({ searchParams }: Pick<PageProps<"/acesso">, "searchParams">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Link inválido. Peça um novo link de acesso para a Lisie.
      </p>
    );
  }
  return <SetPasswordForm token={token} />;
}
