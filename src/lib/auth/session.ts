import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { cookies } from "next/headers";
import "server-only";

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
};

const serverAuth = getFirebaseAuth({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  serviceAccount,
});

export async function getCurrentUser() {
  const session = cookies().get("session")?.value;
  if (!session) {
    return null;
  }

  try {
    const user = await serverAuth.verifySessionCookie(session, true);
    return user;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}
