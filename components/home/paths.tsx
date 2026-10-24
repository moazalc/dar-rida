import Link from "next/link";
import { Placeholder } from "@/components/placeholder";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

/**
 * The two ways to buy, set like a magazine spread: the collection large, the
 * designer smaller and dropped lower, each with a numbered caption under it.
 */
export function Paths({ dict }: { dict: Dictionary }) {
  const t = dict.home.paths;
  const paths = [
    {
      href: "/collection",
      ...t.collection,
      src: "/media/collection.jpg",
      objectPosition: "50% 22%",
      box: "md:col-span-7",
      image: "aspect-[4/5]",
    },
    {
      href: "/design",
      ...t.design,
      src: "/media/design.jpg",
      objectPosition: "50% 50%",
      box: "md:col-span-5 md:pt-56",
      image: "aspect-[3/4]",
    },
  ];

  return (
    <section className="mx-auto grid max-w-[90rem] gap-16 px-4 py-24 md:grid-cols-12 md:gap-x-16 md:px-10 md:py-36 lg:gap-x-24 xl:px-18">
      {paths.map((p) => (
        <Link key={p.href} href={p.href} className={cn("group flex flex-col gap-7", p.box)}>
          <div className="overflow-hidden">
            <Placeholder
              label=""
              src={p.src}
              objectPosition={p.objectPosition}
              sizes="(min-width: 768px) 55vw, 100vw"
              className={cn("w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]", p.image)}
            />
          </div>
          <div className="flex items-end justify-between gap-6 border-t border-border pt-5">
            <div>
              <p aria-hidden className="font-heading text-xl text-muted-foreground italic">
                {p.numeral}
              </p>
              <h2 className="mt-2 font-heading text-4xl leading-none md:text-5xl">{p.title}</h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">{p.body}</p>
            </div>
            <span className="shrink-0 text-sm tracking-[0.14em] whitespace-nowrap uppercase">
              {p.cta} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
