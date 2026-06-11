import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/utils";

export const Separator = React.forwardRef(({ className, orientation = "horizontal", ...props }, ref) => (
  <SeparatorPrimitive.Root
    className={cn(
      "shrink-0 bg-border/80",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    orientation={orientation}
    ref={ref}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
