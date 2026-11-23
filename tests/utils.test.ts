import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps the type-scale sizes next to a text colour", () => {
    expect(cn("text-small", "text-primary-foreground")).toBe("text-small text-primary-foreground");
    expect(cn("text-body text-foreground")).toBe("text-body text-foreground");
  });
  it("still lets a later size win over an earlier one", () => {
    expect(cn("text-small", "text-h3")).toBe("text-h3");
  });
});
