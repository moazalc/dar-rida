import { describe, expect, it } from "vitest";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Radio } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { render } from "../render";

describe("Field", () => {
  it("field links label, hint and control", () => {
    const html = render(
      <Field label="Bust" hint="Around the fullest part" id="bust">
        {(p) => <Input {...p} />}
      </Field>,
    );
    expect(html).toContain('for="bust"');
    expect(html).toContain('id="bust"');
    expect(html).toContain('aria-describedby="bust-hint"');
    expect(html).not.toContain("aria-invalid=");
  });

  it("field error is described and invalid", () => {
    const html = render(
      <Field label="Bust" hint="Around the fullest part" error="Enter a number between 76 and 140" id="bust">
        {(p) => <Input {...p} />}
      </Field>,
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="bust-hint bust-error"');
    expect(html).toContain('role="alert"');
  });

  it("controls use the strong line and a 44px height", () => {
    for (const html of [render(<Input />), render(<Select><option>UAE</option></Select>), render(<Textarea />)]) {
      expect(html).toContain("border-line-strong");
      expect(html).toContain("min-h-11");
    }
  });

  it("checkbox row is a 44px target", () => {
    const html = render(<Checkbox label="This is a gift" />);
    expect(html).toContain("min-h-11");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("This is a gift");
  });

  it("radio row is a 44px target", () => {
    const html = render(<Radio name="unit" value="cm" label="Centimetres" />);
    expect(html).toContain("min-h-11");
    expect(html).toContain('type="radio"');
  });
});
