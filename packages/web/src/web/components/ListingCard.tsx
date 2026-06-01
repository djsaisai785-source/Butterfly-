import { Link } from "wouter";
import { MapPin, Star, Clock } from "lucide-react";
import { getCategoryColor, getCategoryLabel, getCategoryIcon } from "../lib/categories";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  priceUnit: string | null;
  category: string;
  type: string;
  location: string | null;
  tags: string | null;
  featured: boolean | null;
  createdAt: number | null;
}

interface User {
  id: string;
  name: string;
  avatar: string | null;
  verified: boolean | null;
  rating: number | null;
}

interface Props {
  listing: Listing;
  user: User | null;
}

export default function ListingCard({ listing, user }: Props) {
  const color = getCategoryColor(listing.category);
  const tags = listing.tags ? JSON.parse(listing.tags) : [];

  return (
    <Link to={`/listing/${listing.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "rgba(26,26,38,0.8)", backdropFilter: "blur(12px)",
        border: `1px solid ${listing.featured ? "rgba(212,175,55,0.4)" : "rgba(42,42,58,0.8)"}`,
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        transition: "all 0.2s", position: "relative",
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(212,175,55,0.15)`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
      >
        {/* Featured badge */}
        {listing.featured && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
            color: "#0A0A0F", padding: "2px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, zIndex: 1,
          }}>★ FEATURED</div>
        )}

        {/* Header */}
        <div style={{ padding: "20px 20px 0" }}>
          {/* Type badge */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <span style={{
              background: listing.type === "offer" ? "rgba(46,204,113,0.15)" : "rgba(212,81,55,0.15)",
              color: listing.type === "offer" ? "#2ECC71" : "#E74C3C",
              border: `1px solid ${listing.type === "offer" ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`,
              padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            }}>{listing.type === "offer" ? "OFFRE" : "DEMANDE"}</span>
            <span style={{
              background: `${color}20`, color, border: `1px solid ${color}40`,
              padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
            }}>{getCategoryIcon(listing.category)} {getCategoryLabel(listing.category)}</span>
          </div>

          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600,
            color: "#F5F5F0", marginBottom: 8, lineHeight: 1.3,
          }}>{listing.title}</h3>

          <p style={{ color: "#8A8A9A", fontSize: 13, lineHeight: 1.5, marginBottom: 12,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{listing.description}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {tags.slice(0, 3).map((tag: string) => (
                <span key={tag} style={{
                  background: "rgba(42,42,58,0.8)", color: "#8A8A9A",
                  padding: "2px 8px", borderRadius: 20, fontSize: 11,
                }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px 16px",
          borderTop: "1px solid rgba(42,42,58,0.6)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37, #B76E79)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 600, color: "#0A0A0F",
            }}>{user?.name?.[0] || "?"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#F5F5F0", display: "flex", alignItems: "center", gap: 4 }}>
                {user?.name || "Anonyme"}
                {user?.verified && <span style={{ color: "#D4AF37", fontSize: 12 }}>✓</span>}
              </div>
              {user?.rating && (
                <div style={{ fontSize: 11, color: "#D4AF37", display: "flex", alignItems: "center", gap: 2 }}>
                  <Star size={10} fill="#D4AF37" /> {user.rating}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div style={{ textAlign: "right" }}>
            {listing.price ? (
              <>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#D4AF37" }}>
                  {listing.price}€
                </div>
                <div style={{ fontSize: 11, color: "#8A8A9A" }}>/ {listing.priceUnit}</div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#8A8A9A", fontStyle: "italic" }}>Sur devis</div>
            )}
          </div>
        </div>

        {/* Location */}
        {listing.location && (
          <div style={{
            padding: "0 20px 16px",
            display: "flex", alignItems: "center", gap: 4,
            color: "#8A8A9A", fontSize: 12,
          }}>
            <MapPin size={12} />
            {listing.location}
          </div>
        )}
      </div>
    </Link>
  );
}
