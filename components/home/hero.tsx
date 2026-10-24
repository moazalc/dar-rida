import Link from "next/link";
import { HeroVideo } from "@/components/home/hero-video";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function Hero({ dict }: { dict: Dictionary }) {
  const t = dict.home.hero;

  return (
    <section data-hero className="relative h-svh min-h-[560px] w-full overflow-hidden bg-primary">
      <HeroVideo
        src="/media/hero-montage.mp4"
        poster="/media/hero-poster.jpg"
        className="absolute inset-0 size-full object-cover"
      />
      {/* Darken the top for the transparent header and the bottom for the copy. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/65" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 text-primary-foreground md:px-10 md:pb-24">
        <p className="text-sm tracking-[0.3em] text-primary-foreground/85 uppercase md:text-base">{t.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-heading text-6xl leading-[1.05] md:text-8xl">{t.title}</h1>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/collection"
            className={cn(
              buttonVariants(),
              "h-14 rounded-none bg-primary-foreground px-10 text-base tracking-wide text-primary hover:bg-primary-foreground/90",
            )}
          >
            {t.shopCollection}
          </Link>
          <Link
            href="/design"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-14 rounded-none border-primary-foreground/80 bg-transparent px-10 text-base tracking-wide text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}
          >
            {t.designYourOwn}
          </Link>
        </div>
      </div>
    </section>
  );
}
