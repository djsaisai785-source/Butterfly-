import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Star, Shield, MessageCircle, ArrowLeft, Clock } from "lucide-react";
import { getCategoryColor, getCategoryLabel, getCategoryIcon } from "../lib/categories";
import { authClient, getToken } from "../lib/auth";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { useCustomer } from "autumn-js/react";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const { data: customer } = useCustomer();
  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";
  const canBook = activePlan === "pro" || activePlan === "vip";

  const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bookingError, setBookingError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${id}`);
      return res.json();
    },
  });

  async function handleBook() {
    if (!session) { navigate("/sign-in"); return; }
    if (!canBook) { navigate("/profile"); return; }

    setBookingStatus("loading");
    setBookingError("");

    const token = getToken();
    const res = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ listingId: id, amount: data?.listing?.price || 0 }),
    });

    if (!res.ok) {
      const body = await res.json();
      setBookingError(body.error ?? "Erreur lors de la réservation");
      setBookingStatus("error");
      return;
    }

    const { clientSecret } = await res.json();

    if (stripePromise && clientSecret) {
      const stripe = await stripePromise;
      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: { token: "tok_visa" } as any, // test card
        },
      });

      if (result?.error) {
        setBookingError(result.error.message ?? "Paiement échoué");
        setBookingStatus("error");
      } else {
        // Create reservation record
        await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            listingId: id,
            buyerId: session.user.id,
            sellerId: data?.user?.id,
            price: data?.listing?.price || 0,
            status: "confirmed",
          }),
        });
        qc.invalidateQueries({ queryKey: ["reservations"] });
        setBookingStatus("success");
      }
    } else {
      // No Stripe key — just create the reservation
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          listingId: id,
          buyerId: session.user.id,
          sellerId: data?.user?.id,
          price: data?.listing?.price || 0,
          status: "pending",
        }),
      });
      qc.invalidateQueries({ queryKey: ["reservations"] });
      setBookingStatus("success");
    }
  }

  async function handleContact() {
    if (!session) { navigate("/sign-in"); return; }
    // Create/find conversation and navigate
    const token = getToken();
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        participant1Id: session.user.id,
        participant2Id: data?.user?.id,
        listingId: id,
      }),
    });
    const { conversation } = await res.json();
    navigate(`/messages?convoId=${conversation?.id}`);
  }

  if (isLoading) return (
    <div style={{ paddingTop: 80, display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", background: "var(--bg-primary)" }}>
      <div style={{ color: "#D4AF37", fontSize: 32 }}>🦋</div>
    </div>
  );

  if (!data?.listing) return (
    <div style={{ paddingTop: 80, textAlign: "center", padding: "120px 24px", background: "var(--bg-primary)", color: "#8A8A9A" }}>
      Annonce introuvable.
    </div>
  );

  const { listing, user } = data;
  const color = getCategoryColor(listing.category);
  const tags = listing.tags ? JSON.parse(listing.tags) : [];

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Back */}
        <button onClick={() => navigate("/explore")} style={{
          display: "flex", alignItems: "center", gap: 8, background: "transparent",
          border: "none", color: "#8A8A9A", cursor: "pointer", fontSize: 14,
          fontFamily: "'Poppins', sans-serif", marginBottom: 32,
        }}>
          <ArrowLeft size={16} /> Retour aux annonces
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>

          {/* Left */}
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{
                background: listing.type === "offer" ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)",
                color: listing.type === "offer" ? "#2ECC71" : "#E74C3C",
                border: `1px solid ${listing.type === "offer" ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`,
                padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              }}>{listing.type === "offer" ? "OFFRE" : "DEMANDE"}</span>
              <span style={{
                background: `${color}20`, color, border: `1px solid ${color}40`,
                padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              }}>{getCategoryIcon(listing.category)} {getCategoryLabel(listing.category)}</span>
              {listing.featured && (
                <span style={{
                  background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
                  color: "#0A0A0F", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                }}>★ FEATURED</span>
              )}
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "#F5F5F0", lineHeight: 1.2, marginBottom: 16 }}>
              {listing.title}
            </h1>

            {listing.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8A8A9A", fontSize: 14, marginBottom: 24 }}>
                <MapPin size={14} /> {listing.location}
              </div>
            )}

            <div style={{
              background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
              borderRadius: 16, padding: 28, marginBottom: 24,
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#F5F5F0", marginBottom: 12 }}>Description</h3>
              <p style={{ color: "#C0C0C8", lineHeight: 1.8, fontSize: 15 }}>{listing.description}</p>
            </div>

            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {tags.map((tag: string) => (
                  <span key={tag} style={{
                    background: "rgba(42,42,58,0.8)", color: "#8A8A9A",
                    border: "1px solid rgba(42,42,58,0.8)",
                    padding: "6px 14px", borderRadius: 20, fontSize: 13,
                  }}>#{tag}</span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 24, color: "#8A8A9A", fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={14} /> Posté récemment
              </span>
              <span>👁 {listing.viewCount || 0} vues</span>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Price + booking */}
            <div style={{
              background: "rgba(26,26,38,0.9)", border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 20, padding: 28,
            }}>
              <div style={{ marginBottom: 20 }}>
                {listing.price ? (
                  <>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: "#D4AF37" }}>
                      {listing.price}€
                    </span>
                    <span style={{ color: "#8A8A9A", fontSize: 15 }}> / {listing.priceUnit}</span>
                  </>
                ) : (
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#D4AF37" }}>Sur devis</span>
                )}
              </div>

              {/* Booking status */}
              {bookingStatus === "success" ? (
                <div style={{
                  background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.3)",
                  borderRadius: 12, padding: "16px", textAlign: "center", marginBottom: 12,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                  <div style={{ color: "#2ECC71", fontWeight: 600, fontSize: 14 }}>Réservation confirmée !</div>
                  <button onClick={() => navigate("/reservations")} style={{
                    background: "transparent", border: "none", color: "#2ECC71",
                    fontSize: 13, cursor: "pointer", marginTop: 8, textDecoration: "underline",
                    fontFamily: "inherit",
                  }}>Voir mes réservations</button>
                </div>
              ) : (
                <>
                  {!session ? (
                    <button onClick={() => navigate("/sign-in")} style={{
                      width: "100%", background: "#D4AF37", color: "#0A0A0F",
                      border: "none", borderRadius: 12, padding: "14px",
                      fontSize: 16, fontWeight: 800, cursor: "pointer",
                      marginBottom: 12, fontFamily: "inherit",
                    }}>
                      Connexion pour réserver
                    </button>
                  ) : !canBook ? (
                    <div>
                      <div style={{
                        background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)",
                        borderRadius: 12, padding: "12px 16px", marginBottom: 12, fontSize: 13, color: "#8A8A9A",
                      }}>
                        🔒 Plan Pro ou VIP requis pour réserver
                      </div>
                      <button onClick={() => navigate("/profile")} style={{
                        width: "100%", background: "#D4AF37", color: "#0A0A0F",
                        border: "none", borderRadius: 12, padding: "14px",
                        fontSize: 15, fontWeight: 800, cursor: "pointer",
                        marginBottom: 12, fontFamily: "inherit",
                      }}>
                        Passer au plan Pro →
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleBook}
                      disabled={bookingStatus === "loading"}
                      style={{
                        width: "100%",
                        background: bookingStatus === "loading" ? "rgba(212,175,55,0.5)" : "#D4AF37",
                        color: "#0A0A0F", border: "none", borderRadius: 12, padding: "14px",
                        fontSize: 16, fontWeight: 800, cursor: bookingStatus === "loading" ? "not-allowed" : "pointer",
                        marginBottom: 12, fontFamily: "inherit",
                        boxShadow: "0 0 30px rgba(212,175,55,0.3)",
                      }}
                    >
                      {bookingStatus === "loading" ? "Réservation..." : "Réserver maintenant"}
                    </button>
                  )}

                  {bookingStatus === "error" && (
                    <div style={{
                      background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)",
                      borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#E74C3C", marginBottom: 10,
                    }}>
                      {bookingError}
                    </div>
                  )}

                  <button
                    onClick={handleContact}
                    style={{
                      width: "100%", background: "transparent",
                      border: "1px solid rgba(212,175,55,0.3)",
                      color: "#D4AF37", borderRadius: 12, padding: "12px",
                      fontSize: 15, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                    <MessageCircle size={16} /> Contacter
                  </button>
                </>
              )}

              <p style={{ fontSize: 12, color: "#8A8A9A", textAlign: "center", marginTop: 12 }}>
                Paiement sécurisé via Stripe
              </p>
            </div>

            {/* User card */}
            {user && (
              <div style={{
                background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                borderRadius: 20, padding: 24,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4AF37, #B76E79)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 700, color: "#0A0A0F", flexShrink: 0,
                  }}>{user.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#F5F5F0", display: "flex", alignItems: "center", gap: 6 }}>
                      {user.name}
                      {user.verified && <span style={{ color: "#D4AF37", fontSize: 14 }}>✓</span>}
                    </div>
                    {user.rating > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#D4AF37", fontSize: 13 }}>
                        <Star size={12} fill="#D4AF37" /> {user.rating} ({user.reviewCount} avis)
                      </div>
                    )}
                  </div>
                </div>
                {user.bio && <p style={{ color: "#8A8A9A", fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{user.bio}</p>}
                {user.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8A8A9A", fontSize: 13 }}>
                    <MapPin size={12} /> {user.location}
                  </div>
                )}
              </div>
            )}

            {/* Trust */}
            <div style={{
              background: "rgba(26,26,38,0.5)", border: "1px solid rgba(42,42,58,0.6)",
              borderRadius: 16, padding: 20,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {[
                { icon: <Shield size={14} color="#2ECC71" />, text: "Paiement sécurisé via Stripe" },
                { icon: <Star size={14} color="#D4AF37" />, text: "Profils vérifiés & notés" },
                { icon: <MessageCircle size={14} color="#4A90D9" />, text: "Chat direct intégré" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#8A8A9A" }}>
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
