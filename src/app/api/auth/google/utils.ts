const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

function getConfiguredAppOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.VERCEL_URL;

  if (!configuredOrigin) {
    return undefined;
  }

  const originWithProtocol = configuredOrigin.startsWith("http")
    ? configuredOrigin
    : `https://${configuredOrigin}`;

  return originWithProtocol.replace(/\/$/, "");
}

export function getGoogleOAuthRedirectUri(request: Request) {
  const origin = getConfiguredAppOrigin() ?? new URL(request.url).origin;
  return `${origin}${GOOGLE_CALLBACK_PATH}`;
}

export function getAuthRedirectUrl(request: Request, path: string) {
  const origin = getConfiguredAppOrigin() ?? new URL(request.url).origin;
  return new URL(path, origin);
}
