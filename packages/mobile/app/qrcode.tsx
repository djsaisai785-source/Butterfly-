import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSession } from "../lib/auth";
import QRCode from "react-native-qrcode-svg";
import { useState } from "react";

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
};

const APP_URL = "https://butterfly.app";

export default function QRCodeScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const profileUrl = userId ? `${APP_URL}/user/${userId}` : APP_URL;
  const [activeTab, setActiveTab] = useState<"profile" | "app">("profile");

  const qrUrl = activeTab === "profile" ? profileUrl : APP_URL;

  const handleShare = async () => {
    try {
      await Share.share({
        message: activeTab === "profile"
          ? `Retrouve mon profil sur Butterfly : ${qrUrl}`
          : `Rejoins-moi sur Butterfly ! ${qrUrl}`,
        url: qrUrl,
      });
    } catch {
      Alert.alert("Erreur", "Impossible de partager.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mon QR Code</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareBtn}>Partager</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "profile" && styles.tabActive]}
            onPress={() => setActiveTab("profile")}
          >
            <Text style={[styles.tabText, activeTab === "profile" && styles.tabTextActive]}>
              👤 Mon profil
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "app" && styles.tabActive]}
            onPress={() => setActiveTab("app")}
          >
            <Text style={[styles.tabText, activeTab === "app" && styles.tabTextActive]}>
              🦋 L'app
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Card */}
        <View style={styles.card}>
          <Text style={styles.cardBadge}>
            {activeTab === "profile" ? "🦋 BUTTERFLY — Mon profil" : "🦋 BUTTERFLY — Application"}
          </Text>

          <View style={styles.qrWrap}>
            <QRCode
              value={qrUrl}
              size={220}
              backgroundColor="#0A0A0F"
              color="#D4AF37"
              ecl="H"
            />
          </View>

          <Text style={styles.qrLabel}>
            {activeTab === "profile"
              ? "Scanne pour voir mon profil Butterfly"
              : "Scanne pour rejoindre Butterfly"}
          </Text>

          <View style={styles.urlBox}>
            <Text style={styles.urlText} numberOfLines={2}>{qrUrl}</Text>
          </View>

          <TouchableOpacity style={styles.shareFullBtn} onPress={handleShare}>
            <Text style={styles.shareFullBtnText}>📤 Partager mon QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Comment utiliser votre QR Code ?</Text>
          {[
            { icon: "📇", text: "Ajoutez-le à votre carte de visite pour partager votre profil" },
            { icon: "📱", text: "Faites-le scanner en soirée pour que les clients vous contactent" },
            { icon: "🌐", text: "Partagez sur vos réseaux pour booster votre visibilité" },
            { icon: "🦋", text: "QR App pour inviter vos contacts à rejoindre Butterfly" },
          ].map((item, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/explore")}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Explorer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navPostBtn} onPress={() => router.push("/post")}>
          <Text style={styles.navPostText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/messages")}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profile")}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  back: { fontSize: 22, color: COLORS.gold },
  title: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  shareBtn: { fontSize: 14, color: COLORS.gold, fontWeight: "600" },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.gold + "44",
  },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.muted },
  tabTextActive: { color: COLORS.gold },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
  },
  cardBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  qrWrap: {
    padding: 20,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.gold + "33",
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  qrLabel: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },
  urlBox: {
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%",
  },
  urlText: {
    fontSize: 11,
    color: COLORS.muted,
  },
  shareFullBtn: {
    width: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  shareFullBtnText: {
    color: COLORS.bg,
    fontWeight: "700",
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 14,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: { fontSize: 20 },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 24,
    paddingTop: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: { alignItems: "center", gap: 2, flex: 1 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: COLORS.muted },
  navPostBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  navPostText: { fontSize: 26, color: COLORS.bg, fontWeight: "300", lineHeight: 30 },
});
