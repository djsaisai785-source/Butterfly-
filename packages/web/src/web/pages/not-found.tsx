import { useLocation } from "wouter";

export default function NotFoundPage() {
  const [, navigate] = useLocation();
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-primary)", flexDirection: "column", gap: 24, textAlign: "center",
      padding: "0 24px",
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 120, fontWeight: 900,
        background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        lineHeight: 1,
      }}>404</div>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, color: "#F5F5F0", margin: 0 }}>
        Page introuvable
      </h1>
      <p style={{ color: "#8A8A9A", fontSize: 15, maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
        Cette page n'existe pas ou a été déplacée.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
            color: "#0A0A0F", border: "none", borderRadius: 12,
            padding: "12px 28px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
          Accueil
        </button>
        <button
          onClick={() => navigate("/explore")}
          style={{
            background: "transparent", border: "1px solid rgba(212,175,55,0.3)",
            color: "#D4AF37", borderRadius: 12, padding: "12px 28px",
            fontSize: 15, cursor: "pointer", fontFamily: "inherit",
          }}>
          Explorer
        </button>
      </div>
    </div>
  );
}
