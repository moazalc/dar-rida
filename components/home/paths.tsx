import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The two ways to buy, as one screen cut in half: the collection on one side,
 * the designer on the other. Hovering (or focusing) a half widens it and lifts
 * its shade while the other half dims. On phones the halves stack and the
 * copy is always visible, since there is no hover to reveal it.
 */
export function Paths({ dict }: { dict: Dictionary }) {
  const t = dict.home.paths;
  const paths = [
    { href: "/collection", ...t.collection, src: "/media/collection-rail.jpg", objectPosition: "50% 30%" },
    { href: "/design", ...t.design, src: "/media/design-stand.jpg", objectPosition: "50% 60%" },
  ];

  return (
    <section className="group/split flex flex-col gap-3 p-3 md:h-[86svh] md:max-h-[58rem] md:min-h-[36rem] md:flex-row md:gap-4 md:p-4">
      {paths.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="group relative flex h-[68svh] min-h-[26rem] overflow-hidden text-primary-foreground outline-none md:h-auto md:flex-1 md:transition-[flex-grow] md:duration-700 md:ease-out md:hover:grow-[1.35] md:focus-visible:grow-[1.35]"
        >
          <Placeholder
            label=""
            src={p.src}
            objectPosition={p.objectPosition}
            sizes="(min-width: 768px) 60vw, 100vw"
            className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
          />
          {/* Shade: even at rest, deeper on the half you are not pointing at. */}
          <div className="absolute inset-0 bg-espresso/25 transition-colors duration-700 md:group-hover/split:bg-espresso/50 md:group-hover:bg-espresso/10! md:group-focus-visible:bg-espresso/10!" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent,rgb(20_17_15/0.7))]" />
          <div className="absolute inset-3 border border-primary-foreground/0 transition-colors duration-700 group-hover:border-primary-foreground/40 group-focus-visible:border-primary-foreground/70" />

          <div className="relative mt-auto flex w-full flex-col items-start p-6 md:p-10 xl:p-14">
            <p aria-hidden className="font-heading text-xl text-primary-foreground/75 italic">
              {p.numeral}
            </p>
            <h2 className="mt-2 font-heading text-5xl leading-none font-light md:text-6xl xl:text-7xl">{p.title}</h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-primary-foreground/85 md:text-lg">{p.body}</p>
            <span className="mt-7 border-b border-primary-foreground pb-1.5 text-sm tracking-[0.16em] uppercase">
              {p.cta}{" "}
              <span
                aria-hidden
                className="inline-block transition-transform duration-500 group-hover:translate-x-1.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-1.5"
              >
                →
              </span>
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
