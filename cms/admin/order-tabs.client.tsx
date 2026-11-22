"use client";

import { useSearchParams } from "next/navigation";

type Tab = { status: string | null; label: string; href: string; count: number | null };

/**
 * The step tabs, and an Export link that downloads exactly what the list shows:
 * the list's own query (tab, filters, search, sort) is passed on to the export.
 */
export function OrderTabLinks({ tabs, label, exportHref, exportLabel }: { tabs: Tab[]; label: string; exportHref: string; exportLabel: string }) {
  const params = useSearchParams();
  const active = params?.get("where[status][equals]") ?? null;
  const query = params?.toString();
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
      <a className="dr-tabs__export" href={query ? `${exportHref}?${query}` : exportHref} download>
        {exportLabel}
      </a>
    </nav>
  );
}
