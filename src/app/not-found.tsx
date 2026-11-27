import Link from "next/link";
import { StatusPage } from "@/components/status-page";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="Página não encontrada"
      title="nada por aqui"
      description="O endereço pode estar errado ou a página não existe mais."
    >
      <Link href="/" className={buttonVariants({ className: "h-12 rounded-lg" })}>
        Voltar ao início
      </Link>
    </StatusPage>
  );
}
