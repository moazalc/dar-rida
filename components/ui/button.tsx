import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Heights are minimums with vertical padding, never fixed, so a long German or
// Russian label wraps to a second line instead of being cut off.
const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-2 [overflow-wrap:anywhere] rounded-lg text-center text-small font-medium tracking-[0.04em] transition-colors duration-fast ease-soft select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border border-line-strong bg-transparent text-foreground hover:bg-muted",
        quiet:
          "rounded-none text-foreground underline decoration-champagne underline-offset-4 hover:decoration-current",
      },
      size: {
        md: "min-h-11 px-6 py-2",
        lg: "min-h-12 px-8 py-3 text-body",
        icon: "size-11",
      },
    },
    compoundVariants: [{ variant: "quiet", className: "min-h-11 px-0 py-2" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Disables the button and shows a spinner; `loadingLabel` is read out instead. */
    loading?: boolean;
    loadingLabel?: string;
  };

function Button({ className, variant, size, loading = false, loadingLabel, disabled, children, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
          <span aria-hidden="true">{children}</span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
