import { LanguageProvider } from "@/components/dashboard/language-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen items-center justify-center bg-background p-4 pattern-dots pattern-primary/10 pattern-bg-background pattern-size-4 pattern-opacity-20">
        {children}
      </div>
    </LanguageProvider>
  );
}
