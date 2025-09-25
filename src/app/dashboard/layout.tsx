import type { PropsWithChildren } from "react";
import Header from "@/components/dashboard/header";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
