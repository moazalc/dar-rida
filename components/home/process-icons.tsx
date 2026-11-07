/**
 * Thin line icons for the four "How it is made" steps: an abaya (chosen), a
 * dress form with a tape measure (measured), a needle and thread (sewn) and a
 * parcel (sent). Decorative — each step's title says the same thing in words.
 */

const common = {
  viewBox: "0 0 80 80",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Chosen({ className }: { className?: string }) {
  return (
    <svg {...common} className={className}>
      <path d="M32 10q8-3 16 0l12 5-2 14-6-2 4 43q-16 4-32 0l4-43-6 2-2-14z" />
      <path d="M36 11q4 8 8 0" />
      <path d="M40 13v57" strokeOpacity={0.4} />
    </svg>
  );
}

function Measured({ className }: { className?: string }) {
  return (
    <svg {...common} className={className}>
      <path d="M38.6 4.5h2.8v3h-2.8z" />
      <path d="M37.5 12C38 10.5 38.3 9 38.6 7.5H41.4C41.7 9 42 10.5 42.5 12C47 13 51 14 53 16.5C54 18 53.5 20 52.5 22C51 25 51.5 27 50 29C48.5 31 47 32 47 34C47 36 50 38 50.5 41C50.7 42.5 50.5 43.5 50 44H30C29.5 43.5 29.3 42.5 29.5 41C30 38 33 36 33 34C33 32 31.5 31 30 29C28.5 27 29 25 27.5 22C26.5 20 26 18 27 16.5C29 14 33 13 37.5 12Z" />
      <path d="M36.5 44v1.8h7V44" />
      <path d="M40 45.8V69M38.3 57h3.4" />
      <path d="M40 69L28.5 77M40 69L51.5 77M40 69v6.5" />
      <path d="M33 32.4Q40 34.6 47 32.4M33.1 35Q40 37.2 46.9 35" strokeWidth={1} />
      <path d="M36.5 33.6v1.6M40 34.1v1.8M43.5 33.6v1.6" strokeWidth={0.8} />
      <path d="M47 32.8C50.5 36.5 48.6 41.5 51.6 46.6M46.9 35.2C49 38.8 47.2 43 49.6 47.6L51.6 46.6" />
    </svg>
  );
}

function Sewn({ className }: { className?: string }) {
  return (
    <svg {...common} className={className}>
      <path d="M18 64L58 14" />
      <ellipse cx="60" cy="12" rx="2.2" ry="4" transform="rotate(38 60 12)" />
      <path d="M58 14c10 8 4 22-8 26s-24 4-30 16" strokeDasharray="3 3" />
    </svg>
  );
}

function Sent({ className }: { className?: string }) {
  return (
    <svg {...common} className={className}>
      <path d="M14 30l26-12 26 12v28L40 70 14 58z" />
      <path d="M14 30l26 12 26-12M40 42v28" />
      <path d="M27 24l26 12" strokeOpacity={0.5} />
    </svg>
  );
}

export const processIcons = [Chosen, Measured, Sewn, Sent];
