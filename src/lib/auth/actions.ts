"use server";

import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifySessionCookie } from "@/firebase/server";
import { AppError, ErrorCodes, logError } from "@/lib/errors";

export async function handleSignOut() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    revalidatePath('/');
    redirect('/login');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    return await verifySessionCookie(sessionCookie);
  } catch (error) {
    logError(error, { action: 'getCurrentUser' });
    cookieStore.delete("session");
    return null;
  }
}

/**
 * Helper to require authentication in server actions
 * TEMPORAL: Sin validación de cookies mientras usamos Firebase Auth solo del cliente
 * TODO: Implementar verificación con Firebase Admin SDK cuando se agreguen cookies de sesión
 */
export async function requireAuth() {
  // TEMPORAL: Como no hay cookies de sesión, no podemos verificar en el servidor
  // La seguridad se maneja en el cliente con DashboardPageGuard
  // Esta función existe para mantener la interfaz, pero no valida
  
  // TODO: Implementar verificación real cuando se agreguen cookies de sesión
  // Por ahora, retornamos un objeto básico que indica que no hay verificación server-side
  return {
    uid: '', // El UID real vendrá del cliente en los datos
    email: null,
    email_verified: false
  };
}
