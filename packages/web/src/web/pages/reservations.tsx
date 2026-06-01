import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, XCircle, Clock, Star, X } from "lucide-react";
import { authClient } from "../lib/auth";
import { getToken } from "../lib/auth";
import { useToast } from "../components/Toast";
import { useState } from "react";

const API = import.meta.env.VITE_SERVER_URL || "";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "En attente",  color: "#FFBF00", bg: "rgba(255,191,0,0.1)" },
  confirmed: { label: "Confirmée",   color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
  cancelled: { label: "Annulée",     color: "#E74C3C", bg: "rgba(231,76,60,0.1)" },
  completed: { label: "Terminée",    color: "#8A8A9A", bg: "rgba(138,138,154,0.1)" },
};

export default function ReservationsPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [reviewModal, setReviewModal] = useState<{ reservationId: string; reviewedId: string; listingId: string; title: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const reviewMutation = useMutation({
    mutationFn: async ({ reservationId, reviewedId, listingId }: { reservationId: string; reviewedId: string; listingId: string }) => {
      return apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          listingId,
          reviewerId: userId,
          reviewedId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
    },
    onSuccess: () => {
      success("Avis publié !");
      setReviewModal(null);
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["reservations", userId] });
    },
    onError: () => error("Erreur lors de la publication de l'avis."),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reservations", userId],
    enabled: !!userId,
    queryFn: () => apiFetch(`/api/reservations?userId=${userId}`),
  });

  const reservations: any[] = data?.reservations || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/reservations/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_data: any, vars: { id: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: ["reservations", userId] });
      if (vars.status === "confirmed") success("Réservation confirmée !");
      else if (vars.status === "cancelled") success("Réservation annulée.");
      else success("Statut mis à jour.");
    },
    onError: () => error("Erreur lors de la mise à jour."),
  });

  const counts = {
    pending:   reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    completed: reservations.filter(r => r.status === "completed").length,
  };

  if (!userId) {
    return (
      <div style={{ paddingTop: 64, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <p style={{ color: "#8A8A9A" }}>Connectez-vous pour voir vos réservations.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, color: "#F5F5F0", marginBottom: 8 }}>
          Mes réservations
        </h1>
        <p style={{ color: "#8A8A9A", marginBottom: 40 }}>Suivez toutes vos réservations en cours et passées.</p>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            { label: "En attente", count: counts.pending,   color: "#FFBF00", icon: <Clock size={20} /> },
            { label: "Confirmées", count: counts.confirmed, color: "#2ECC71", icon: <CheckCircle size={20} /> },
            { label: "Terminées",  count: counts.completed, color: "#8A8A9A", icon: <Calendar size={20} /> },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(26,26,38,0.8)", border: `1px solid ${s.color}25`,
              borderRadius: 16, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 13, color: "#8A8A9A" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        {isLoading && <p style={{ color: "#8A8A9A" }}>Chargement...</p>}

        {!isLoading && reservations.length === 0 && (
          <div style={{
            background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
            borderRadius: 16, padding: "48px 24px", textAlign: "center",
          }}>
            <Calendar size={40} color="#8A8A9A" style={{ marginBottom: 16 }} />
            <p style={{ color: "#8A8A9A" }}>Aucune réservation pour le moment.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reservations.map((r: any) => {
            const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const isSeller = r.sellerId === userId;
            const title = r.listing?.title || "Annonce";
            const otherName = isSeller
              ? (r.buyer?.name || r.buyer?.email || "Acheteur")
              : (r.seller?.name || r.seller?.email || "Vendeur");
            const price = r.price ?? r.listing?.price ?? 0;

            return (
              <div key={r.id} style={{
                background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                borderRadius: 16, padding: "24px 28px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: "#F5F5F0" }}>
                      {title}
                    </h3>
                    <span style={{
                      background: st.bg, color: st.color,
                      border: `1px solid ${st.color}40`,
                      padding: "2px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>{st.label}</span>
                    {isSeller && (
                      <span style={{
                        background: "rgba(74,144,217,0.1)", color: "#4A90D9",
                        border: "1px solid rgba(74,144,217,0.3)",
                        padding: "2px 10px", borderRadius: 20, fontSize: 11,
                      }}>Vendeur</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: "#8A8A9A", display: "flex", gap: 20, flexWrap: "wrap" }}>
                    {r.date && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={13} /> {r.date}
                      </span>
                    )}
                    <span>avec {otherName}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: "#D4AF37" }}>
                      {Number(price).toLocaleString("fr")}€
                    </div>
                    <div style={{ fontSize: 11, color: "#8A8A9A" }}>5% commission incluse</div>
                  </div>

                  {r.status === "pending" && isSeller && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => updateMutation.mutate({ id: r.id, status: "confirmed" })}
                        disabled={updateMutation.isPending}
                        style={{
                          background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.3)",
                          color: "#2ECC71", padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                          fontSize: 13, fontFamily: "inherit",
                        }}>Confirmer</button>
                      <button
                        onClick={() => updateMutation.mutate({ id: r.id, status: "cancelled" })}
                        disabled={updateMutation.isPending}
                        style={{
                          background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)",
                          color: "#E74C3C", padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                          fontSize: 13, fontFamily: "inherit",
                        }}>Refuser</button>
                    </div>
                  )}

                  {r.status === "pending" && !isSeller && (
                    <button
                      onClick={() => updateMutation.mutate({ id: r.id, status: "cancelled" })}
                      disabled={updateMutation.isPending}
                      style={{
                        background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)",
                        color: "#E74C3C", padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                        fontSize: 13, fontFamily: "inherit",
                      }}>Annuler</button>
                  )}

                  {r.status === "completed" && (
                    <button
                      onClick={() => setReviewModal({
                        reservationId: r.id,
                        reviewedId: isSeller ? (r.buyer?.id || r.buyerId) : (r.seller?.id || r.sellerId),
                        listingId: r.listingId,
                        title: title,
                      })}
                      style={{
                        background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)",
                        color: "#D4AF37", padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                        fontSize: 13, fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                      <Star size={14} /> Laisser un avis
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review modal */}
      {reviewModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={() => setReviewModal(null)}>
          <div style={{
            background: "#10101C", border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: 20, padding: 32, maxWidth: 480, width: "100%",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: "#F5F5F0", margin: 0 }}>
                Laisser un avis
              </h2>
              <button onClick={() => setReviewModal(null)} style={{
                background: "transparent", border: "none", cursor: "pointer", color: "#8A8A9A",
              }}><X size={20} /></button>
            </div>

            <p style={{ color: "#8A8A9A", fontSize: 14, marginBottom: 20 }}>
              {reviewModal.title}
            </p>

            {/* Stars */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#8A8A9A", display: "block", marginBottom: 10 }}>Note</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewRating(n)} style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    fontSize: 28, padding: 0,
                    filter: n <= reviewRating ? "none" : "grayscale(1) opacity(0.4)",
                    transform: n <= reviewRating ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.15s",
                  }}>★</button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: "#8A8A9A", display: "block", marginBottom: 8 }}>Commentaire (optionnel)</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                rows={4}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                  borderRadius: 12, padding: "12px 16px",
                  color: "#F5F5F0", fontSize: 14, fontFamily: "inherit",
                  outline: "none", resize: "vertical",
                }} />
            </div>

            <button
              onClick={() => reviewMutation.mutate(reviewModal)}
              disabled={reviewMutation.isPending}
              style={{
                width: "100%", background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
                color: "#0A0A0F", border: "none", borderRadius: 12, padding: "14px",
                fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                opacity: reviewMutation.isPending ? 0.6 : 1,
              }}>
              {reviewMutation.isPending ? "Publication..." : "Publier l'avis"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
