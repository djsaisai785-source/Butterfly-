import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const baseURL =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:4200";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    onSuccess: async (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) {
        await SecureStore.setItemAsync("auth_token", token);
      }
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync("auth_token");
}

export async function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync("auth_token");
}
