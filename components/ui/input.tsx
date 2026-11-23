import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { controlClass } from "./control";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return <input type={type} className={cn(controlClass, className)} {...props} />;
}
