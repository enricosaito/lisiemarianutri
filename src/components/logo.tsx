import { cn } from "cn";

// Text stand-in for the LM logo until the real logo file is added to /public.
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-brand-brown", className)}>
      <span className="font-heading text-3xl italic leading-none">LM</span>
      <span className="flex flex-col leading-none">
        <span className="text-sm tracking-[0.3em]">LISIE MARIA</span>
        <span className="mt-1 text-[0.5rem] tracking-[0.35em] opacity-70">
          NUTRICIONISTA
        </span>
      </span>
    </div>
  );
}
