import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { MapPin, Star, Edit, PlusCircle, Shield, LogOut, Trash2, Camera } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useRef } from "react";
import { authClient, clearToken, getToken } from "../lib/auth";
import { useCustomer, useListPlans } from "autumn-js/react";
import EditListingModal from "../components/EditListingModal";

const C = {
  bg: "var(--bg-primary)",
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.12)",
  text: "#F5F5F0",
  muted: "#8A8A9A",
  border: "rgba(42,42,58,0.8)",
  surface: "rgba(26,26,38,0.8)",
  danger: "#E74C3C",
  dangerDim: "rgba(231,76,60,0.12)",
};

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const { data: customer, attach } = useCustomer();
  const { data: plans } = useListPlans();
  const qc = useQueryClient();

  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listings = useQuery({
    queryKey: ["listings"],
    queryFn: async () => fetch("/api/listings").then(r => r.json()),
  });

  const userQuery = useQuery({
    queryKey: ["user-me", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/users/${session!.user.id}`);
      return res.json();
    },
  });

  const myListings = (listings.data?.listings || []).filter(
    (row: any) => row.listing.userId === session?.user?.id
  );

  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      const token = getToken();
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur suppression");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      setDeletingId(null);
    },
  });

  async function handleSignOut() {
    await authClient.signOut();
    clearToken();
    navigate("/");
  }

  async function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setAvatarUploading(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error("Upload échoué");
      const { url } = await uploadRes.json();

      // Update user avatar
      await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: url }),
      });
      qc.invalidateQueries({ queryKey: ["user-me", session.user.id] });
    } catch (err) {
      console.error(err);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!session) return null;

  const user = session.user;
  const initial = user.name?.[0]?.toUpperCase() ?? "U";
  const avatarUrl = userQuery.data?.user?.avatar;

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", background: C.bg }}>
      {/* Banner */}
      <div style={{
        height: 180,
        background: "linear-gradient(135deg, #0a0718, #160a2a, #0A0A0F)",
        position: "relative",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
      }}>
        {/* Avatar with upload */}
        <div style={{ position: "absolute", bottom: -50, left: 40 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={handleAvatarClick}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name}
                style={{ width: 100, height: 100, borderRadius: "50%", border: "4px solid #0A0A0F", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "linear-gradient(135deg, #D4AF37, #B76E79)",
                border: "4px solid #0A0A0F",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, fontWeight: 700, color: "#0A0A0F",
              }}>{initial}</div>
            )}
            {/* Overlay */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: avatarUploading ? 1 : 0,
              transition: "opacity 0.2s",
            }}
              onMouseEnter={e => !avatarUploading && (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => !avatarUploading && (e.currentTarget.style.opacity = "0")}
            >
              {avatarUploading
                ? <div style={{ width: 20, height: 20, border: "2px solid #D4AF37", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                : <Camera size={22} color="#D4AF37" />
              }
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        <button
          onClick={handleSignOut}
          style={{
            position: "absolute", top: 16, right: 24,
            background: C.dangerDim, border: "1px solid rgba(231,76,60,0.3)",
            color: C.danger, borderRadius: 10, padding: "8px 16px",
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8,
          }}>
          <LogOut size={14} /> Déconnexion
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }}>

          {/* Left */}
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, color: C.text, margin: 0 }}>
                  {user.name}
                </h1>
                <span style={{
                  background: C.goldDim, border: "1px solid rgba(212,175,55,0.3)",
                  color: C.gold, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                }}>{activePlan}</span>
              </div>
              <div style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>{user.email}</div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 20, marginBottom: 40, flexWrap: "wrap" }}>
              {[
                { label: "Annonces", value: myListings.length },
                { label: "Plan", value: activePlan.toUpperCase() },
              ].map(s => (
                <div key={s.label} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "16px 24px", textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, color: C.gold }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* My listings */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: C.text, margin: 0 }}>
                  Mes annonces
                </h2>
                <Link to="/post">
                  <button style={{
                    background: C.goldDim, border: "1px solid rgba(212,175,55,0.3)",
                    color: C.gold, borderRadius: 10, padding: "8px 16px",
                    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <PlusCircle size={14} /> Nouvelle annonce
                  </button>
                </Link>
              </div>

              {myListings.length === 0 ? (
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: "48px 24px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ color: C.muted, marginBottom: 20 }}>Aucune annonce pour l'instant</p>
                  <Link to="/post">
                    <button style={{
                      background: C.gold, color: "#0A0A0F", border: "none",
                      borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      Poster ma première annonce
                    </button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {myListings.map((item: any) => {
                    const l = item.listing;
                    const isDeleting = deletingId === l.id;
                    return (
                      <div key={l.id} style={{
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 16, padding: "18px 20px",
                        display: "flex", alignItems: "center", gap: 16,
                        justifyContent: "space-between",
                        transition: "border-color 0.2s",
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/listing/${l.id}`} style={{ textDecoration: "none" }}>
                            <div style={{
                              fontFamily: "'Syne', sans-serif", fontSize: 15, color: C.text,
                              marginBottom: 4, cursor: "pointer",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                              onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
                              onMouseLeave={e => (e.currentTarget.style.color = C.text)}
                            >
                              {l.title}
                            </div>
                          </Link>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20,
                              background: l.type === "offer" ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)",
                              color: l.type === "offer" ? "#2ECC71" : "#E74C3C",
                              border: `1px solid ${l.type === "offer" ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`,
                            }}>{l.type === "offer" ? "OFFRE" : "DEMANDE"}</span>
                            {l.price && (
                              <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>
                                {l.price}€{l.priceUnit ? ` / ${l.priceUnit}` : ""}
                              </span>
                            )}
                            <span style={{ color: C.muted, fontSize: 12 }}>👁 {l.viewCount || 0} vues</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => setEditingListing(l)}
                            style={{
                              background: C.goldDim, border: "1px solid rgba(212,175,55,0.25)",
                              color: C.gold, borderRadius: 8, width: 36, height: 36,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer",
                            }}
                            title="Modifier"
                          >
                            <Edit size={14} />
                          </button>

                          {isDeleting ? (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ fontSize: 12, color: C.muted }}>Supprimer ?</span>
                              <button onClick={() => deleteListing.mutate(l.id)} style={{
                                background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.4)",
                                color: C.danger, borderRadius: 8, padding: "6px 12px",
                                fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                              }}>Oui</button>
                              <button onClick={() => setDeletingId(null)} style={{
                                background: "rgba(42,42,58,0.5)", border: `1px solid ${C.border}`,
                                color: C.muted, borderRadius: 8, padding: "6px 12px",
                                fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                              }}>Non</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(l.id)}
                              style={{
                                background: C.dangerDim, border: "1px solid rgba(231,76,60,0.25)",
                                color: C.danger, borderRadius: 8, width: 36, height: 36,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                              }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — subscription */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: C.surface, border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 20, padding: 24,
            }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, color: C.text, margin: "0 0 20px" }}>
                Abonnement
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(plans ?? []).map((plan: any) => {
                  const isActive = plan.id === activePlan;
                  const price = plan.price ? `${(plan.price.amount / 100).toFixed(0)}€/mois` : "Gratuit";
                  return (
                    <button
                      key={plan.id}
                      disabled={isActive}
                      onClick={() => !isActive && attach({ planId: plan.id, successUrl: window.location.origin + "/profile" })}
                      style={{
                        padding: "14px 18px", borderRadius: 12,
                        background: isActive ? C.goldDim : "rgba(26,26,38,0.5)",
                        border: isActive ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(42,42,58,0.6)",
                        cursor: isActive ? "default" : "pointer",
                        textAlign: "left", fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isActive ? C.gold : C.text }}>
                          {plan.name} {isActive && "✓"}
                        </span>
                        <span style={{ fontSize: 13, color: isActive ? C.gold : C.muted }}>{price}</span>
                      </div>
                      {plan.items?.[0]?.display?.primaryText && (
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                          {plan.items[0].display.primaryText}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust badges */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: 20,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {[
                { icon: <Shield size={14} color="#2ECC71" />, text: "Compte sécurisé" },
                { icon: "✓", text: "Email vérifié" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.muted }}>
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit listing modal */}
      {editingListing && (
        <EditListingModal listing={editingListing} onClose={() => setEditingListing(null)} />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
