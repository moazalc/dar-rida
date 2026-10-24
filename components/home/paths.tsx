import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Placeholder } from "@/components/placeholder";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** The two ways to buy, side by side: the collection and the designer. */
export function Paths({ dict }: { dict: Dictionary }) {
  const t = dict.home.paths;
  const paths: {
    href: string;
    title: string;
    body: string;
    cta: string;
    tone: "warm" | "dark";
    src?: string;
    objectPosition?: string;
  }[] = [
    { href: "/collection", ...t.collection, tone: "warm" },
    { href: "/design", ...t.design, tone: "dark", src: "/media/fabric-lace.jpg", objectPosition: "30% 50%" },
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-2 md:gap-6 md:px-10 md:py-24">
      {paths.map((p) => (
        <Link key={p.href} href={p.href} className="group relative block aspect-[4/5] overflow-hidden">
          <Placeholder
            tone={p.tone}
            label={p.src ? "" : dict.placeholder}
            src={p.src}
            objectPosition={p.objectPosition}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 text-primary-foreground md:p-10">
            <h2 className="font-heading text-4xl md:text-5xl">{p.title}</h2>
            <p className="max-w-md text-base leading-relaxed text-primary-foreground/85 md:text-lg">{p.body}</p>
            <span className="mt-2 inline-flex items-center gap-2 text-base tracking-wide md:text-lg">
              {p.cta}
              <ArrowRight
                className="size-5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                strokeWidth={1.5}
              />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
