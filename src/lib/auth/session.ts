import { cookies } from "next/headers";
import "server-only";
import { serverAuth } from "./server-auth";


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
