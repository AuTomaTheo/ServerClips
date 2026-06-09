import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const GUEST_SESSION_COOKIE = "sc_session";
const MAX_AGE = 60 * 60 * 24 * 365;

/** Read-only — safe in Server Components (pages). */
export async function getGuestSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_SESSION_COOKIE)?.value;
}

/** Route handlers only — creates cookie if missing. */
export async function getOrCreateGuestSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(GUEST_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(GUEST_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      maxAge: MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }
  return sessionId;
}

export function getGuestSessionIdFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`${GUEST_SESSION_COOKIE}=([^;]+)`));
  return match?.[1];
}
