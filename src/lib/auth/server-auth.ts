import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};

export const serverAuth = getFirebaseAuth({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  serviceAccount,
});
