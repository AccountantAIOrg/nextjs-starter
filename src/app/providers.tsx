"use client";

import { lazy, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const QueryProvider = lazy(() =>
  import("./query-provider").then((mod) => ({ default: mod.QueryProvider }))
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <QueryProvider>
        <TooltipProvider>
          <Toaster />
          <Navbar />
          {children}
        </TooltipProvider>
      </QueryProvider>
    </Suspense>
  );
}
