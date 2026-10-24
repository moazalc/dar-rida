import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/** Shared CTA styling for the status pages' actions. */
export const statusAction = {
  primary: cn(buttonVariants(), "h-14 rounded-none px-10 text-base tracking-wide"),
  secondary: cn(buttonVariants({ variant: "outline" }), "h-14 rounded-none px-10 text-base tracking-wide"),
};

/**
 * Layout for 404 / error pages: a large code or mark under an arch, title,
 * one line of help, and the actions. Presentational only, so it works in both
 * the server (not-found) and client (error) boundaries.
 */
export function StatusPage({
  code,
  title,
  body,
  children,
  className,
}: {
  code: string;
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center",
        className,
      )}
    >
      <div className="relative flex h-44 w-32 items-end justify-center md:h-56 md:w-40">
        <svg aria-hidden viewBox="0 0 160 224" className="absolute inset-0 size-full text-champagne">
          <path d="M8 224 V80 A72 72 0 0 1 152 80 V224" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="relative pb-6 font-heading text-6xl text-muted-foreground md:text-7xl">{code}</span>
      </div>
      <h1 className="mt-10 font-heading text-5xl leading-tight md:text-6xl">{title}</h1>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">{children}</div>
    </section>
  );
}
