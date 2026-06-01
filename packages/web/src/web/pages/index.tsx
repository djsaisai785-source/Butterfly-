import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import ListingCard from "../components/ListingCard";

const COLORS = {
  bg: "#070711",
  bg2: "#0d0b1e",
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.12)",
  text: "#F5F0E8",
  muted: "#7A748F",
  border: "#1A1830",
  surface: "#10101C",
};

const CAT_LIST = [
  { id: "nightlife", label: "Nightlife", emoji: "🌙", desc: "Clubs, DJ, table VIP" },
  { id: "restauration", label: "Gastronomie", emoji: "🍽️", desc: "Chefs privés, traiteurs" },
  { id: "transport", label: "Transport", emoji: "🚗", desc: "VTC premium, chauffeurs" },
  { id: "emploi", label: "Emploi", emoji: "💼", desc: "Barman, hôtesse, staff" },
  { id: "dating", label: "Dating", emoji: "❤️", desc: "Rencontres authentiques" },
  { id: "entertainment", label: "Entertainment", emoji: "🎭", desc: "Artistes, animateurs" },
];

const FEATURES = [
  { icon: "✦", title: "Annonces vérifiées", desc: "Chaque profil est contrôlé. Pas de fake, pas de déçu." },
  { icon: "🔒", title: "Paiement sécurisé", desc: "Stripe intégré. Réservez en toute confiance." },
  { icon: "💬", title: "Chat instantané", desc: "Discutez directement avec les prestataires." },
  { icon: "👑", title: "Accès VIP", desc: "Plans Pro & VIP pour les professionnels de la nuit." },
];

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => (await api.listings.$get()).json(),
  });

  // Auto seed on first load
  useQuery({
    queryKey: ["seed"],
    queryFn: async () => {
      const res = await fetch("/api/seed", { method: "POST" });
      return res.json();
    },
    staleTime: Infinity,
    retry: false,
  });

  const allListings = (data as any)?.listings ?? [];
  const featured = allListings.filter((l: any) => l.listing?.featured).slice(0, 6);
  const recent = allListings.filter((l: any) => !l.listing?.featured).slice(0, 8);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", padding: "60px 24px 80px",
        textAlign: "center",
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(212,175,55,0.05) 0%, transparent 50%),
          linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bg2} 100%)
        `,
      }}>
        <div style={{ position: "absolute", top: "15%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(212,175,55,0.04)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "rgba(212,175,55,0.03)", filter: "blur(120px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
            background: COLORS.goldDim, border: `1px solid ${COLORS.gold}33`,
            borderRadius: 20, padding: "6px 16px",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.gold }} />
            <span style={{ fontSize: 12, color: COLORS.gold, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
              La marketplace de la nuit
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900,
            lineHeight: 1.08, margin: "0 0 24px",
            background: `linear-gradient(135deg, ${COLORS.text} 40%, ${COLORS.gold} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: -2,
          }}>
            Tout ce dont vous avez besoin,<br />à n'importe quelle heure.
          </h1>

          <p style={{ fontSize: 18, color: COLORS.muted, lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
            DJs, chefs privés, chauffeurs VTC, tables VIP — BUTTERFLY connecte les professionnels de la nuit avec ceux qui en ont besoin.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/explore" style={{
              background: COLORS.gold, color: COLORS.bg,
              borderRadius: 14, padding: "15px 36px",
              fontSize: 16, fontWeight: 800, textDecoration: "none",
              boxShadow: `0 0 40px ${COLORS.gold}40`,
            }}>
              Explorer les annonces
            </Link>
            <Link href="/sign-up" style={{
              background: "transparent", color: COLORS.text,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14, padding: "15px 36px",
              fontSize: 16, fontWeight: 600, textDecoration: "none",
              backdropFilter: "blur(10px)",
            }}>
              Créer un compte →
            </Link>
          </div>

          <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 60 }}>
            {[
              { val: "500+", label: "Prestataires" },
              { val: "8", label: "Catégories" },
              { val: "24/7", label: "Disponible" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.gold }}>{s.val}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: "80px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: COLORS.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Ce que vous trouverez</p>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.text, margin: 0 }}>Toutes les catégories</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
          {CAT_LIST.map((cat) => (
            <Link key={cat.id} href={`/explore`} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 10, padding: "28px 16px",
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 18, textDecoration: "none", textAlign: "center",
            }}>
              <span style={{ fontSize: 36 }}>{cat.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{cat.label}</span>
              <span style={{ fontSize: 12, color: COLORS.muted }}>{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED ── */}
      {featured.length > 0 && (
        <section style={{ padding: "0 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, color: COLORS.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Sélection</p>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: COLORS.text, margin: 0 }}>À la une ✦</h2>
            </div>
            <Link href="/explore" style={{ color: COLORS.gold, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Tout voir →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {featured.map((item: any) => (
              <ListingCard key={item.listing.id} listing={item.listing} user={item.user} />
            ))}
          </div>
        </section>
      )}

      {/* ── RECENT ── */}
      {recent.length > 0 && (
        <section style={{ padding: "0 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, color: COLORS.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Récent</p>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: COLORS.text, margin: 0 }}>Nouvelles annonces</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {recent.map((item: any) => (
              <ListingCard key={item.listing.id} listing={item.listing} user={item.user} />
            ))}
          </div>
        </section>
      )}

      {/* ── WHY ── */}
      <section style={{
        padding: "80px 32px",
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, color: COLORS.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Pourquoi BUTTERFLY</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: COLORS.text, margin: 0 }}>Conçu pour les professionnels</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                padding: 28, borderRadius: 18,
                background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "100px 32px", textAlign: "center",
        background: `radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%), ${COLORS.bg}`,
      }}>
        <h2 style={{ fontSize: 44, fontWeight: 900, color: COLORS.text, margin: "0 0 16px", letterSpacing: -1 }}>
          Rejoindre BUTTERFLY
        </h2>
        <p style={{ fontSize: 18, color: COLORS.muted, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
          Créez votre compte gratuitement et accédez à l'écosystème de la nuit.
        </p>
        <Link href="/sign-up" style={{
          display: "inline-block",
          background: COLORS.gold, color: COLORS.bg,
          borderRadius: 14, padding: "16px 48px",
          fontSize: 17, fontWeight: 800, textDecoration: "none",
          boxShadow: `0 0 50px ${COLORS.gold}40`,
        }}>
          Créer un compte — c'est gratuit
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "32px", textAlign: "center",
        borderTop: `1px solid ${COLORS.border}`,
        color: COLORS.muted, fontSize: 13,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontWeight: 700, color: COLORS.gold, letterSpacing: 3, fontSize: 15 }}>BUTTERFLY</span>
          <span>© 2025 BUTTERFLY · La marketplace de la nuit</span>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ color: COLORS.muted, textDecoration: "none" }}>CGU</a>
            <a href="#" style={{ color: COLORS.muted, textDecoration: "none" }}>Confidentialité</a>
            <a href="#" style={{ color: COLORS.muted, textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
