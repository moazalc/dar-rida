import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { render } from "../render";

describe("Button", () => {
  it("primary is charcoal on ivory and 44px tall", () => {
    const html = render(<Button>Add to bag</Button>);
    expect(html).toContain("bg-primary");
    expect(html).toContain("min-h-11");
  });

  it("loading disables and announces", () => {
    const html = render(
      <Button loading loadingLabel="Adding to bag">
        Add to bag
      </Button>,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/\sdisabled(=""|\s|>)/);
    expect(html).toMatch(/<span class="sr-only">Adding to bag<\/span>/);
  });

  it("button wraps long labels", () => {
    const html = render(<Button>Zur Einkaufstasche hinzufügen und weiter</Button>);
    expect(html).not.toContain("whitespace-nowrap");
    expect(html).not.toContain("truncate");
  });

  it("secondary uses the strong line", () => {
    expect(render(<Button variant="secondary">Change</Button>)).toContain("border-line-strong");
  });
});
