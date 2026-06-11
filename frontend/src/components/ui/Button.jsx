import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-primary px-4 py-3 text-white shadow-card hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-soft",
        secondary:
          "border border-border bg-surface/70 px-4 py-3 text-text hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface",
        ghost: "px-4 py-3 text-muted hover:bg-surface/80 hover:text-text",
        outline: "border border-border bg-transparent px-4 py-3 text-text hover:border-primary/40 hover:bg-surface/65",
      },
      size: {
        default: "",
        sm: "rounded-xl px-3 py-2 text-xs",
        lg: "rounded-2xl px-5 py-3.5",
        icon: "h-11 w-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
