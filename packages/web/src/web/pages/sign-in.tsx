import { useState } from "react";
import { Link, useLocation } from "wouter";
import { authClient, captureToken } from "../lib/auth";

const C = {
  bg: "#070711",
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.12)",
  text: "#F5F0E8",
  muted: "#7A748F",
  border: "#1A1830",
  surface: "#10101C",
  error: "#E74C3C",
};

export default function SignInPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await authClient.signIn.email(
      { email, password },
      { onSuccess: captureToken }
    );
    setLoading(false);
    if (err) {
      setError(err.message ?? "Email ou mot de passe incorrect");
    } else {
      navigate("/");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      backgroundImage: `radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.07) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(212,175,55,0.04) 0%, transparent 50%)`,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.gold, letterSpacing: 5, textTransform: "uppercase", display: "inline-block" }}>
              AURA
            </div>
          </Link>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>Tout est possible. 24h/24.</p>
        </div>

        {/* Card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 24, padding: "40px 36px",
        }}>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>
            Connexion
          </h1>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
            Pas encore inscrit ?{" "}
            <Link href="/sign-up" style={{ color: C.gold, textDecoration: "none", fontWeight: 600 }}>
              Créer un compte
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 600 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: C.bg, border: `1px solid ${C.border}`,
                  color: C.text, fontSize: 15, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 600 }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  background: C.bg, border: `1px solid ${C.border}`,
                  color: C.text, fontSize: 15, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)",
                borderRadius: 10, padding: "12px 16px", fontSize: 14, color: C.error,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "rgba(212,175,55,0.5)" : C.gold,
                color: "#070711", border: "none", borderRadius: 12,
                padding: "14px", fontSize: 16, fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 8, fontFamily: "inherit",
                boxShadow: loading ? "none" : `0 0 30px rgba(212,175,55,0.3)`,
                transition: "all 0.2s",
              }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
