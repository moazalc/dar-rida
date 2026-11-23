import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Components must mirror in Arabic, so spacing and position use logical
// utilities (ps-, me-, start-), never physical ones (pl-, mr-, left-).
const dirs = ["components/ui", "components/commerce"].filter((d) => existsSync(d));
const files = dirs.flatMap((d) => readdirSync(d).filter((f) => f.endsWith(".tsx")).map((f) => path.join(d, f)));

describe("no physical direction classes", () => {
  it.each(files)("%s", (file) => {
    const src = readFileSync(file, "utf8");
    expect(src).not.toMatch(/["'\s](pl|pr|ml|mr|left|right|border-l|border-r|rounded-l|rounded-r)-[\w[]/);
    expect(src).not.toMatch(/\btext-(left|right)\b/);
  });
});
