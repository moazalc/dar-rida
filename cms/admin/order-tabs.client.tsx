"use client";

import { useSearchParams } from "next/navigation";

type Tab = { status: string | null; label: string; href: string; count: number | null };

export function OrderTabLinks({ tabs, label }: { tabs: Tab[]; label: string }) {
  const active = useSearchParams()?.get("where[status][equals]") ?? null;
  return (
    <nav className="dr-tabs" aria-label={label}>
      {tabs.map((tab) => {
        const current = tab.status === active;
        return (
          <a key={tab.label} href={tab.href} className={`dr-tabs__tab${current ? " dr-tabs__tab--active" : ""}`} aria-current={current ? "page" : undefined}>
            {tab.label}
            {tab.count ? <span className="dr-tabs__count">{tab.count}</span> : null}
          </a>
        );
      })}
    </nav>
  );
}
