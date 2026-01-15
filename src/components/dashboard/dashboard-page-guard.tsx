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
    console.log('🛡️ DashboardPageGuard - Estado del usuario:', user === undefined ? 'undefined (cargando)' : user === null ? 'null (sin autenticar)' : `autenticado: ${user.uid}`);
    
    // We need to wait for the initial auth state to be determined.
    // The useAuth hook might return null initially while it's loading.
    // If we don't wait, we might redirect unecessarily.
    // A better approach in a real app might involve a global loading state.
    const timer = setTimeout(() => {
        if (user === undefined) {
          // Still loading, do nothing yet. The effect will re-run when user changes.
          console.log('⏳ Esperando estado de auth...');
          return;
        }

        if (user === null) {
          console.log('❌ Usuario no autenticado, redirigiendo a login');
          router.push('/login');
        } else {
          console.log('✅ Usuario autenticado, mostrando dashboard');
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
