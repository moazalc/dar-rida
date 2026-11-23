import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { controlClass } from "./control";

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(controlClass, "resize-y", className)} {...props} />;
}
