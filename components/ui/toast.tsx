"use client";

import { Toast } from "@base-ui/react/toast";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

function Toasts({ closeLabel }: { closeLabel: string }) {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:end-4 sm:w-96">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className="flex items-start gap-3 border border-line-strong bg-card px-4 py-3 text-body text-foreground transition-opacity duration-fast data-ending-style:opacity-0 data-starting-style:opacity-0"
          >
            <Toast.Description className="flex-1 pt-2.5" />
            <Toast.Close render={<Button variant="quiet" size="icon" className="-me-3 no-underline" aria-label={closeLabel} />}>
              <XIcon aria-hidden="true" />
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

/** Wrap the app once. Messages are announced politely and close after 5 seconds. */
export function ToastProvider({ children, closeLabel = "Close" }: { children: ReactNode; closeLabel?: string }) {
  return (
    <Toast.Provider timeout={5000}>
      {children}
      <Toasts closeLabel={closeLabel} />
    </Toast.Provider>
  );
}

/** `show("Added to your bag")` from any client component under the provider. */
export function useToast(): { show: (message: string) => void } {
  const manager = Toast.useToastManager();
  return { show: (message) => void manager.add({ description: message }) };
}
