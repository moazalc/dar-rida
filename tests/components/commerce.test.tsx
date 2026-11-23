import { describe, expect, it } from "vitest";
import { Price } from "@/components/commerce/price";
import { Rating } from "@/components/commerce/rating";
import { trustItems } from "@/components/commerce/trust-bar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import en from "@/lib/i18n/dictionaries/en";
import { render } from "../render";

const labels = en.price;

describe("Price", () => {
  it("price shows everything included in the UAE", () => {
    const html = render(<Price minor={290000} currency="aed" market="uae" labels={labels} />);
    expect(html).toContain("AED 2,900");
    expect(html).toContain("Everything included");
  });

  it("price shows duties line for global", () => {
    const html = render(<Price minor={80000} currency="usd" market="global" labels={labels} />);
    expect(html).toContain("$800");
    expect(html).toContain("Shipping, duties and taxes included");
  });

  it("price null shows unavailable", () => {
    const html = render(<Price minor={null} currency="usd" market="global" labels={labels} />);
    expect(html).toContain("Not available in your country");
    expect(html).not.toContain("$0");
  });

  it("tabby line only in the UAE", () => {
    expect(render(<Price minor={290000} currency="aed" market="uae" labels={labels} showTabby />)).toContain(
      "or 4 payments of AED 725",
    );
    expect(render(<Price minor={80000} currency="usd" market="global" labels={labels} showTabby />)).not.toContain(
      "4 payments",
    );
  });
});

describe("trust items", () => {
  it("trust items per market", () => {
    expect(trustItems("uae", en)).toEqual(["Made to measure in Dubai", "Everything included", "Book a fitting"]);
    expect(trustItems("libya", en)).toEqual(["Made to measure in Dubai", "Everything included", "Help on WhatsApp"]);
    expect(trustItems("global", en)[1]).toBe("Delivered worldwide, duties included");
  });
});

describe("Rating, Badge, EmptyState", () => {
  it("rating has a text alternative", () => {
    const html = render(<Rating value={4.5} label="4.5 out of 5" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="4.5 out of 5"');
  });

  it("badge wraps instead of clipping", () => {
    const html = render(<Badge tone="gold">Wird für Sie angefertigt</Badge>);
    expect(html).not.toContain("whitespace-nowrap");
    expect(html).not.toContain("truncate");
  });

  it("empty state shows its action", () => {
    const html = render(<EmptyState title="Your bag is empty" action={<button type="button">See the collection</button>} />);
    expect(html).toContain("Your bag is empty");
    expect(html).toContain("See the collection");
  });
});
