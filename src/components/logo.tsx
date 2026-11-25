import Image from "next/image";
import { cn } from "cn";
import horizontal from "../../public/logo/logo-horizontal.png";
import stacked from "../../public/logo/logo-stacked.png";

export function Logo({
  variant = "horizontal",
  className,
}: {
  variant?: "horizontal" | "stacked";
  className?: string;
}) {
  return (
    <Image
      src={variant === "stacked" ? stacked : horizontal}
      alt="Lisie Maria Nutricionista"
      priority
      className={cn(
        "w-auto",
        variant === "stacked" ? "h-28" : "h-8",
        className,
      )}
    />
  );
}
