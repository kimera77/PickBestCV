import type { PropsWithChildren } from "react";
import Header from "@/components/dashboard/header";
import { LanguageProvider } from "@/components/dashboard/language-provider";
import ContactFooter from "@/components/dashboard/contact-footer";
import DashboardPageGuard from "@/components/dashboard/dashboard-page-guard";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <LanguageProvider>
      <DashboardPageGuard>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Header />
          <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
            {children}
          </main>
          <ContactFooter />
        </div>
      </DashboardPageGuard>
    </LanguageProvider>
  );
}
