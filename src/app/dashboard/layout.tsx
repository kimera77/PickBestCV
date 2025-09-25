import type { PropsWithChildren } from "react";
import Header from "@/components/dashboard/header";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
