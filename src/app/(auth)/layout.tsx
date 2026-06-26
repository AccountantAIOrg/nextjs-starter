import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { QueryProvider } from "../query-provider";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <TooltipProvider>
        <Toaster />
        <Navbar />
        <main>{children}</main>
      </TooltipProvider>
    </QueryProvider>
  );
}
