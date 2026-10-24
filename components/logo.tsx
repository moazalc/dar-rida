import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Text stand-in for the logo lockup until the approved vector arrives: Arabic
 * wordmark over a tracked DAR RIDA. Do not try to imitate the calligraphy here.
 */
export function Logo({ label, className }: { label: string; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={label}
      className={cn("flex flex-col items-center font-heading leading-none", className)}
    >
      <span lang="ar" className="text-3xl md:text-4xl">
        دار رِدا
      </span>
      <span lang="en" className="mt-2 ps-[0.4em] text-[0.65rem] tracking-[0.4em] md:text-xs">
        DAR RIDA
      </span>
    </Link>
  );
}
