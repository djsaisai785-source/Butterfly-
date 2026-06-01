import { Link, useLocation } from "wouter";
import { Search, PlusCircle, MessageCircle, User, LogOut, LogIn } from "lucide-react";
import { authClient, clearToken } from "../lib/auth";
import { useState } from "react";

const C = {
  gold: "#D4AF37",
  kido: "#4FC3F7",
  muted: "#8A8A9A",
  bg: "rgba(10,10,15,0.95)",
  border: "rgba(212,175,55,0.15)",
  surface: "#10101C",
};

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  async function handleSignOut() {
    await authClient.signOut();
    clearToken();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: C.bg, backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${C.border}`,
      padding: "0 24px", height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <img src="/logo.png" alt="AURA" style={{ width: 36, height: 36, objectFit: "contain" }} onError={e => (e.currentTarget.style.display = "none")} />
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "20px", fontWeight: 700,
          background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>AURA</span>
      </Link>

      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 480, margin: "0 40px",
        background: "rgba(26,26,38,0.8)", border: "1px solid rgba(212,175,55,0.2)",
        borderRadius: 50, padding: "8px 20px",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <Search size={16} color={C.muted} />
        <input
          placeholder="Chercher DJ, nounou, chauffeur, table VIP..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "#F5F5F0", fontSize: "14px", width: "100%",
            fontFamily: "'Poppins', sans-serif",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate(searchVal.trim() ? `/explore?q=${encodeURIComponent(searchVal.trim())}` : "/explore");
              setSearchVal("");
            }
          }}
        />
      </div>

      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Link to="/explore">
          <button style={{
            background: location === "/explore" ? "rgba(212,175,55,0.1)" : "transparent",
            border: location === "/explore" ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
            color: location === "/explore" ? C.gold : C.muted,
            padding: "8px 16px", borderRadius: 8, cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontSize: "14px",
          }}>Explorer</button>
        </Link>

        {/* Famille KIDO */}
        <Link to="/famille">
          <button style={{
            background: location === "/famille" ? "rgba(79,195,247,0.1)" : "transparent",
            border: location === "/famille" ? "1px solid rgba(79,195,247,0.3)" : "1px solid transparent",
            color: location === "/famille" ? C.kido : C.muted,
            padding: "8px 16px", borderRadius: 8, cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontSize: "14px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>👨‍👩‍👧</span> Famille
          </button>
        </Link>

        {session && (
          <>
            <Link to="/post">
              <button style={{
                background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
                color: "#0A0A0F", border: "none",
                padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Poppins', sans-serif", fontSize: "14px", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <PlusCircle size={16} /> Poster
              </button>
            </Link>

            <Link to="/messages">
              <button style={{
                background: location === "/messages" ? "rgba(212,175,55,0.1)" : "transparent",
                border: "1px solid transparent",
                color: location === "/messages" ? C.gold : C.muted,
                padding: "8px", borderRadius: 8, cursor: "pointer",
              }}>
                <MessageCircle size={20} />
              </button>
            </Link>
          </>
        )}

        {/* User menu */}
        <div style={{ position: "relative" }}>
          {session ? (
            <>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)",
                  borderRadius: 50, padding: "6px 14px 6px 8px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #D4AF37, #B76E79)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#0A0A0F",
                }}>
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span style={{ color: C.gold, fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user.name?.split(" ")[0]}
                </span>
              </button>

              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: C.surface, border: "1px solid rgba(212,175,55,0.15)",
                  borderRadius: 14, padding: "8px", minWidth: 180,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  zIndex: 200,
                }}>
                  <div style={{ padding: "10px 14px 14px", borderBottom: "1px solid rgba(42,42,58,0.8)", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, color: "#F5F5F0", fontWeight: 600 }}>{session.user.name}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{session.user.email}</div>
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>
                    <button style={{
                      width: "100%", textAlign: "left", padding: "10px 14px",
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "#F5F5F0", fontSize: 14, borderRadius: 8,
                      display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "inherit",
                    }}>
                      <User size={15} color={C.muted} /> Mon profil
                    </button>
                  </Link>
                  <Link to="/reservations" onClick={() => setMenuOpen(false)}>
                    <button style={{
                      width: "100%", textAlign: "left", padding: "10px 14px",
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "#F5F5F0", fontSize: 14, borderRadius: 8,
                      display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "inherit",
                    }}>
                      📅 Mes réservations
                    </button>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 14px",
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "#E74C3C", fontSize: 14, borderRadius: 8, marginTop: 4,
                      display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "inherit", borderTop: "1px solid rgba(42,42,58,0.8)",
                    }}>
                    <LogOut size={15} /> Se déconnecter
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/sign-in">
              <button style={{
                background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)",
                color: C.gold, padding: "8px 20px", borderRadius: 20,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
              }}>
                <LogIn size={16} /> Connexion
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
