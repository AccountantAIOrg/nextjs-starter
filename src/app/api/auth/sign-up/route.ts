import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthClient } from "@/lib/krutai-server";

const SESSION_COOKIE = "krutai_auth_session";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();

    if (!email || !password || !name) {
      return jsonError("Name, email, and password are required.");
    }

    const auth = await getAuthClient();
    const result = await auth.signUpEmail({ email, password, name });
    const session = await auth.getSession(result.token);
    const cookieStore = await cookies();

    cookieStore.set({
      name: SESSION_COOKIE,
      value: result.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.max(
        60,
        Math.floor((new Date(session.session.expiresAt).getTime() - Date.now()) / 1000)
      ),
    });

    return NextResponse.json({ session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign up.";
    return jsonError(message, 500);
  }
}
