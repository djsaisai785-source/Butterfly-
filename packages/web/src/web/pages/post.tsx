import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORIES } from "../lib/categories";
import { PlusCircle } from "lucide-react";
import { authClient, getToken } from "../lib/auth";
import { useCustomer } from "autumn-js/react";

export default function PostPage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const { data: customer, attach } = useCustomer();
  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";
  const canPost = activePlan === "pro" || activePlan === "vip";

  const [form, setForm] = useState({
    type: "offer",
    category: "",
    title: "",
    description: "",
    price: "",
    priceUnit: "soiree",
    location: "",
    tags: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const tagsArr = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          userId: session?.user?.id,
          price: form.price ? parseFloat(form.price) : null,
          tags: JSON.stringify(tagsArr),
          status: "active",
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      navigate("/profile");
    },
  });

  // Paywall if not pro/vip
  if (!canPost) {
    return (
      <div style={{ paddingTop: 64, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🔒</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#F5F5F0", marginBottom: 12 }}>
            Poster une annonce
          </h1>
          <p style={{ color: "#8A8A9A", fontSize: 15, marginBottom: 40, lineHeight: 1.7 }}>
            La publication est réservée aux membres <strong style={{ color: "#D4AF37" }}>Pro</strong> et <strong style={{ color: "#D4AF37" }}>VIP</strong>.
            Passez au niveau supérieur pour commencer.
          </p>

          <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
            {[
              { id: "pro", name: "Pro — 19€/mois", desc: "Annonces illimitées + badge vérifié + messagerie", color: "#D4AF37" },
              { id: "vip", name: "VIP — 49€/mois", desc: "Pro + annonces featured + accès prioritaire", color: "#FFBF00" },
            ].map(plan => (
              <button key={plan.id} onClick={() => attach({ planId: plan.id, successUrl: window.location.origin + "/post" })} style={{
                background: `${plan.color}12`, border: `1px solid ${plan.color}40`,
                borderRadius: 16, padding: "20px 24px", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontFamily: "inherit",
              }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: plan.color }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: "#8A8A9A", marginTop: 4 }}>{plan.desc}</div>
                </div>
                <span style={{ color: plan.color, fontSize: 20 }}>→</span>
              </button>
            ))}
          </div>

          <p style={{ color: "#8A8A9A", fontSize: 12, marginTop: 20 }}>
            Annulation possible à tout moment depuis votre profil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: "var(--bg-primary)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "#F5F5F0", marginBottom: 8 }}>
          Nouvelle annonce
        </h1>
        <p style={{ color: "#8A8A9A", marginBottom: 40 }}>Offre ou demande — visible par toute la communauté BUTTERFLY.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Type */}
          <div>
            <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 10 }}>Type d'annonce</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { id: "offer", label: "Je propose (Offre)", color: "#2ECC71" },
                { id: "demand", label: "Je cherche (Demande)", color: "#E74C3C" },
              ].map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))} style={{
                  flex: 1, padding: "14px", borderRadius: 12, cursor: "pointer",
                  background: form.type === t.id ? `${t.color}20` : "rgba(26,26,38,0.8)",
                  border: `1px solid ${form.type === t.id ? t.color + "60" : "rgba(42,42,58,0.8)"}`,
                  color: form.type === t.id ? t.color : "#8A8A9A",
                  fontFamily: "inherit", fontWeight: 600, fontSize: 14,
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 10 }}>Catégorie *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))} style={{
                  padding: "8px 16px", borderRadius: 50, cursor: "pointer",
                  background: form.category === cat.id ? `${cat.color}20` : "rgba(26,26,38,0.8)",
                  border: `1px solid ${form.category === cat.id ? cat.color + "60" : "rgba(42,42,58,0.8)"}`,
                  color: form.category === cat.id ? cat.color : "#8A8A9A",
                  fontFamily: "inherit", fontSize: 13,
                }}>{cat.icon} {cat.label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 8 }}>Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: DJ disponible pour soirée privée vendredi..."
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
                background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                color: "#F5F5F0", fontSize: 15, fontFamily: "inherit", outline: "none",
              }} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 8 }}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez votre offre ou votre besoin en détail..."
              rows={5}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
                background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                color: "#F5F5F0", fontSize: 14, fontFamily: "inherit",
                outline: "none", resize: "vertical",
              }} />
          </div>

          {/* Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 8 }}>Prix (€)</label>
              <input
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                type="number" placeholder="0 = sur devis"
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
                  background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                  color: "#F5F5F0", fontSize: 15, fontFamily: "inherit", outline: "none",
                }} />
            </div>
            <div>
              <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 8 }}>Par</label>
              <select
                value={form.priceUnit}
                onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value }))}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
                  background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                  color: "#F5F5F0", fontSize: 14, fontFamily: "inherit", outline: "none",
                }}>
                {["heure", "soiree", "nuit", "jour", "semaine", "mois", "personne", "devis"].map(u => (
                  <option key={u} value={u} style={{ background: "#1A1A26" }}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 8 }}>Localisation</label>
            <input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Paris, Lyon, Nice..."
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
                background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                color: "#F5F5F0", fontSize: 15, fontFamily: "inherit", outline: "none",
              }} />
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: 14, color: "#8A8A9A", display: "block", marginBottom: 8 }}>Tags</label>
            <input
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="DJ, soirée, Paris, luxe..."
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, boxSizing: "border-box",
                background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                color: "#F5F5F0", fontSize: 15, fontFamily: "inherit", outline: "none",
              }} />
          </div>

          {/* Submit */}
          <button
            onClick={() => create.mutate()}
            disabled={create.isPending || !form.title || !form.description || !form.category}
            style={{
              width: "100%", background: "#D4AF37", color: "#0A0A0F",
              border: "none", borderRadius: 12, padding: "16px",
              fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              opacity: (!form.title || !form.description || !form.category) ? 0.5 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 0 30px rgba(212,175,55,0.3)",
            }}>
            {create.isPending ? "Publication..." : <><PlusCircle size={18} /> Publier l'annonce</>}
          </button>
        </div>
      </div>
    </div>
  );
}
