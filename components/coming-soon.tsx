import { cn } from "@/lib/utils";

/**
 * Where "Design your own" used to link: the same words, dimmed, with a
 * "Coming soon" tag. Not a link and not focusable, so it goes nowhere.
 */
export function ComingSoon({ label, soon, className }: { label: string; soon: string; className?: string }) {
  return (
    <span aria-disabled="true" className={cn("inline-flex cursor-default items-baseline gap-2 whitespace-nowrap opacity-55 select-none", className)}>
      <span>{label}</span>
      <span className="border border-current px-1.5 py-px font-sans text-[0.625rem] leading-normal tracking-[0.16em] whitespace-nowrap uppercase">
        {soon}
      </span>
    </span>
  );
}
