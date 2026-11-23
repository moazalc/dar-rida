"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger {...props} />;
}

export function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close {...props} />;
}

/** A centred panel with a title, an optional description and a close button. */
export function DialogContent({
  title,
  description,
  closeLabel,
  className,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** The close button's accessible name, in the page's language. */
  closeLabel: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-espresso/30 transition-opacity duration-fast data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          "fixed inset-x-0 top-1/2 z-50 mx-auto flex max-h-[85vh] w-[min(36rem,calc(100vw-2rem))] -translate-y-1/2 flex-col gap-4 overflow-y-auto border border-line-strong bg-background p-6 text-foreground transition-opacity duration-fast data-ending-style:opacity-0 data-starting-style:opacity-0",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <DialogPrimitive.Title className="font-heading text-h3">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close render={<Button variant="quiet" size="icon" className="-me-3 -mt-2 no-underline" aria-label={closeLabel} />}>
            <XIcon aria-hidden="true" />
          </DialogPrimitive.Close>
        </div>
        {description ? (
          <DialogPrimitive.Description className="text-body text-muted-foreground">{description}</DialogPrimitive.Description>
        ) : null}
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}
