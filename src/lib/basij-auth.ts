import { cookies } from "next/headers";
import { getBasijSession, getBasijSessionCookieName, deleteBasijSession } from "@/lib/basij-session";
import { getMemberById, safeMember } from "@/lib/basij-store";

export async function getBasijMemberFromCookies() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get?.(getBasijSessionCookieName())?.value;
    if (!sessionId) return null;
    const session = getBasijSession(sessionId);
    if (!session) return null;
    const member = getMemberById(session.memberId);
    if (!member) {
      deleteBasijSession(sessionId);
      return null;
    }
    return safeMember(member);
  } catch (error) {
    console.error("Basij auth read failed", error);
    return null;
  }
}
