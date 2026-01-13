"use server";

import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifySessionCookie } from "@/firebase/server";

export async function handleSignOut() {
    cookies().delete("session");
    revalidatePath('/');
    redirect('/login');
}

export async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    return await verifySessionCookie(sessionCookie);
  } catch (error) {
    console.error("Error verifying session cookie, clearing it.", error);
    cookies().delete("session");
    return null;
  }
}
