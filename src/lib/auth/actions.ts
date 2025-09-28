"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { serverAuth } from "./server-auth";


const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre es obligatorio." }),
  lastName: z.string().min(1, { message: "Los apellidos son obligatorios." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function setAuthCookies(idToken: string) {
  const tokens = await serverAuth.getTokens(idToken);
  const session = await serverAuth.createSession(tokens.token, {
    // optional session claims
  });

  cookies().set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

function getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'EMAIL_EXISTS':
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está en uso por otra cuenta.';
        case 'INVALID_EMAIL':
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'OPERATION_NOT_ALLOWED':
        case 'auth/operation-not-allowed':
            return 'El inicio de sesión con correo y contraseña no está habilitado.';
        case 'WEAK_PASSWORD':
        case 'auth/weak-password':
            return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
        case 'auth/user-disabled':
            return 'Este usuario ha sido deshabilitado.';
        case 'INVALID_LOGIN_CREDENTIALS':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Correo electrónico o contraseña incorrectos.';
        case 'CONFIGURATION_NOT_FOUND':
            return 'La configuración de autenticación del servidor no se ha encontrado. Por favor, contacta con el administrador.';
        default:
            return `Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo. Código: ${errorCode}`;
    }
}


export async function handleSignUp(values: z.infer<typeof signUpSchema>) {
  const validated = signUpSchema.safeParse(values);

  if (!validated.success) {
    const errorMessages = validated.error.errors.map(e => e.message).join(' ');
    return { error: `Los datos proporcionados no son válidos: ${errorMessages}` };
  }

  const { email, password, firstName, lastName } = validated.data;
  
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          returnSecureToken: true
      })
  });

  const data = await res.json();

  if (!res.ok) {
      return { error: getFirebaseErrorMessage(data?.error?.message) };
  }

  await setAuthCookies(data.idToken);
  
  return { success: true };
}

export async function handleSignIn(values: z.infer<typeof signInSchema>) {
  const validated = signInSchema.safeParse(values);
  if (!validated.success) {
      const errorMessages = validated.error.errors.map(e => e.message).join(' ');
      return { error: `Los datos proporcionados no son válidos: ${errorMessages}` };
  }

  const { email, password } = validated.data;

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
      })
  });

  const data = await res.json();

  if (!res.ok) {
      return { error: getFirebaseErrorMessage(data?.error?.message) };
  }

  await setAuthCookies(data.idToken);
  
  return { success: true };
}

export async function handleSignOut() {
    cookies().delete("session");
    revalidatePath('/');
    redirect('/');
}
