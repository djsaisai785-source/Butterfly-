import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { authClient } from "../lib/auth";

const APP_URL = "https://butterfly.app";

export default function QRCodePage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;

  const profileUrl = userId ? `${APP_URL}/user/${userId}` : APP_URL;
  const [activeTab, setActiveTab] = useState<"profile" | "app">("profile");
  const [copied, setCopied] = useState(false);

  const qrUrl = activeTab === "profile" ? profileUrl : APP_URL;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.querySelector("#qr-svg svg") as SVGSVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `butterfly-qr-${activeTab}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <a href="/" style={styles.back}>← Retour</a>
        <h1 style={styles.title}>Mon QR Code</h1>
        <div />
      </div>

      <div style={styles.container}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === "profile" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("profile")}
          >
            👤 Mon profil
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "app" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("app")}
          >
            🦋 L'app
          </button>
        </div>

        {/* QR Card */}
        <div style={styles.card}>
          <div style={styles.cardBadge}>
            {activeTab === "profile" ? "🦋 BUTTERFLY — Mon profil" : "🦋 BUTTERFLY — Application"}
          </div>

          {/* QR code with butterfly branding */}
          <div id="qr-svg" style={styles.qrWrap}>
            <div style={styles.qrInner}>
              <QRCodeSVG
                value={qrUrl}
                size={220}
                bgColor="#0A0A0F"
                fgColor="#D4AF37"
                level="H"
                imageSettings={{
                  src: "/butterfly-icon.svg",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
          </div>

          <p style={styles.qrLabel}>
            {activeTab === "profile"
              ? "Scanne pour voir mon profil Butterfly"
              : "Scanne pour rejoindre Butterfly"}
          </p>

          {/* URL display */}
          <div style={styles.urlBox}>
            <span style={styles.urlText}>{qrUrl}</span>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.copyBtn} onClick={handleCopy}>
              {copied ? "✓ Copié !" : "📋 Copier le lien"}
            </button>
            <button style={styles.downloadBtn} onClick={handleDownload}>
              ⬇ Télécharger
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Comment utiliser votre QR Code ?</h3>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📇</span>
            <span style={styles.infoText}>Ajoutez-le à votre carte de visite pour partager votre profil</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📱</span>
            <span style={styles.infoText}>Faites-le scanner en soirée pour que les clients vous contactent</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🌐</span>
            <span style={styles.infoText}>Partagez sur vos réseaux sociaux pour booster votre visibilité</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🦋</span>
            <span style={styles.infoText}>QR App pour inviter vos contacts à rejoindre Butterfly</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#1E1E2E",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  text: "#F5F0E8",
  muted: "#6B6880",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  back: {
    color: COLORS.gold,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
  title: {
    fontSize: "20px",
    fontWeight: 800,
    color: COLORS.text,
    margin: 0,
  },
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  tabs: {
    display: "flex",
    backgroundColor: COLORS.surface,
    borderRadius: "12px",
    padding: "4px",
    border: `1px solid ${COLORS.border}`,
    gap: "4px",
  },
  tab: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "transparent",
    color: COLORS.muted,
    transition: "all 0.2s",
  },
  tabActive: {
    backgroundColor: COLORS.goldDim,
    color: COLORS.gold,
    border: `1px solid ${COLORS.gold}44`,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: "20px",
    border: `1px solid ${COLORS.border}`,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  cardBadge: {
    fontSize: "13px",
    fontWeight: 700,
    color: COLORS.gold,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  qrWrap: {
    padding: "20px",
    backgroundColor: COLORS.bg,
    borderRadius: "16px",
    border: `2px solid ${COLORS.gold}33`,
    boxShadow: `0 0 40px ${COLORS.gold}22`,
  },
  qrInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qrLabel: {
    fontSize: "14px",
    color: COLORS.muted,
    margin: 0,
    textAlign: "center" as const,
  },
  urlBox: {
    backgroundColor: COLORS.bg,
    borderRadius: "10px",
    padding: "10px 16px",
    border: `1px solid ${COLORS.border}`,
    width: "100%",
    boxSizing: "border-box" as const,
    overflow: "hidden",
  },
  urlText: {
    fontSize: "12px",
    color: COLORS.muted,
    wordBreak: "break-all" as const,
  },
  actions: {
    display: "flex",
    gap: "12px",
    width: "100%",
  },
  copyBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: COLORS.goldDim,
    border: `1px solid ${COLORS.gold}66`,
    borderRadius: "12px",
    color: COLORS.gold,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  downloadBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: COLORS.gold,
    border: "none",
    borderRadius: "12px",
    color: COLORS.bg,
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: "16px",
    border: `1px solid ${COLORS.border}`,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  infoTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  infoIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  infoText: {
    fontSize: "13px",
    color: COLORS.muted,
    lineHeight: "1.5",
  },
};
