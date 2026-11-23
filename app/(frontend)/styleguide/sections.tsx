"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { AccordionItem } from "@/components/accordion";
import { MarketNote } from "@/components/commerce/market-note";
import { Price } from "@/components/commerce/price";
import { Rating } from "@/components/commerce/rating";
import { TrustBar, trustItems } from "@/components/commerce/trust-bar";
import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Radio } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToastProvider, useToast } from "@/components/ui/toast";

type Pairing = { id: string; label: string; style: CSSProperties };

/** The interactive half of the style guide: components, with a direction and font toolbar. */
export function ComponentSections({ pairings }: { pairings: Pairing[] }) {
  const { dict } = useI18n();
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [pairingId, setPairingId] = useState(pairings[0]?.id);
  const [open, setOpen] = useState(0);
  const pairing = pairings.find((p) => p.id === pairingId) ?? pairings[0];

  return (
    <ToastProvider closeLabel={dict.common.close}>
      <div
        role="toolbar"
        aria-label="Preview options"
        className="sticky top-0 z-40 -mx-4 flex flex-wrap items-center gap-4 border-y border-champagne bg-background/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8"
      >
        <Button variant="secondary" onClick={() => setDir(dir === "ltr" ? "rtl" : "ltr")} aria-pressed={dir === "rtl"}>
          {dir === "ltr" ? "Show right-to-left" : "Show left-to-right"}
        </Button>
        <label className="flex items-center gap-3 text-small">
          <span>Fonts</span>
          <Select value={pairingId} onChange={(e) => setPairingId(e.target.value)} className="min-w-72">
            {pairings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div dir={dir} lang={dir === "rtl" ? "ar" : undefined} style={pairing?.style} className="flex flex-col gap-24">
        <Block id="pairing" title="Font pairing">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-display">Quiet elegance, tailored for you</p>
            <p lang="ar" dir="rtl" className="font-heading text-h1">
              أناقة هادئة، مفصّلة لكِ
            </p>
            <p className="max-w-prose text-body">
              Every abaya is cut and sewn in Dubai to the measurements you give us. Ready in about two weeks, delivered with everything
              included.
            </p>
            <p lang="ar" dir="rtl" className="max-w-prose text-body">
              تُفصَّل كل عباءة وتُخاط في دبي على المقاسات التي تعطينا إياها. تجهز خلال أسبوعين تقريبًا، وتصلكِ شاملة كل شيء.
            </p>
          </div>
        </Block>

        <Block id="buttons" title="Buttons">
          {(["primary", "secondary", "quiet"] as const).map((variant) => (
            <Row key={variant} label={variant}>
              <Button variant={variant}>Add to bag</Button>
              <Button variant={variant} size="lg">
                Continue to payment
              </Button>
              <Button variant={variant} disabled>
                Unavailable
              </Button>
              <Button variant={variant} loading loadingLabel="Adding to bag">
                Add to bag
              </Button>
            </Row>
          ))}
          <Row label="long label">
            <div className="w-56">
              <Button className="w-full">Zur Einkaufstasche hinzufügen und weiter</Button>
            </div>
          </Row>
        </Block>

        <Block id="fields" title="Fields">
          <div className="grid gap-8 sm:grid-cols-2">
            <Field label="Full name">{(p) => <Input {...p} autoComplete="name" />}</Field>
            <Field label="Bust" hint="Around the fullest part, tape level">
              {(p) => <Input {...p} inputMode="decimal" />}
            </Field>
            <Field label="Waist" hint="At the narrowest point" error="Enter a number between 61 and 117">
              {(p) => <Input {...p} defaultValue="140" inputMode="decimal" />}
            </Field>
            <Field label="Country">
              {(p) => (
                <Select {...p} defaultValue="AE">
                  <option value="AE">United Arab Emirates</option>
                  <option value="LY">Libya</option>
                  <option value="GB">United Kingdom</option>
                </Select>
              )}
            </Field>
            <Field label="Gift note" hint="We print it on a card in the box">
              {(p) => <Textarea {...p} />}
            </Field>
            <div className="flex flex-col">
              <Checkbox label="This is a gift" />
              <Checkbox label="Send order updates on WhatsApp" defaultChecked />
              <fieldset className="mt-4">
                <legend className="text-small font-medium">Units</legend>
                <Radio name="sg-unit" value="cm" label="Centimetres" defaultChecked />
                <Radio name="sg-unit" value="in" label="Inches" />
              </fieldset>
            </div>
          </div>
        </Block>

        <Block id="feedback" title="Feedback and overlays">
          <Row label="badges">
            <Badge>Awaiting payment</Badge>
            <Badge tone="gold">Made for you</Badge>
            <Badge tone="success">Shipped</Badge>
            <Badge tone="danger">Cancelled</Badge>
          </Row>
          <Row label="skeleton">
            <div className="flex w-full max-w-sm flex-col gap-2">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Row>
          <div className="flex flex-col gap-6">
            <Divider />
            <Divider ornament />
          </div>
          <EmptyState title="Your bag is empty" body="Every piece is made to your measurements." action={<Button>See the collection</Button>} />
          <Row label="overlays">
            <ToastDemo />
            <Dialog>
              <DialogTrigger render={<Button variant="secondary" />}>Open a dialog</DialogTrigger>
              <DialogContent title="How to measure your bust" description="Keep the tape level and snug, not tight." closeLabel={dict.common.close}>
                <Button>Got it</Button>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger render={<Button variant="secondary" />}>Open the drawer</SheetTrigger>
              <SheetContent side={dir === "rtl" ? "left" : "right"} closeLabel={dict.common.close} className="p-6">
                <SheetTitle>Your measurements</SheetTitle>
                <p className="text-body text-muted-foreground">The drawer holds longer tasks next to the page.</p>
              </SheetContent>
            </Sheet>
          </Row>
          <Tabs defaultValue="cm">
            <TabsList aria-label="Units">
              <TabsTrigger value="cm">Centimetres</TabsTrigger>
              <TabsTrigger value="in">Inches</TabsTrigger>
            </TabsList>
            <TabsPanel value="cm">Bust 92 cm</TabsPanel>
            <TabsPanel value="in">Bust 36.2 in</TabsPanel>
          </Tabs>
          <div>
            {["Fabric and care", "Delivery"].map((title, i) => (
              <AccordionItem key={title} title={title} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
                <p className="text-body text-muted-foreground">Japanese crepe, 220 g/m². Dry clean, or hand wash cold.</p>
              </AccordionItem>
            ))}
          </div>
        </Block>

        <Block id="commerce" title="Commerce">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Labelled label="UAE, with Tabby">
              <Price minor={290000} currency="aed" market="uae" labels={dict.price} showTabby />
            </Labelled>
            <Labelled label="Libya">
              <Price minor={80000} currency="usd" market="libya" labels={dict.price} />
            </Labelled>
            <Labelled label="Global">
              <Price minor={80000} currency="usd" market="global" labels={dict.price} />
            </Labelled>
            <Labelled label="No price here">
              <Price minor={null} currency="usd" market="global" labels={dict.price} />
            </Labelled>
          </div>
          {(["uae", "libya", "global"] as const).map((m) => (
            <Labelled key={m} label={`Trust bar: ${m}`}>
              <TrustBar items={trustItems(m, dict)} />
            </Labelled>
          ))}
          <MarketNote countryName="the United Arab Emirates" labels={dict.market} onChange={() => {}} onDismiss={() => {}} />
          <Row label="rating">
            <Rating value={4.5} label="4.5 out of 5" />
            <span className="text-small text-muted-foreground">4.5 · 12 reviews</span>
          </Row>
        </Block>

        <section id="dark" data-ground="dark" className="-mx-4 flex flex-col gap-6 bg-espresso px-4 py-16 text-ivory sm:-mx-8 sm:px-8">
          <h2 className="font-heading text-h1">Dark ground</h2>
          <p className="max-w-prose text-body text-ivory/80">Tab here: the focus ring turns ivory so it stays visible.</p>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-ivory text-charcoal hover:bg-ivory/90">Book a fitting</Button>
            <a href="#dark" className="self-center text-gold-soft underline underline-offset-4">
              Read about the atelier
            </a>
          </div>
        </section>
      </div>
    </ToastProvider>
  );
}

function ToastDemo() {
  const { show } = useToast();
  return (
    <Button variant="secondary" onClick={() => show("Added to your bag")}>
      Show a toast
    </Button>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-8">
      <h2 id={`${id}-title`} className="border-b border-champagne pb-3 font-heading text-h1">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[8rem_1fr] sm:items-center">
      <span className="text-caption tracking-[0.14em] text-muted-foreground uppercase">{label}</span>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption tracking-[0.14em] text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  );
}
