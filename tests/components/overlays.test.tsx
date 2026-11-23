import { describe, expect, it } from "vitest";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { ToastProvider } from "@/components/ui/toast";
import { render } from "../render";

describe("Tabs", () => {
  it("renders a tablist with the default tab selected", () => {
    const html = render(
      <Tabs defaultValue="cm">
        <TabsList aria-label="Units">
          <TabsTrigger value="cm">cm</TabsTrigger>
          <TabsTrigger value="in">in</TabsTrigger>
        </TabsList>
        <TabsPanel value="cm">Centimetres</TabsPanel>
      </Tabs>,
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain("min-h-11");
  });
});

describe("Dialog", () => {
  // Base UI renders the popup in a portal after mount, so static HTML only has the trigger.
  it("trigger announces a dialog", () => {
    const html = render(
      <Dialog>
        <DialogTrigger>Size help</DialogTrigger>
        <DialogContent title="How to measure" closeLabel="Close">
          Body
        </DialogContent>
      </Dialog>,
    );
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain("Size help");
  });
});

describe("Toast", () => {
  it("provider renders its children", () => {
    expect(render(<ToastProvider>page</ToastProvider>)).toContain("page");
  });
});
