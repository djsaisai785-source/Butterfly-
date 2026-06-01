import { createAuthClient } from "better-auth/react";

export const TOKEN_KEY = "bearer_token";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem(TOKEN_KEY) ?? "",
    },
    onSuccess: (ctx) => {
      // Auto-capture token from any auth response
      const token = ctx.response.headers.get("set-auth-token");
      if (token) localStorage.setItem(TOKEN_KEY, token.split(".")[0]);
    },
  },
});

/** Call in onSuccess of signIn/signUp to capture the bearer token */
export function captureToken(ctx: { response: Response; data?: any }) {
  const headerToken = ctx.response.headers.get("set-auth-token");
  if (headerToken) {
    // Store only the short token portion (before the dot signature)
    localStorage.setItem(TOKEN_KEY, headerToken.split(".")[0]);
    return;
  }
  // Fallback: token from JSON response body
  const bodyToken = (ctx.data as any)?.token;
  if (bodyToken) {
    localStorage.setItem(TOKEN_KEY, bodyToken.split(".")[0]);
  }
}

/** Clear stored token on sign-out */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
