/**
 * Visitor figures for the dashboard, read from the self-hosted Umami API on the server (UMAMI_URL, UMAMI_WEBSITE_ID,
 * UMAMI_USERNAME, UMAMI_PASSWORD). Unset or unreachable never breaks the dashboard: the cards say so instead.
 * The cached figures hold no wording (a direct visit is an empty referrer label), so they serve both admin languages.
 */

import type { AdminLang } from "../i18n";

const DAY = 86_400_000
const DUBAI = 4 * 3_600_000 // UTC+4, no daylight saving
const TIMEOUT = 3_000
const CACHE_FOR = 2 * 60_000

export type Analytics =
  | { status: "off" }
  | { status: "error" }
  | {
      status: "ok"
      visitors7: number
      visitorsPrev7: number
      weeks: { start: string; visitors: number }[]
      pages: { label: string; count: number }[]
      referrers: { label: string; count: number }[]
      countries: { code: string; count: number }[]
    }

type Metric = { x: string | null; y: number }

/** The Monday (Dubai date, YYYY-MM-DD) starting each of the last `count` weeks, oldest first; the last is this week. */
export function weekStarts(now: Date, count = 12): string[] {
  const dubai = new Date(now.getTime() + DUBAI)
  const sinceMonday = (dubai.getUTCDay() + 6) % 7
  const monday = Date.UTC(dubai.getUTCFullYear(), dubai.getUTCMonth(), dubai.getUTCDate() - sinceMonday)
  return Array.from({ length: count }, (_, i) => new Date(monday - (count - 1 - i) * 7 * DAY).toISOString().slice(0, 10))
}

/** "/en/projects/villa-x?ref=1" stays a path; full URLs and our own host shrink to something readable. Empty for a direct visit. */
export function referrerLabel(x: string | null): string {
  if (!x) return ""
  return x.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
}

let token: string | null = null
let cached: { at: number; data: Analytics } | null = null

async function login(base: string): Promise<string> {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: process.env.UMAMI_USERNAME, password: process.env.UMAMI_PASSWORD }),
    signal: AbortSignal.timeout(TIMEOUT),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Umami login ${res.status}`)
  return ((await res.json()) as { token: string }).token
}

async function get<T>(base: string, path: string, retry = true): Promise<T> {
  token ??= await login(base)
  const res = await fetch(`${base}${path}`, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT),
    cache: "no-store",
  })
  // Tokens end when the password changes (or Umami restarts with a new secret): sign in again once.
  if (res.status === 401 && retry) {
    token = null
    return get(base, path, false)
  }
  if (!res.ok) throw new Error(`Umami ${path.split("?")[0]} ${res.status}`)
  return (await res.json()) as T
}

export async function loadAnalytics(now = new Date()): Promise<Analytics> {
  const base = process.env.UMAMI_URL?.replace(/\/$/, "")
  const site = process.env.UMAMI_WEBSITE_ID
  if (!base || !site || !process.env.UMAMI_USERNAME || !process.env.UMAMI_PASSWORD) return { status: "off" }
  if (cached && now.getTime() - cached.at < CACHE_FOR) return cached.data

  const end = now.getTime()
  const range = (from: number, to = end) => `startAt=${from}&endAt=${to}`
  const web = `/api/websites/${site}`
  type Stats = { visitors: number; comparison?: { visitors: number } }
  // Unique visitors per week need one count per week (Umami has no weekly series, and adding up days would count a
  // returning visitor once per day). Twelve small queries, in parallel, cached above.
  const weekRanges = weekStarts(now).map((start) => {
    const from = Date.parse(`${start}T00:00:00Z`) - DUBAI
    return { start, from, to: Math.min(from + 7 * DAY - 1, end) }
  })
  try {
    const [stats, weeks, pages, referrers, countries] = await Promise.all([
      get<Stats>(base, `${web}/stats?${range(end - 7 * DAY)}`),
      Promise.all(weekRanges.map((w) => get<Stats>(base, `${web}/stats?${range(w.from, w.to)}`).then((s) => ({ start: w.start, visitors: s.visitors ?? 0 })))),
      get<Metric[]>(base, `${web}/metrics?${range(end - 30 * DAY)}&type=path&limit=5`),
      get<Metric[]>(base, `${web}/metrics?${range(end - 30 * DAY)}&type=referrer&limit=5`),
      get<Metric[]>(base, `${web}/metrics?${range(end - 30 * DAY)}&type=country&limit=5`),
    ])
    const data: Analytics = {
      status: "ok",
      visitors7: stats.visitors ?? 0,
      visitorsPrev7: stats.comparison?.visitors ?? 0,
      weeks,
      pages: pages.map((p) => ({ label: p.x || "/", count: p.y })),
      referrers: referrers.map((r) => ({ label: referrerLabel(r.x), count: r.y })),
      countries: countries.map((c) => ({ code: c.x ?? "", count: c.y })),
    }
    cached = { at: now.getTime(), data }
    return data
  } catch (err) {
    console.warn("[dashboard] analytics unavailable:", (err as Error).message)
    // Remembered too, so a stopped Umami costs one timeout per cache period, not one per dashboard visit.
    cached = { at: now.getTime(), data: { status: "error" } }
    return cached.data
  }
}

/** "+12% on the previous 7 days" */
export function changeNote(current: number, previous: number, lang: AdminLang = "en"): string {
  const ar = lang === "ar"
  if (!previous) {
    if (current) return ar ? "لا زوار في الأيام السبعة السابقة" : "None the 7 days before"
    return ar ? "لا زوار بعد" : "No visitors yet"
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return ar ? "مثل الأيام السبعة السابقة" : "Same as the previous 7 days"
  const change = `${pct > 0 ? "+" : "−"}${Math.abs(pct)}%`
  // Isolated left-to-right, so the sign stays in front of the number inside Arabic text.
  return ar ? `\u2066${change}\u2069 مقارنة بالأيام السبعة السابقة` : `${change} on the previous 7 days`
}
