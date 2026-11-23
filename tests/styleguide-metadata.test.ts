import { describe, expect, it, vi } from "vitest";

const adminUser = vi.fn();
vi.mock("@/lib/admin-session", () => ({ adminUser: () => adminUser() }));
vi.mock("@/app/(frontend)/styleguide/sections", () => ({ ComponentSections: () => null }));
vi.mock("@/app/(frontend)/styleguide/candidate-fonts", () => ({ fontPairings: [] }));

const { generateMetadata } = await import("@/app/(frontend)/styleguide/page");

describe("style guide metadata", () => {
  it("gives signed-out visitors no hint the page exists", async () => {
    adminUser.mockResolvedValue(null);
    const meta = await generateMetadata();
    expect(meta.title).toBeUndefined();
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("titles the page for the admin", async () => {
    adminUser.mockResolvedValue({ id: 1 });
    expect((await generateMetadata()).title).toBe("Style guide");
  });
});
