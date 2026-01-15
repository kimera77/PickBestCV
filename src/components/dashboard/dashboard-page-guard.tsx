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
    // user is undefined = still loading
    // user is null = not authenticated
    // user is object = authenticated
    
    if (user === undefined) {
      // Still loading, show spinner
      setIsVerifying(true);
      return;
    }

    if (user === null) {
      // Not authenticated, redirect to login
      router.push('/login');
    } else {
      // Authenticated, show dashboard
      setIsVerifying(false);
    }
  }, [user, router]);

  if (isVerifying || user === undefined) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
