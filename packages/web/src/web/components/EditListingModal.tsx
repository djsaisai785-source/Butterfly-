import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { getToken } from "../lib/auth";
import { CATEGORIES } from "../lib/categories";

const C = {
  gold: "#D4AF37",
  goldDim: "rgba(212,175,55,0.12)",
  text: "#F5F5F0",
  muted: "#8A8A9A",
  border: "rgba(42,42,58,0.8)",
  surface: "rgba(26,26,38,0.8)",
};

interface ListingData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  priceUnit: string | null;
  category: string;
  type: string;
  location: string;
}

interface Props {
  listing: ListingData;
  onClose: () => void;
}

export default function EditListingModal({ listing, onClose }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: listing.title ?? "",
    description: listing.description ?? "",
    price: listing.price?.toString() ?? "",
    priceUnit: listing.priceUnit ?? "",
    category: listing.category ?? "",
    type: listing.type ?? "offer",
    location: listing.location ?? "",
  });

  const update = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: form.price ? parseFloat(form.price) : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Erreur lors de la mise à jour");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      onClose();
    },
  });

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
    };
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(42,42,58,0.5)",
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: C.text,
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    color: C.muted,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "rgba(14,14,22,0.98)", border: "1px solid rgba(212,175,55,0.25)",
        borderRadius: 20, padding: 32, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", color: C.text, margin: 0, fontSize: 20 }}>
            Modifier l'annonce
          </h3>
          <button onClick={onClose} style={{
            background: "rgba(42,42,58,0.5)", border: `1px solid ${C.border}`,
            color: C.muted, borderRadius: 8, width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Error */}
        {update.error && (
          <div style={{
            background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)",
            borderRadius: 10, padding: "10px 14px", color: "#E74C3C", fontSize: 13, marginBottom: 20,
          }}>
            {(update.error as Error).message}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Type */}
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["offer", "demand"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                  flex: 1, padding: "10px 16px", borderRadius: 10,
                  background: form.type === t
                    ? (t === "offer" ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)")
                    : "rgba(42,42,58,0.4)",
                  border: `1px solid ${form.type === t
                    ? (t === "offer" ? "rgba(46,204,113,0.4)" : "rgba(231,76,60,0.4)")
                    : C.border}`,
                  color: form.type === t ? (t === "offer" ? "#2ECC71" : "#E74C3C") : C.muted,
                  cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                }}>
                  {t === "offer" ? "✅ Offre" : "🔎 Demande"}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Titre</label>
            <input {...field("title")} style={inputStyle} placeholder="Titre de l'annonce" />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select {...field("category")} style={inputStyle}>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              {...field("description")}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
              placeholder="Décrivez votre annonce..."
            />
          </div>

          {/* Price + Unit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Prix (€)</label>
              <input {...field("price")} type="number" min="0" step="0.01" style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Unité</label>
              <input {...field("priceUnit")} style={inputStyle} placeholder="heure, soirée, mois..." />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Localisation</label>
            <input {...field("location")} style={inputStyle} placeholder="Ville, région..." />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button onClick={onClose} style={{
            flex: 1, background: "rgba(42,42,58,0.4)", border: `1px solid ${C.border}`,
            color: C.muted, borderRadius: 12, padding: "13px", fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Annuler
          </button>
          <button
            onClick={() => update.mutate()}
            disabled={update.isPending || !form.title.trim()}
            style={{
              flex: 2, background: update.isPending || !form.title.trim() ? "rgba(212,175,55,0.4)" : C.gold,
              color: "#0A0A0F", border: "none", borderRadius: 12, padding: "13px",
              fontSize: 14, fontWeight: 700, cursor: update.isPending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {update.isPending ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
