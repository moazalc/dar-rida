import { cn } from "@/lib/utils";

/** Eyebrow, display title and lead paragraph that open every content page. */
export function PageIntro({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">{eyebrow}</p>
      <h1 className="mt-5 font-heading text-5xl leading-[1.04] font-light md:text-7xl">{title}</h1>
      {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>}
    </header>
  );
}

/** Page frame shared by the help and guide pages. */
export const pageFrame = "mx-auto max-w-[90rem] px-4 pt-14 pb-24 md:px-10 md:pt-20 md:pb-36 xl:px-18";
