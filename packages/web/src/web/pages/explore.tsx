import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CATEGORIES } from "../lib/categories";
import ListingCard from "../components/ListingCard";
import { SlidersHorizontal } from "lucide-react";

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const listings = useQuery({
    queryKey: ["listings"],
    queryFn: async () => (await api.listings.$get()).json(),
  });

  const allListings = (listings.data?.listings || []) as any[];
  const filtered = allListings.filter((row: any) => {
    if (selectedCategory && row.listing.category !== selectedCategory) return false;
    if (selectedType && row.listing.type !== selectedType) return false;
    return true;
  });

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: "#F5F5F0", marginBottom: 8 }}>
            Explorer les annonces
          </h1>
          <p style={{ color: "#8A8A9A" }}>
            {filtered.length} annonce{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 32 }}>
          {/* Type filter */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { id: null, label: "Tout" },
              { id: "offer", label: "Offres" },
              { id: "demand", label: "Demandes" },
            ].map(t => (
              <button key={String(t.id)} onClick={() => setSelectedType(t.id)}
                style={{
                  background: selectedType === t.id ? "linear-gradient(135deg, #D4AF37, #FFBF00)" : "rgba(26,26,38,0.8)",
                  border: selectedType === t.id ? "none" : "1px solid rgba(42,42,58,0.8)",
                  color: selectedType === t.id ? "#0A0A0F" : "#F5F5F0",
                  padding: "8px 20px", borderRadius: 50, cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: selectedType === t.id ? 600 : 400,
                }}>{t.label}</button>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setSelectedCategory(null)} style={{
              background: !selectedCategory ? "rgba(212,175,55,0.15)" : "rgba(26,26,38,0.8)",
              border: !selectedCategory ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(42,42,58,0.8)",
              color: !selectedCategory ? "#D4AF37" : "#8A8A9A",
              padding: "6px 16px", borderRadius: 50, cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", fontSize: 13,
            }}>Toutes</button>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} style={{
                background: selectedCategory === cat.id ? `${cat.color}20` : "rgba(26,26,38,0.8)",
                border: selectedCategory === cat.id ? `1px solid ${cat.color}60` : "1px solid rgba(42,42,58,0.8)",
                color: selectedCategory === cat.id ? cat.color : "#8A8A9A",
                padding: "6px 16px", borderRadius: 50, cursor: "pointer",
                fontFamily: "'Poppins', sans-serif", fontSize: 13,
              }}>{cat.icon} {cat.label}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {listings.isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{ height: 300, background: "rgba(26,26,38,0.5)", borderRadius: 16 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#8A8A9A" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18 }}>Aucune annonce trouvée</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filtered.map((row: any) => (
              <ListingCard key={row.listing.id} listing={row.listing} user={row.user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
