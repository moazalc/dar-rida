"use client"

import { Link, useTheme } from "@payloadcms/ui"
import { usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"

export type NavGroupData = { label: string; items: { slug: string; label: string; href: string; badge?: string }[] }

/** Same rule as Payload"s own menu: a link is active on its own page and every page below it. */
const isActive = (pathname: string, href: string) =>
  pathname.startsWith(href) && (pathname.length === href.length || pathname[href.length] === "/")

export function NavLinks({
  dashboardHref,
  groups,
  text,
}: {
  dashboardHref: string
  groups: NavGroupData[]
  text: { overview: string; dashboard: string }
}) {
  const pathname = usePathname() ?? ""
  const link = (href: string, label: string, active: boolean, badge?: string, id?: string) => (
    <Link
      aria-current={active ? "page" : undefined}
      className={`dr-nav__link${active ? " dr-nav__link--active" : ""}`}
      href={href}
      id={id}
      prefetch={false}
    >
      <span>{label}</span>
      {badge ? <span className="dr-nav__badge">{badge}</span> : null}
    </Link>
  )

  return (
    <div className="dr-nav__groups">
      <div className="dr-nav__group">
        <p className="dr-nav__label">{text.overview}</p>
        {link(dashboardHref, text.dashboard, pathname === dashboardHref)}
      </div>
      {groups.map((g) => (
        <div className="dr-nav__group" key={g.label}>
          <p className="dr-nav__label">{g.label}</p>
          {g.items.map((item) => (
            <div key={item.slug}>{link(item.href, item.label, isActive(pathname, item.href), item.badge, `nav-${item.slug}`)}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

const Sun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const Moon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

/** View-website link, the signed-in account, light/dark switch and log out, pinned to the bottom of the menu. */
export function NavFooter({
  accountHref,
  email,
  logout,
  role,
  text,
}: {
  accountHref: string
  email: string
  logout: ReactNode
  role: string
  text: { viewWebsite: string; toDark: string; toLight: string }
}) {
  const { theme, setTheme } = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  const switchLabel = next === "dark" ? text.toDark : text.toLight
  // Staff never count as visitors: Umami"s tracker skips any browser with this flag, and the admin shares the public
  // site"s origin (so it covers live preview and the staff"s own visits to the site too).
  useEffect(() => {
    try {
      localStorage.setItem("umami.disabled", "1")
    } catch {}
  }, [])
  return (
    <div className="dr-nav__footer">
      <Link className="dr-nav__user" href={accountHref} prefetch={false}>
        <span className="dr-nav__avatar" aria-hidden="true">
          {email.slice(0, 2).toUpperCase()}
        </span>
        <span className="dr-nav__who">
          <span className="dr-nav__email">{email}</span>
          <span className="dr-nav__role">{role}</span>
        </span>
      </Link>
      <div className="dr-nav__actions">
        <a className="dr-nav__site" href="/" target="_blank" rel="noopener">
          {text.viewWebsite} <span aria-hidden="true">↗</span>
        </a>
        <button aria-label={switchLabel} className="dr-nav__icon" onClick={() => setTheme(next)} title={switchLabel} type="button">
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
        <span className="dr-nav__icon dr-nav__logout">{logout}</span>
      </div>
    </div>
  )
}
