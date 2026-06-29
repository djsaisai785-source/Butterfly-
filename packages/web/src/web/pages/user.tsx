import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Star, ArrowLeft, MessageCircle, Shield } from "lucide-react";
import { authClient, getToken } from "../lib/auth";
import { getCategoryIcon, getCategoryLabel } from "../lib/categories";
import { useState } from "react";

const C = {
  bg: "var(--bg-primary)",
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.12)",
  text: "#F5F5F0",
  muted: "#8A8A9A",
  border: "rgba(42,42,58,0.8)",
  surface: "rgba(26,26,38,0.8)",
};

const AVATAR_COLORS = ["#D4AF37", "#7B68EE", "#AB47BC", "#4A90D9", "#E91E8C", "#26C6DA"];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const token = getToken();
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reviewedId: id,
          reviewerId: session?.user?.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile", id] });
      setShowReview(false);
      setReviewComment("");
      setReviewRating(5);
    },
  });

  async function handleContact() {
    if (!session) { navigate("/sign-in"); return; }
    const token = getToken();
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        participant1Id: session.user.id,
        participant2Id: id,
      }),
    });
    const { conversation } = await res.json();
    navigate(`/messages?convoId=${conversation?.id}`);
  }

  if (isLoading) return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: C.bg, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />)}
        </div>
      </div>
    </div>
  );

  if (!data?.user) return (
    <div style={{ paddingTop: 160, minHeight: "100vh", background: C.bg, textAlign: "center", color: C.muted }}>
      Profil introuvable.
    </div>
  );

  const { user, listings, reviews } = data;
  const aColor = avatarColor(user.name ?? "U");
  const initial = user.name?.[0]?.toUpperCase() ?? "U";
  const isOwnProfile = session?.user?.id === id;

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", background: C.bg }}>
      {/* Banner */}
      <div style={{
        height: 160,
        background: `linear-gradient(135deg, ${aColor}18, #0A0A0F)`,
        borderBottom: "1px solid rgba(212,175,55,0.08)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", bottom: -48, left: 40 }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name}
              style={{ width: 96, height: 96, borderRadius: "50%", border: "4px solid #0A0A0F", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: `linear-gradient(135deg, ${aColor}, ${aColor}99)`,
              border: "4px solid #0A0A0F",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 34, fontWeight: 700, color: "#0A0A0F",
            }}>{initial}</div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px 80px" }}>
        {/* Back */}
        <button onClick={() => navigate(-1 as any)} style={{
          display: "flex", alignItems: "center", gap: 8, background: "transparent",
          border: "none", color: C.muted, cursor: "pointer", fontSize: 14,
          fontFamily: "inherit", marginBottom: 32,
        }}>
          <ArrowLeft size={16} /> Retour
        </button>

        {/* Header info */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, color: C.text, margin: 0 }}>{user.name}</h1>
              {user.verified ? (
                <span style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", color: C.gold, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>VÉRIFIÉ ✓</span>
              ) : null}
              {user.type === "vip" && (
                <span style={{ background: "rgba(183,110,121,0.15)", border: "1px solid rgba(183,110,121,0.3)", color: "#B76E79", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>VIP</span>
              )}
            </div>
            {user.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: 14, marginBottom: 8 }}>
                <MapPin size={13} /> {user.location}
              </div>
            )}
            {user.rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.gold, fontSize: 14 }}>
                <Star size={14} fill={C.gold} /> {user.rating} <span style={{ color: C.muted }}>({user.reviewCount} avis)</span>
              </div>
            )}
          </div>

          {!isOwnProfile && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleContact} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: C.goldDim, border: "1px solid rgba(212,175,55,0.3)",
                color: C.gold, borderRadius: 12, padding: "10px 20px",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>
                <MessageCircle size={15} /> Contacter
              </button>
              {session && (
                <button onClick={() => setShowReview(true)} style={{
                  background: "rgba(42,42,58,0.6)", border: `1px solid ${C.border}`,
                  color: C.text, borderRadius: 12, padding: "10px 20px",
                  fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                }}>
                  ★ Laisser un avis
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "20px 24px", marginBottom: 32,
            color: "#C0C0C8", fontSize: 15, lineHeight: 1.7,
          }}>
            {user.bio}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          {[
            { label: "Annonces", value: listings?.length ?? 0 },
            { label: "Avis", value: user.reviewCount ?? 0 },
            { label: "Note", value: user.rating > 0 ? `${user.rating}/5` : "—" },
          ].map(s => (
            <div key={s.label} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "16px 28px", textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: C.gold }}>{s.value}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        {listings && listings.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.text, marginBottom: 20 }}>
              Annonces actives
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {listings.map(({ listing }: any) => (
                <a key={listing.id} href={`/listing/${listing.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 16, padding: 20, cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
                  >
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                        background: listing.type === "offer" ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)",
                        color: listing.type === "offer" ? "#2ECC71" : "#E74C3C",
                        border: `1px solid ${listing.type === "offer" ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`,
                      }}>{listing.type === "offer" ? "OFFRE" : "DEMANDE"}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>
                        {getCategoryIcon(listing.category)} {getCategoryLabel(listing.category)}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>
                      {listing.title}
                    </div>
                    {listing.price && (
                      <div style={{ color: C.gold, fontWeight: 700 }}>
                        {listing.price}€ <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}>/ {listing.priceUnit}</span>
                      </div>
                    )}
                    {!listing.price && <div style={{ color: C.muted, fontSize: 13 }}>Sur devis</div>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.text, marginBottom: 20 }}>
              Avis reçus
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.map(({ review, reviewer }: any) => (
                <div key={review.id} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "18px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${avatarColor(reviewer?.name ?? "U")}, ${avatarColor(reviewer?.name ?? "U")}88)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "#0A0A0F",
                    }}>{reviewer?.name?.[0]?.toUpperCase() ?? "?"}</div>
                    <div>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{reviewer?.name ?? "Anonyme"}</div>
                      <div style={{ color: C.gold, fontSize: 12 }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    </div>
                  </div>
                  {review.comment && <p style={{ color: "#C0C0C8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review modal */}
      {showReview && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
        }} onClick={e => e.target === e.currentTarget && setShowReview(false)}>
          <div style={{
            background: "rgba(16,16,26,0.98)", border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: 20, padding: 32, width: "100%", maxWidth: 440,
          }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", color: C.text, margin: "0 0 24px", fontSize: 20 }}>
              Laisser un avis pour {user.name}
            </h3>

            <div style={{ marginBottom: 20 }}>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>Note</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewRating(n)} style={{
                    background: n <= reviewRating ? C.goldDim : "rgba(42,42,58,0.5)",
                    border: n <= reviewRating ? "1px solid rgba(212,175,55,0.4)" : `1px solid ${C.border}`,
                    color: n <= reviewRating ? C.gold : C.muted,
                    borderRadius: 8, width: 44, height: 44, fontSize: 18, cursor: "pointer",
                  }}>★</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>Commentaire (optionnel)</div>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Votre expérience avec ce prestataire..."
                style={{
                  width: "100%", background: "rgba(42,42,58,0.5)",
                  border: `1px solid ${C.border}`, borderRadius: 10, padding: 14,
                  color: C.text, fontSize: 14, fontFamily: "inherit", resize: "vertical",
                  minHeight: 100, boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowReview(false)} style={{
                flex: 1, background: "rgba(42,42,58,0.4)", border: `1px solid ${C.border}`,
                color: C.muted, borderRadius: 10, padding: 14, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>Annuler</button>
              <button
                onClick={() => submitReview.mutate()}
                disabled={submitReview.isPending}
                style={{
                  flex: 2, background: C.gold, color: "#0A0A0F", border: "none",
                  borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {submitReview.isPending ? "Envoi..." : "Publier l'avis"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
