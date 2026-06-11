import * as React from "react";
import { cn } from "../../lib/utils";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[120px] w-full rounded-2xl border border-border bg-slate-900/70 px-4 py-3 text-sm text-text placeholder:text-muted/80 focus-visible:border-primary focus-visible:outline-none",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
