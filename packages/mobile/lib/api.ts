import { hc } from "hono/client";
import Constants from "expo-constants";
import type { AppType } from "@template/web";
import { getToken } from "./auth";

const baseUrl =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL;

export function buildClient(token?: string | null) {
  return hc<AppType>(baseUrl!, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Default unauthenticated client (for public endpoints)
const client = hc<AppType>(baseUrl!);
export const api = client.api;

// Authenticated client factory
export async function authedApi() {
  const token = await getToken();
  return buildClient(token).api;
}
