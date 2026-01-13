"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardPageGuard({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // We need to wait for the initial auth state to be determined.
    // The useAuth hook might return null initially while it's loading.
    // If we don't wait, we might redirect unecessarily.
    // A better approach in a real app might involve a global loading state.
    const timer = setTimeout(() => {
        if (user === undefined) {
          // Still loading, do nothing yet. The effect will re-run when user changes.
          return;
        }

        if (user === null) {
          router.push('/login');
        } else {
          setIsVerifying(false);
        }
    }, 500); // Give a moment for the auth state to settle.

    return () => clearTimeout(timer);

  }, [user, router]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
