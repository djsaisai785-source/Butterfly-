import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import ListingCard from "../components/ListingCard";

const C = {
  bg: "#070711",
  bg2: "#0d0b1e",
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.12)",
  text: "#F5F5F0",
  muted: "#7A748F",
  border: "#1A1830",
  surface: "#10101C",
  kido: "#4FC3F7",   // bleu ciel KIDO
  kidoDim: "rgba(79,195,247,0.12)",
  kidoBorder: "rgba(79,195,247,0.25)",
};

const KIDO_CATS = [
  { id: "rando", label: "Rando & Nature", emoji: "🏕️", desc: "Balades guidées, plein air" },
  { id: "atelier", label: "Ateliers Créatifs", emoji: "🎨", desc: "Poterie, peinture, mains" },
  { id: "nounou", label: "Nounou & Garde", emoji: "👶", desc: "Garde à domicile, baby-sitting" },
  { id: "baignade", label: "Baignade & Natation", emoji: "🏊", desc: "Piscine, plage, bébé-nageurs" },
  { id: "spectacle", label: "Spectacles", emoji: "🎭", desc: "Marionnettes, théâtre, magie" },
  { id: "weekend", label: "Weekends & Séjours", emoji: "🏡", desc: "Gîtes, rivière, escapades" },
];

export default function FamillePage() {
  const { data } = useQuery({
    queryKey: ["listings", "famille"],
    queryFn: async () => (await api.listings.$get({ query: { category: "famille" } })).json(),
  });

  const listings = (data as any)?.listings ?? [];
  const featured = listings.filter((l: any) => l.listing?.featured).slice(0, 4);
  const recent = listings.filter((l: any) => !l.listing?.featured).slice(0, 8);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "system-ui, sans-serif", paddingTop: 64 }}>

      {/* ── HERO ── */}
      <section style={{
        padding: "80px 32px 60px",
        textAlign: "center",
        background: `
          radial-gradient(ellipse at 30% 30%, rgba(79,195,247,0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 70%, rgba(212,175,55,0.04) 0%, transparent 50%),
          ${C.bg}
        `,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
          background: C.kidoDim, border: `1px solid ${C.kidoBorder}`,
          borderRadius: 20, padding: "6px 16px",
        }}>
          <span style={{ fontSize: 16 }}>👨‍👩‍👧‍👦</span>
          <span style={{ fontSize: 12, color: C.kido, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            AURA Famille
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900,
          margin: "0 0 16px",
          background: `linear-gradient(135deg, ${C.text} 40%, ${C.kido} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: -1.5,
        }}>
          Et on va où aujourd'hui ?
        </h1>

        <p style={{ fontSize: 18, color: C.muted, maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Activités, nounous, sorties en famille — tout ce dont vous avez besoin pour des moments inoubliables avec vos enfants.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/explore?category=famille" style={{
            background: C.kido, color: "#070711",
            borderRadius: 12, padding: "12px 32px",
            fontSize: 15, fontWeight: 800, textDecoration: "none",
            boxShadow: `0 0 30px rgba(79,195,247,0.3)`,
          }}>
            Voir toutes les annonces
          </Link>
          <Link href="/post" style={{
            background: "transparent", color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "12px 32px",
            fontSize: 15, fontWeight: 600, textDecoration: "none",
          }}>
            Poster une annonce
          </Link>
        </div>

        <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 48 }}>
          {[
            { val: "200+", label: "Activités" },
            { val: "50+", label: "Nounous" },
            { val: "France", label: "Partout" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.kido }}>{s.val}</div>
              <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATÉGORIES ── */}
      <section style={{ padding: "64px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: C.kido, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Explorer par thème</p>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: C.text, margin: 0 }}>Toutes les activités</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
          {KIDO_CATS.map((cat) => (
            <Link key={cat.id} href="/explore?category=famille" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 8, padding: "24px 14px",
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, textDecoration: "none", textAlign: "center",
              transition: "border-color 0.2s",
            }}>
              <span style={{ fontSize: 32 }}>{cat.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{cat.label}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── À LA UNE ── */}
      {featured.length > 0 && (
        <section style={{ padding: "0 32px 64px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 12, color: C.kido, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Sélection</p>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>À la une ✦</h2>
            </div>
            <Link href="/explore?category=famille" style={{ color: C.kido, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Tout voir →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {featured.map((item: any) => (
              <ListingCard key={item.listing.id} listing={item.listing} user={item.user} />
            ))}
          </div>
        </section>
      )}

      {/* ── RÉCENT ── */}
      {recent.length > 0 && (
        <section style={{ padding: "0 32px 80px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, color: C.kido, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Récent</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>Nouvelles annonces</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {recent.map((item: any) => (
              <ListingCard key={item.listing.id} listing={item.listing} user={item.user} />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{
        padding: "80px 32px", textAlign: "center",
        background: `radial-gradient(ellipse at 50% 50%, rgba(79,195,247,0.06) 0%, transparent 60%), ${C.bg}`,
        borderTop: `1px solid ${C.border}`,
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: C.text, margin: "0 0 14px" }}>
          Vous proposez des activités enfants ?
        </h2>
        <p style={{ fontSize: 16, color: C.muted, marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
          Postez votre annonce sur AURA et touchez des milliers de familles près de chez vous.
        </p>
        <Link href="/post" style={{
          display: "inline-block",
          background: C.kido, color: "#070711",
          borderRadius: 12, padding: "14px 40px",
          fontSize: 16, fontWeight: 800, textDecoration: "none",
          boxShadow: `0 0 40px rgba(79,195,247,0.3)`,
        }}>
          Poster une annonce
        </Link>
      </section>

    </div>
  );
}
