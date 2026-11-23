import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminUser } from "@/lib/admin-session";
import { contrastRatio } from "@/lib/contrast";
import { palette } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { fontPairings } from "./candidate-fonts";
import { ComponentSections } from "./sections";

// The title only goes to the admin: anyone else gets the "not found" page, and a
// "Style guide" tab title would give away that something is here.
export async function generateMetadata(): Promise<Metadata> {
  const robots = { index: false, follow: false };
  return (await adminUser()) ? { title: "Style guide", robots } : { robots };
}

// Only for people signed in to the admin: it's a working tool, not a shop page.
export default async function StyleGuidePage() {
  if (!(await adminUser())) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-16 sm:px-8">
      <header className="flex flex-col gap-3">
        <p className="text-caption tracking-[0.18em] text-muted-foreground uppercase">Dar Rida design system</p>
        <h1 className="font-heading text-display">Style guide</h1>
        <p className="max-w-prose text-body text-muted-foreground">
          Every colour, type size and component, in every state. Use the toolbar to flip the components to right-to-left or to try
          another font pairing.
        </p>
        <nav aria-label="Sections" className="flex flex-wrap gap-x-6 gap-y-2 text-small">
          {["colour", "type", "space", "buttons", "fields", "feedback", "commerce", "dark"].map((id) => (
            <a key={id} href={`#${id}`} className="underline decoration-champagne underline-offset-4 hover:decoration-current">
              {id}
            </a>
          ))}
        </nav>
      </header>

      <Section id="colour" title="Colour">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
          {palette.map((s) => {
            const onIvory = contrastRatio(s.hex, "#f7f2e9");
            const onEspresso = contrastRatio(s.hex, "#1a1715");
            const need = s.role === "text" ? 4.5 : s.role === "line" ? 3 : null;
            return (
              <figure key={s.name} className="border border-champagne bg-card">
                <div className="h-20 border-b border-champagne" style={{ background: s.hex }} />
                <figcaption className="flex flex-col gap-1 p-3 text-small">
                  <span className="font-medium">
                    {s.name} <span className="text-muted-foreground">{s.hex}</span>
                  </span>
                  <span className="text-muted-foreground">{s.use}</span>
                  <span>
                    on ivory {onIvory}:1 · on espresso {onEspresso}:1
                  </span>
                  {need ? (
                    <span className={cn("font-medium", onIvory >= need ? "text-[#2f5d3a]" : "text-destructive")}>
                      {onIvory >= need ? "Passes" : "Fails"} {need}:1 on ivory
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Section>

      <Section id="type" title="Type">
        <div className="flex flex-col divide-y divide-champagne border-y border-champagne">
          {(
            [
              ["display", "text-display font-heading"],
              ["h1", "text-h1 font-heading"],
              ["h2", "text-h2 font-heading"],
              ["h3", "text-h3 font-heading"],
              ["body", "text-body"],
              ["small", "text-small"],
              ["caption", "text-caption tracking-[0.14em] uppercase"],
            ] as const
          ).map(([name, cls]) => (
            <div key={name} className="grid gap-2 py-5 sm:grid-cols-[6rem_1fr_1fr] sm:items-baseline">
              <span className="text-caption tracking-[0.14em] text-muted-foreground uppercase">{name}</span>
              <span className={cls}>Made to her measure</span>
              <span lang="ar" dir="rtl" className={cls}>
                مفصّلة على مقاسكِ
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <p lang="ru" className="text-body">
            <span className="font-heading text-h3">Сшито по вашим меркам.</span>
            <br />
            Каждая абая шьётся в Дубае по вашим меркам. Готово примерно через две недели.
          </p>
          <p lang="tr" className="text-body">
            <span className="font-heading text-h3">Ölçünüze göre dikildi.</span>
            <br />
            Her abaya, verdiğiniz ölçülere göre Dubai&apos;de dikilir. Yaklaşık iki haftada hazır.
          </p>
        </div>
      </Section>

      <Section id="space" title="Space and radius">
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 6, 8, 12, 16, 24, 32].map((step) => (
            <div key={step} className="flex items-center gap-4 text-small">
              <span className="w-16 text-muted-foreground tabular-nums">{step * 4}px</span>
              <span className="h-3 bg-gold" style={{ width: step * 4 }} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-small">
          <span className="size-16 rounded-lg border border-line-strong bg-card" />
          <span>6px radius on controls. Images keep square corners.</span>
        </div>
      </Section>

      <ComponentSections pairings={fontPairings.map(({ id, label, style }) => ({ id, label, style }))} />
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-8">
      <h2 id={`${id}-title`} className="border-b border-champagne pb-3 font-heading text-h1">
        {title}
      </h2>
      {children}
    </section>
  );
}
