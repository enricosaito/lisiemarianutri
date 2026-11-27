import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader, Eyebrow } from "@/components/app-header";
import { PageLoading } from "@/components/page-loading";
import { requireAdmin } from "@/lib/auth";
import { NewPatientForm } from "./new-patient-form";

export default function NewPatientPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewPatient />
    </Suspense>
  );
}

async function NewPatient() {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader isAdmin />
      <main className="page-enter mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-14">
        <Link
          href="/admin"
          className="-ml-1 inline-flex h-10 items-center gap-1 rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground active:opacity-60"
        >
          <ArrowLeft className="size-4" /> Pacientes
        </Link>
        <div className="mt-6">
          <Eyebrow>Novo paciente</Eyebrow>
        </div>
        <h1 className="mt-4 font-heading text-4xl italic leading-[1.05] tracking-tight sm:text-5xl">
          adicionar paciente
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          A conta é criada na hora. Você recebe um link para enviar ao paciente,
          que abre e escolhe a própria senha.
        </p>
        <div className="mt-10">
          <NewPatientForm />
        </div>
      </main>
    </div>
  );
}
