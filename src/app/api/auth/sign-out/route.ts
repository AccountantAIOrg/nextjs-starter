import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthClient } from "@/lib/krutai-server";

const SESSION_COOKIE = "krutai_auth_session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (token) {
      const auth = await getAuthClient();
      await auth.signOut(token);
    }

    cookieStore.delete(SESSION_COOKIE);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign out.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
