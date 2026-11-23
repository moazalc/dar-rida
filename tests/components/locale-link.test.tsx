import { describe, expect, it } from "vitest";
import LocaleLink from "@/components/locale-link";
import { I18nProvider } from "@/components/providers/i18n-provider";
import en from "@/lib/i18n/dictionaries/en";
import { render } from "../render";

describe("LocaleLink", () => {
  it("prefixes the page's language", () => {
    const html = render(
      <I18nProvider value={{ locale: "ar", dir: "rtl", dict: en }}>
        <LocaleLink href="/collection">Collection</LocaleLink>
      </I18nProvider>,
    );
    expect(html).toContain('href="/ar/collection"');
  });
  it("leaves the link alone outside the shop layout", () => {
    expect(render(<LocaleLink href="/collection">Collection</LocaleLink>)).toContain('href="/collection"');
  });
});
