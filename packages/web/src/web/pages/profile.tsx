import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Star, Edit, PlusCircle, Shield, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import ListingCard from "../components/ListingCard";
import { authClient, clearToken } from "../lib/auth";
import { useCustomer, useListPlans } from "autumn-js/react";

const C = {
  bg: "var(--bg-primary)",
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.12)",
  text: "#F5F5F0",
  muted: "#8A8A9A",
  border: "rgba(42,42,58,0.8)",
  surface: "rgba(26,26,38,0.8)",
};

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const { data: customer, attach } = useCustomer();
  const { data: plans } = useListPlans();
  const qc = useQueryClient();

  const listings = useQuery({
    queryKey: ["listings"],
    queryFn: async () => fetch("/api/listings").then(r => r.json()),
  });

  const myListings = (listings.data?.listings || []).filter(
    (row: any) => row.listing.userId === session?.user?.id
  );

  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";

  async function handleSignOut() {
    await authClient.signOut();
    clearToken();
    navigate("/");
  }

  if (!session) return null;

  const user = session.user;
  const initial = user.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", background: C.bg }}>
      {/* Banner */}
      <div style={{
        height: 180,
        background: "linear-gradient(135deg, #0a0718, #160a2a, #0A0A0F)",
        position: "relative",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
      }}>
        <div style={{ position: "absolute", bottom: -50, left: 40 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "linear-gradient(135deg, #D4AF37, #B76E79)",
            border: "4px solid #0A0A0F",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, fontWeight: 700, color: "#0A0A0F",
          }}>{initial}</div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            position: "absolute", top: 16, right: 24,
            background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)",
            color: "#E74C3C", borderRadius: 10, padding: "8px 16px",
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
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: C.text, margin: 0 }}>
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
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: C.gold }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* My listings */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: C.text, margin: 0 }}>
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
                  <p style={{ color: C.muted, marginBottom: 20 }}>Vous n'avez pas encore d'annonces</p>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {myListings.map((item: any) => (
                    <ListingCard key={item.listing.id} listing={item.listing} user={item.user} />
                  ))}
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
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.text, margin: "0 0 20px" }}>
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
                        background: isActive ? "rgba(212,175,55,0.12)" : "rgba(26,26,38,0.5)",
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
    </div>
  );
}
