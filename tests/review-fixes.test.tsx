import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { TabsTrigger, Tabs, TabsList } from "@/components/ui/tabs";
import { stripLocale } from "@/lib/i18n/config";
import { routeLocale } from "@/lib/i18n/routing";
import { render } from "./render";

const req = (path: string) => new NextRequest(`https://darrida.net${path}`);

describe("#1 locale prefix can't reach hidden paths", () => {
  it.each(["/en/admin", "/ar/admin/login", "/en/atelier", "/en/api/orders/export", "/ar/print/orders/1", "/en/_next/x"])("%s is a 404", (path) => {
    const res = routeLocale(req(path));
    expect(res?.status).toBe(404);
    expect(res?.headers.get("x-middleware-rewrite")).toBe("https://darrida.net/__not-found");
  });
});

describe("#2/#3 stripLocale", () => {
  it("gives the path without the language", () => {
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/ar/")).toBe("/");
    expect(stripLocale("/ar/account/orders/DR-1")).toBe("/account/orders/DR-1");
    expect(stripLocale("/account")).toBe("/account");
    expect(stripLocale("/arrivals")).toBe("/arrivals");
  });
});

describe("#4 focus ring works on any ground", () => {
  const css = readFileSync("app/(frontend)/globals.css", "utf8");
  it("pairs the outline with an ivory halo and matches the dark element itself", () => {
    expect(css).toMatch(/:focus-visible\s*\{[^}]*box-shadow:[^}]*var\(--ivory\)/);
    expect(css).toMatch(/\[data-ground="dark"\]:focus-visible/);
  });
});

describe("#5 Tabs mark the active tab", () => {
  it("styles Base UI's data-active", () => {
    const html = render(
      <Tabs defaultValue="cm">
        <TabsList>
          <TabsTrigger value="cm">cm</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(html).toContain("data-active:border-foreground");
    expect(html).not.toContain("data-[selected]");
  });
});

describe("#6 Button can shrink and wrap inside a row", () => {
  it("is not shrink-0 and is capped at its container", () => {
    const cls = render(<Button>Перейти к оформлению заказа</Button>).match(/class="([^"]*)"/)![1].split(" ");
    expect(cls).not.toContain("shrink-0");
    expect(cls).toContain("max-w-full");
  });
});
