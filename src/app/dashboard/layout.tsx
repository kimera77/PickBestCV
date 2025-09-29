import type { PropsWithChildren } from "react";
import Header from "@/components/dashboard/header";
import { LanguageProvider } from "@/components/dashboard/language-provider";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { redirect } from 'next/navigation';
import { getCurrentUser } from "@/lib/auth/actions";

export default async function DashboardLayout({ children }: PropsWithChildren) {
    const user = await getCurrentUser();
    /*
    if (!user) {
        redirect('/login');
    }
    */

  return (
    <AuthProvider user={user}>
      <LanguageProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Header />
          <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
