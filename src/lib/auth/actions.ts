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
 * Throws AppError if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new AppError('No autenticado', ErrorCodes.UNAUTHORIZED, 401);
  }
  
  return user;
}
