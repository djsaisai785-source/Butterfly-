import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useLocation } from "../lib/LocationContext";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
};

const UNIVERSES = [
  {
    id: "butterfly",
    name: "Butterfly",
    emoji: "🦋",
    tagline: "Nightlife • Clubs • Soirées",
    color: "#1A0A2E",
    accent: "#9B59B6",
    restricted: true,
  },
  {
    id: "kido",
    name: "Kido",
    emoji: "🎈",
    tagline: "Famille • Sorties • Activités",
    color: "#0A1A2E",
    accent: "#4FC3F7",
    restricted: false,
  },
  {
    id: "soon1",
    name: "Bientôt",
    emoji: "✨",
    tagline: "Prochainement...",
    color: "#13131A",
    accent: "#D4AF37",
    restricted: false,
    comingSoon: true,
  },
  {
    id: "soon2",
    name: "Bientôt",
    emoji: "🔮",
    tagline: "Prochainement...",
    color: "#13131A",
    accent: "#D4AF37",
    restricted: false,
    comingSoon: true,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showAgeModal, setShowAgeModal] = useState(false);
  const location = useLocation();

  const handleUniversePress = (universe: typeof UNIVERSES[0]) => {
    if (universe.comingSoon) return;
    if (universe.restricted) {
      setShowAgeModal(true);
    } else {
      router.push(`/universe/${universe.id}`);
    }
  };

  const confirmAge = () => {
    setShowAgeModal(false);
    router.push("/universe/butterfly");
  };

  const cityLabel = location.loading
    ? null
    : location.city
    ? `📍 ${location.city}${location.region ? `, ${location.region}` : ""}`
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>AURA</Text>
            <Text style={styles.tagline}>Ton monde. 24h/24.</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.profileInitial}>A</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goldLine} />

        {/* Location banner */}
        {(location.loading || cityLabel) && (
          <View style={styles.locationBanner}>
            {location.loading ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <Text style={styles.locationText}>{cityLabel}</Text>
            )}
            {!location.loading && cityLabel && (
              <Text style={styles.locationSub}>Annonces près de vous</Text>
            )}
          </View>
        )}

        {/* Section title */}
        <Text style={styles.sectionTitle}>Nos univers</Text>
        <Text style={styles.sectionSub}>Choisissez votre monde</Text>

        {/* Universe grid */}
        <View style={styles.grid}>
          {UNIVERSES.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={[
                styles.card,
                { backgroundColor: u.color, borderColor: u.accent + "44" },
                u.comingSoon && styles.cardDimmed,
              ]}
              onPress={() => handleUniversePress(u)}
              activeOpacity={u.comingSoon ? 1 : 0.8}
            >
              {u.restricted && (
                <View style={styles.ageBadge}>
                  <Text style={styles.ageBadgeText}>+18</Text>
                </View>
              )}
              {u.comingSoon && (
                <View style={[styles.ageBadge, { backgroundColor: "#D4AF3733", borderColor: "#D4AF37" }]}>
                  <Text style={[styles.ageBadgeText, { color: COLORS.gold }]}>Soon</Text>
                </View>
              )}
              <Text style={styles.cardEmoji}>{u.emoji}</Text>
              <Text style={[styles.cardName, { color: u.comingSoon ? COLORS.muted : COLORS.text }]}>
                {u.name}
              </Text>
              <Text style={styles.cardTagline}>{u.tagline}</Text>
              {!u.comingSoon && (
                <View style={[styles.enterBtn, { backgroundColor: u.accent + "22", borderColor: u.accent + "66" }]}>
                  <Text style={[styles.enterBtnText, { color: u.accent }]}>Entrer →</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Accueil</Text>
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

      {/* +18 Modal */}
      <Modal visible={showAgeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>🦋</Text>
            <Text style={styles.modalTitle}>Butterfly</Text>
            <Text style={styles.modalSub}>Nightlife • Clubs • Soirées</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalWarning}>⚠️ Contenu réservé aux adultes</Text>
            <Text style={styles.modalText}>
              Cet univers contient du contenu réservé aux personnes majeures (+18 ans).
            </Text>
            <Text style={styles.modalQuestion}>Confirmez-vous avoir 18 ans ou plus ?</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmAge}>
              <Text style={styles.confirmBtnText}>✓ Oui, j'ai 18 ans ou plus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAgeModal(false)}>
              <Text style={styles.cancelBtnText}>Non, retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  appName: { fontSize: 28, fontWeight: "900", color: COLORS.gold, letterSpacing: 4 },
  tagline: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: { color: COLORS.gold, fontWeight: "700", fontSize: 16 },
  goldLine: { height: 1, backgroundColor: COLORS.gold, marginHorizontal: 20, opacity: 0.3 },

  locationBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "#D4AF3711",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D4AF3733",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationText: { fontSize: 14, color: COLORS.gold, fontWeight: "700" },
  locationSub: { fontSize: 11, color: COLORS.muted },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginTop: 24,
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.muted,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: (width - 36) / 2,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 8,
    position: "relative",
  },
  cardDimmed: { opacity: 0.5 },
  ageBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FF4444",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ageBadgeText: { fontSize: 10, color: "#fff", fontWeight: "800" },
  cardEmoji: { fontSize: 40, marginBottom: 4 },
  cardName: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  cardTagline: { fontSize: 11, color: COLORS.muted, lineHeight: 16 },
  enterBtn: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  enterBtnText: { fontSize: 12, fontWeight: "700" },
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
  navIconActive: { fontSize: 20 },
  navLabel: { fontSize: 10, color: COLORS.muted },
  navLabelActive: { color: COLORS.gold, fontWeight: "700" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000CC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    backgroundColor: "#13131A",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    borderWidth: 1,
    borderColor: "#9B59B644",
    alignItems: "center",
  },
  modalEmoji: { fontSize: 48, marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: "900", color: COLORS.text, letterSpacing: 2 },
  modalSub: { fontSize: 12, color: COLORS.muted, marginBottom: 16 },
  modalDivider: { height: 1, backgroundColor: COLORS.border, width: "100%", marginBottom: 16 },
  modalWarning: { fontSize: 14, fontWeight: "700", color: "#FF4444", marginBottom: 8 },
  modalText: { fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 20, marginBottom: 12 },
  modalQuestion: { fontSize: 14, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: 20 },
  confirmBtn: {
    backgroundColor: "#9B59B622",
    borderWidth: 1,
    borderColor: "#9B59B6",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  confirmBtnText: { color: "#9B59B6", fontWeight: "700", fontSize: 14 },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: { color: COLORS.muted, fontSize: 13 },
});
