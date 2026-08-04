import { NextResponse } from "next/server";

import { getGoogleAuthClient } from "@/lib/krutai-server";
import {
  createDeletedGoogleOAuthCookie,
  createSessionCookie,
  getCookie,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
} from "@/server/api/cookies";
import { getAuthRedirectUrl, getGoogleOAuthRedirectUri } from "../utils";

function clearGoogleOAuthCookies(response: NextResponse) {
  response.headers.append(
    "Set-Cookie",
    createDeletedGoogleOAuthCookie(GOOGLE_OAUTH_STATE_COOKIE)
  );
  response.headers.append(
    "Set-Cookie",
    createDeletedGoogleOAuthCookie(GOOGLE_OAUTH_VERIFIER_COOKIE)
  );
}

function redirectToSignIn(request: Request) {
  const response = NextResponse.redirect(
    getAuthRedirectUrl(request, "/sign-in?google=failed")
  );
  clearGoogleOAuthCookies(response);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const cookieHeader = request.headers.get("cookie");
  const expectedState = getCookie(cookieHeader, GOOGLE_OAUTH_STATE_COOKIE);
  const codeVerifier = getCookie(cookieHeader, GOOGLE_OAUTH_VERIFIER_COOKIE);

  if (oauthError || !code || !state || !expectedState || !codeVerifier) {
    return redirectToSignIn(request);
  }

  try {
    const auth = await getGoogleAuthClient(getGoogleOAuthRedirectUri(request));
    const result = await auth.completeGoogleOAuth({
      code,
      state,
      expectedState,
      codeVerifier,
    });
    const session = await auth.getSession(result.token);
    const response = NextResponse.redirect(getAuthRedirectUrl(request, "/"));

    response.headers.append(
      "Set-Cookie",
      createSessionCookie(result.token, session.session.expiresAt)
    );
    clearGoogleOAuthCookies(response);

    return response;
  } catch {
    return redirectToSignIn(request);
  }
}
