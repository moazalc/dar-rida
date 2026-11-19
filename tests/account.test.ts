import { describe, expect, it } from "vitest";
import {
  cleanProfileName,
  cleanText,
  customerStatus,
  MAX_BAG_LINES,
  mergeLines,
  parseAddress,
  pickAddress,
  safeNext,
} from "@/lib/account";
import { codeEmail } from "@/lib/auth/emails";
import ar from "@/lib/i18n/dictionaries/ar";
import en from "@/lib/i18n/dictionaries/en";

describe("safeNext", () => {
  it("keeps paths on this site", () => {
    expect(safeNext("/cart")).toBe("/cart");
    expect(safeNext("/collection/rida-01?x=1")).toBe("/collection/rida-01?x=1");
  });

  it("refuses other sites and odd input", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "evil.com", "", "/x\nSet-Cookie:a", 42, null, undefined]) {
      expect(safeNext(bad)).toBe("/account");
    }
    expect(safeNext("//evil.com", "/cart")).toBe("/cart");
  });
});

describe("customerStatus", () => {
  it("reads orders the way a customer would", () => {
    expect(customerStatus("paid")).toBe("making");
    expect(customerStatus("in_production")).toBe("making");
    expect(customerStatus("shipped")).toBe("shipped");
    expect(customerStatus("completed")).toBe("delivered");
    expect(customerStatus("cancelled")).toBe("cancelled");
  });

  it("hides unpaid checkouts", () => {
    expect(customerStatus("pending_payment")).toBeNull();
  });
});

describe("mergeLines", () => {
  const line = (id: string, quantity = 1) => ({ id, quantity });

  it("puts the account's lines first and drops the moved lines' ids", () => {
    expect(mergeLines([line("a")], [line("b", 2)])).toEqual([{ id: "a", quantity: 1 }, { quantity: 2 }]);
  });

  it("works with either side empty", () => {
    expect(mergeLines([], [line("b")])).toEqual([{ quantity: 1 }]);
    expect(mergeLines([line("a")], [])).toEqual([line("a")]);
  });

  it("never goes past the bag's limit", () => {
    const account = Array.from({ length: MAX_BAG_LINES - 1 }, (_, i) => line(`a${i}`));
    const merged = mergeLines(account, [line("b1"), line("b2"), line("b3")]);
    expect(merged).toHaveLength(MAX_BAG_LINES);
    expect(merged.slice(0, -1)).toEqual(account);
  });
});

describe("pickAddress", () => {
  const home = { id: "1", country: "AE", isDefault: false };
  const work = { id: "2", country: "AE", isDefault: true };
  const london = { id: "3", country: "GB", isDefault: false };
  const all = [home, work, london];

  it("uses the one chosen in the bag, when it is in this country", () => {
    expect(pickAddress(all, "AE", "1")).toBe(home);
  });

  it("falls back to the default, then any address in the country", () => {
    expect(pickAddress(all, "AE", "3")).toBe(work);
    expect(pickAddress(all, "AE")).toBe(work);
    expect(pickAddress(all, "GB")).toBe(london);
  });

  it("is null for a country with no saved address, or no country", () => {
    expect(pickAddress(all, "FR")).toBeNull();
    expect(pickAddress(all, null, "1")).toBeNull();
  });
});

describe("parseAddress", () => {
  const good = { name: " Fatima  Ali ", phone: "", line1: "Villa 12", line2: "", city: "Dubai", state: "", postalCode: "", country: "ae" };

  it("cleans a good address", () => {
    const r = parseAddress(good);
    expect(r).toEqual({ ok: true, address: { ...good, name: "Fatima Ali", country: "AE" } });
  });

  it("names every field that needs fixing", () => {
    const r = parseAddress({ ...good, name: "", city: "x".repeat(101), country: "ZZ" });
    expect(r).toEqual({ ok: false, fields: ["name", "city", "country"] });
  });

  it("refuses non-strings", () => {
    expect(parseAddress({ ...good, line1: 5 }).ok).toBe(false);
  });
});

describe("profile names and details", () => {
  it("trims and limits names", () => {
    expect(cleanProfileName("  Mama  ")).toBe("Mama");
    expect(cleanProfileName("")).toBeNull();
    expect(cleanProfileName("x".repeat(41))).toBeNull();
    expect(cleanProfileName(7)).toBeNull();
  });

  it("caps free text", () => {
    expect(cleanText("  a   b ", 10)).toBe("a b");
    expect(cleanText("abcdef", 3)).toBe("abc");
    expect(cleanText(undefined, 3)).toBe("");
  });
});

describe("codeEmail", () => {
  it("puts the code in the subject and body, in English", () => {
    const email = codeEmail("123456", en, "en");
    expect(email.subject).toBe("123456 is your Dar Rida sign-in code");
    expect(email.html).toContain("123456");
    expect(email.html).toContain('dir="ltr"');
    expect(email.text).toContain("10 minutes");
  });

  it("is right-to-left in Arabic", () => {
    const email = codeEmail("654321", ar, "ar");
    expect(email.html).toContain('lang="ar" dir="rtl"');
    expect(email.subject).toContain("654321");
  });
});
