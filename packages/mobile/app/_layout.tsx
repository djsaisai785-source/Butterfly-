import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useSession } from "../lib/auth";
import { AutumnProvider } from "autumn-js/react";
import { LocationProvider } from "../lib/LocationContext";

const queryClient = new QueryClient();

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
};

// Routes that require auth
const PROTECTED_ROUTES = ["post", "messages"];

function AuthGuard() {
  const { data: session, isPending } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const currentRoute = segments[0] ?? "";
    const isProtected = PROTECTED_ROUTES.includes(currentRoute);
    const isAuthRoute = currentRoute === "sign-in" || currentRoute === "sign-up";

    if (isProtected && !session) {
      router.replace("/sign-in");
    } else if (isAuthRoute && session) {
      router.replace("/");
    }
  }, [session, isPending, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AutumnProvider useBetterAuth>
          <LocationProvider>
            <StatusBar style="light" />
            <AuthGuard />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.bg },
                animation: "fade_from_bottom",
              }}
            />
          </LocationProvider>
        </AutumnProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
