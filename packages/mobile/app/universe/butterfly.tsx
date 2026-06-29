import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useState } from "react";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
  purple: "#9B59B6",
  purpleDim: "#9B59B622",
};

const CATEGORIES = [
  { id: "all", label: "Tout", emoji: "✨" },
  { id: "nightlife", label: "Clubs", emoji: "🎉" },
  { id: "emploi", label: "Emploi", emoji: "💼" },
  { id: "transport", label: "VTC", emoji: "🚗" },
  { id: "dating", label: "Dating", emoji: "❤️" },
];

const CATEGORY_COLORS: Record<string, string> = {
  nightlife: "#1A1A3E",
  emploi: "#0D1E16",
  transport: "#0D1A2E",
  dating: "#2E0D1A",
  all: "#13131A",
};

export default function ButterflyScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["listings", activeCategory],
    queryFn: async () => {
      const res = await api.listings.$get();
      return res.json();
    },
  });

  const listings = (data as any)?.listings ?? [];
  const filtered =
    activeCategory === "all"
      ? listings
      : listings.filter((l: any) => l.listing?.category === activeCategory);

  const featured = filtered.filter((l: any) => l.listing?.featured);
  const recent = filtered.filter((l: any) => !l.listing?.featured);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← AURA</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.appName}>🦋 Butterfly</Text>
            <Text style={styles.tagline}>Nightlife • Clubs • Soirées</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.profileInitial}>A</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.purpleLine} />

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, activeCategory === cat.id && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator color={COLORS.purple} style={{ marginTop: 40 }} />
        ) : (
          <>
            {featured.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>À la une ✦</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredScroll}
                >
                  {featured.map((item: any) => {
                    const l = item.listing;
                    const u = item.user;
                    const bgColor = CATEGORY_COLORS[l.category] ?? COLORS.surface;
                    return (
                      <TouchableOpacity
                        key={l.id}
                        style={[styles.featuredCard, { backgroundColor: bgColor }]}
                        onPress={() => router.push(`/listing/${l.id}`)}
                      >
                        <View style={styles.featuredBadge}>
                          <Text style={styles.featuredBadgeText}>✦ À LA UNE</Text>
                        </View>
                        <Text style={styles.featuredEmoji}>
                          {CATEGORIES.find((c) => c.id === l.category)?.emoji ?? "✨"}
                        </Text>
                        <Text style={styles.featuredTitle} numberOfLines={2}>{l.title}</Text>
                        <Text style={styles.featuredLocation}>{l.location}</Text>
                        {l.price && (
                          <Text style={styles.featuredPrice}>{l.price}€ / {l.priceUnit}</Text>
                        )}
                        {u?.name && (
                          <View style={styles.featuredUser}>
                            <View style={styles.miniAvatar}>
                              <Text style={styles.miniAvatarText}>{u.name[0]}</Text>
                            </View>
                            <Text style={styles.featuredUserName}>{u.name}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <Text style={styles.sectionTitle}>Annonces</Text>
            {recent.length === 0 && (
              <Text style={styles.empty}>Aucune annonce pour le moment</Text>
            )}
            {recent.map((item: any) => {
              const l = item.listing;
              const u = item.user;
              const bgColor = CATEGORY_COLORS[l.category] ?? COLORS.surface;
              return (
                <TouchableOpacity
                  key={l.id}
                  style={styles.card}
                  onPress={() => router.push(`/listing/${l.id}`)}
                >
                  <View style={[styles.cardEmoji, { backgroundColor: bgColor }]}>
                    <Text style={{ fontSize: 28 }}>
                      {CATEGORIES.find((c) => c.id === l.category)?.emoji ?? "✨"}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardCategory}>
                        {CATEGORIES.find((c) => c.id === l.category)?.label ?? l.category}
                      </Text>
                      <Text style={styles.cardType}>
                        {l.type === "offer" ? "✅ Offre" : "🔎 Recherche"}
                      </Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>{l.title}</Text>
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardLocation}>📍 {l.location}</Text>
                      {l.price && (
                        <Text style={styles.cardPrice}>{l.price}€/{l.priceUnit}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.back()}>
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
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 12, color: COLORS.gold, fontWeight: "700" },
  headerCenter: { alignItems: "center", flex: 1 },
  appName: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  tagline: { fontSize: 11, color: COLORS.muted },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: { color: COLORS.gold, fontWeight: "700", fontSize: 14 },
  purpleLine: { height: 1, backgroundColor: COLORS.purple, marginHorizontal: 20, opacity: 0.4 },
  catScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: { borderColor: COLORS.purple, backgroundColor: COLORS.purpleDim },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 13, color: COLORS.muted, fontWeight: "600" },
  catLabelActive: { color: COLORS.purple },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  featuredScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  featuredCard: {
    width: width * 0.72,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.purpleDim,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  featuredBadgeText: { fontSize: 9, color: COLORS.purple, fontWeight: "800", letterSpacing: 1 },
  featuredEmoji: { fontSize: 36, marginTop: 4 },
  featuredTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 4 },
  featuredLocation: { fontSize: 12, color: COLORS.muted },
  featuredPrice: { fontSize: 14, fontWeight: "700", color: COLORS.gold, marginTop: 4 },
  featuredUser: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.purpleDim,
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: { fontSize: 10, color: COLORS.purple, fontWeight: "700" },
  featuredUserName: { fontSize: 12, color: COLORS.muted },
  card: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  cardEmoji: { width: 70, alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1, padding: 12, gap: 4 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardCategory: { fontSize: 11, color: COLORS.purple, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardType: { fontSize: 11, color: COLORS.muted },
  cardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  cardLocation: { fontSize: 11, color: COLORS.muted },
  cardPrice: { fontSize: 12, fontWeight: "700", color: COLORS.gold },
  empty: { color: COLORS.muted, textAlign: "center", marginTop: 40, fontSize: 14 },
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
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    elevation: 8,
  },
  navPostText: { fontSize: 26, color: "#fff", fontWeight: "300", lineHeight: 30 },
});
