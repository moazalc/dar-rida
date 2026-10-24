import Image from "next/image";
import { cn } from "@/lib/utils";

const tones = {
  dark: "from-[#4a4038] via-[#2f2925] to-[#1c1916] text-[#f7f2e9]/50",
  warm: "from-[#b5a48d] via-[#8e7f6e] to-[#5e544a] text-[#f7f2e9]/50",
  light: "from-[#efe7da] via-[#e6dccb] to-[#d8cab4] text-[#24211f]/30",
};

/**
 * An image slot. With `src` it renders the photo to fill its box; without, a
 * stand-in (warm gradient + arch outline, the brand's architectural motif)
 * until the studio shoot. Either way the box is the caller's, so swapping a
 * placeholder for a photo never moves the layout.
 */
export function Placeholder({
  label,
  src,
  sizes = "100vw",
  objectPosition,
  tone = "light",
  className,
}: {
  label: string;
  src?: string;
  sizes?: string;
  objectPosition?: string;
  tone?: keyof typeof tones;
  className?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image src={src} alt={label} fill sizes={sizes} className="object-cover" style={{ objectPosition }} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative overflow-hidden bg-gradient-to-b", tones[tone], className)}
    >
      <svg
        aria-hidden
        viewBox="0 0 200 300"
        preserveAspectRatio="xMidYMax meet"
        className="absolute inset-x-0 bottom-0 mx-auto h-4/5 w-auto"
      >
        <path
          d="M30 300 V120 A70 70 0 0 1 170 120 V300"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
        />
        <path
          d="M45 300 V125 A55 55 0 0 1 155 125 V300"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.6"
        />
      </svg>
      <span className="absolute bottom-3 start-3 text-[0.65rem] tracking-[0.2em] uppercase">
        {label}
      </span>
    </div>
  );
}
