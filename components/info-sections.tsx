/** Policy-style sections: heading on one side, paragraphs on the other. */
export function InfoSections({ sections }: { sections: readonly { title: string; body: readonly string[] }[] }) {
  return (
    <div className="divide-y divide-border/60 border-y border-border/60">
      {sections.map((s) => (
        <section key={s.title} className="grid gap-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16 md:py-12">
          <h2 className="font-heading text-3xl leading-tight">{s.title}</h2>
          <div className="flex max-w-2xl flex-col gap-4 text-lg leading-relaxed text-foreground/85">
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
