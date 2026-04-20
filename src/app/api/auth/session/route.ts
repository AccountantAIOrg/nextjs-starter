import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthClient } from "@/lib/krutai-server";

const SESSION_COOKIE = "krutai_auth_session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ message: "No active session." }, { status: 401 });
    }

    const auth = await getAuthClient();
    const session = await auth.getSession(token);

    return NextResponse.json({ session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read session.";
    return NextResponse.json({ message }, { status: 401 });
  }
}
