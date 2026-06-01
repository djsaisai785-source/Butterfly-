import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AutumnProvider } from "autumn-js/react";
import "./styles.css";
import App from "./app.tsx";
import { ToastProvider } from "./components/Toast.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AutumnProvider useBetterAuth>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AutumnProvider>
      </Router>
    </QueryClientProvider>
  </StrictMode>,
);
