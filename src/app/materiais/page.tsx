import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, ShoppingBasket } from "lucide-react";
import { AppHeader, Eyebrow, PATIENT_VIEW_HREF } from "@/components/app-header";
import { PageLoading } from "@/components/page-loading";
import { buttonVariants } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";

// Files live in public/materiais. The proxy only lets signed-in users fetch them.
const MATERIALS = [
  {
    title: "Mercado da Nutri",
    description: "Boas escolhas no supermercado: o que levar para casa, por categoria.",
    href: "/materiais/mercado-da-nutri.pdf",
    meta: "PDF · 5 páginas · 4,9 MB",
    icon: ShoppingBasket,
  },
];

export default function MaterialsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Materials />
    </Suspense>
  );
}

async function Materials() {
  const { profile } = await requireProfile();
  const isAdmin = profile.role === "admin";

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader isAdmin={isAdmin} patientView />
      <main className="page-enter mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-14">
        <Link
          href={isAdmin ? PATIENT_VIEW_HREF : "/"}
          className="-ml-1 inline-flex h-10 items-center gap-1 rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground active:opacity-60"
        >
          <ArrowLeft className="size-4" /> Início
        </Link>
        <div className="mt-4">
          <Eyebrow>Materiais</Eyebrow>
        </div>
        <h1 className="mt-4 font-heading text-4xl italic leading-[1.05] tracking-tight sm:text-5xl">
          guias da Lisie
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Materiais para consultar quando precisar. Abra no celular ou baixe para ter sempre à mão.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {MATERIALS.map((m) => (
            <li
              key={m.href}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-brand-yellow">
                <m.icon className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="font-heading text-2xl font-medium tracking-tight">{m.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{m.meta}</p>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <a
                  href={m.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ className: "h-11 rounded-lg" })}
                >
                  <ExternalLink className="size-4" /> Abrir
                </a>
                <a
                  href={m.href}
                  download
                  className={buttonVariants({
                    variant: "outline",
                    className: "h-11 rounded-lg border-input bg-white",
                  })}
                >
                  <Download className="size-4" /> Baixar
                </a>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
