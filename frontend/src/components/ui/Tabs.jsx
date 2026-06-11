import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    className={cn("inline-flex h-auto items-center gap-2 rounded-2xl border border-border bg-surface/70 p-1 shadow-card", className)}
    ref={ref}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex min-w-[120px] items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-text data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-card",
      className
    )}
    ref={ref}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content className={cn("mt-4 focus-visible:outline-none", className)} ref={ref} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
