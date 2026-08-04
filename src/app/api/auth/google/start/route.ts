import { NextResponse } from "next/server";

import { getGoogleAuthClient } from "@/lib/krutai-server";
import {
  createGoogleOAuthCookie,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
} from "@/server/api/cookies";
import { getGoogleOAuthRedirectUri } from "../utils";

export async function GET(request: Request) {
  const auth = await getGoogleAuthClient(getGoogleOAuthRedirectUri(request));
  const oauth = auth.startGoogleOAuth();
  const response = NextResponse.redirect(oauth.authorizationUrl);

  response.headers.append(
    "Set-Cookie",
    createGoogleOAuthCookie(GOOGLE_OAUTH_STATE_COOKIE, oauth.state)
  );
  response.headers.append(
    "Set-Cookie",
    createGoogleOAuthCookie(
      GOOGLE_OAUTH_VERIFIER_COOKIE,
      oauth.codeVerifier
    )
  );

  return response;
}
