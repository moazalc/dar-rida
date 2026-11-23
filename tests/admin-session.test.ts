import { describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const client = vi.fn(async () => ({ auth }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/payload", () => ({ payloadClient: () => client() }));

const { adminUser } = await import("@/lib/admin-session");

describe("adminUser", () => {


  it("ignores signed-in shop customers", async () => {
    auth.mockResolvedValue({ user: { id: 1, collection: "customers" } });
    expect(await adminUser()).toBeNull();
  });

  it("returns a signed-in admin", async () => {
    auth.mockResolvedValue({ user: { id: 2, collection: "users" } });
    expect(await adminUser()).toEqual({ id: 2, collection: "users" });
  });

  it("treats a failed session check as signed out", async () => {
    auth.mockImplementation(() => Promise.reject(new Error("db down")));
    expect(await adminUser()).toBeNull();
  });

  it("treats an unreachable database as signed out", async () => {
    client.mockImplementationOnce(() => Promise.reject(new Error("cannot connect to Postgres")));
    expect(await adminUser()).toBeNull();
  });
});
