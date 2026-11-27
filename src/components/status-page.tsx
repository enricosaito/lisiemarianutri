import { Eyebrow } from "@/components/app-header";
import { Logo } from "@/components/logo";

/** Full-page message in the brand style, used by the not-found and error pages. */
export function StatusPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="page-enter flex flex-1 items-center justify-center px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm text-center">
        <Logo variant="stacked" className="mx-auto h-20 sm:h-24" />
        <div className="mt-12">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1 className="mt-4 font-heading text-4xl italic leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
        <div className="mt-10 grid gap-2">{children}</div>
      </div>
    </main>
  );
}
