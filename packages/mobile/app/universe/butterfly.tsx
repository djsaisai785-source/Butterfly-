import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useState } from "react";
import { useLocation } from "../../lib/LocationContext";
import { getCategoryImage } from "../../lib/categoryImages";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
  purple: "#9B59B6",
  purpleDim: "#9B59B622",
  gold: "#D4AF37",
};

const CATEGORIES = [
  { key: "", label: "🌙 Tout" },
  { key: "club", label: "🎭 Clubs" },
  { key: "dj", label: "🎧 DJ" },
  { key: "barman", label: "🍸 Barman" },
  { key: "vtc", label: "🚗 VTC Nuit" },
  { key: "securite", label: "🛡️ Sécurité" },
  { key: "soiree", label: "🎉 Soirées" },
  { key: "vip", label: "👑 VIP" },
  { key: "restaurant", label: "🍽️ Restos" },
  { key: "hotel", label: "🏨 Hôtels" },
  { key: "after", label: "🌅 After" },
];

function ListingCard({ item }: { item: any }) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const photoUrl =
    !imgError && item.photos && item.photos.length > 0
      ? item.photos[0]
      : getCategoryImage(item.category, item.id, "butterfly");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/listing/${item.id}`)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: photoUrl }}
        style={styles.cardImage}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
      {/* Gradient overlay */}
      <View style={styles.cardOverlay} />

      {/* Badges on image */}
      <View style={styles.cardBadges}>
        <View style={[
          styles.badge,
          { backgroundColor: item.type === "offer" ? "#27AE6088" : "#E74C3C88" },
        ]}>
          <Text style={styles.badgeText}>
            {item.type === "offer" ? "✅ Propose" : "🔎 Cherche"}
          </Text>
        </View>
        {item.price && (
          <View style={[styles.badge, { backgroundColor: "#00000088" }]}>
            <Text style={[styles.badgeText, { color: COLORS.gold }]}>{item.price}€</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>📍 {item.city || item.location || "France"}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{item.category || "nightlife"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ButterflyScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("");
  const [activeType, setActiveType] = useState<"" | "offer" | "request">("");
  const location = useLocation();

  const cityFilter = location.city ?? undefined;

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings-butterfly", activeCategory, activeType, cityFilter],
    queryFn: () =>
      api.listings.$get({
        query: {
          category: activeCategory || undefined,
          type: activeType || undefined,
          location: cityFilter,
        },
      }).then((r) => r.json()),
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🦋 BUTTERFLY</Text>
          <Text style={styles.headerSub}>
            {location.city
              ? `📍 ${location.city} · Nightlife`
              : "Nightlife • Clubs • Soirées"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => router.push("/post")}
        >
          <Text style={styles.postBtnText}>+ Poster</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.filterChip,
              activeCategory === cat.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategory === cat.key && styles.filterChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Type Filter */}
      <View style={styles.typeRow}>
        {(
          [
            { key: "", label: "Tous" },
            { key: "offer", label: "✅ Offre" },
            { key: "request", label: "🔎 Recherche" },
          ] as { key: "" | "offer" | "request"; label: string }[]
        ).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.typeBtn, activeType === t.key && styles.typeBtnActive]}
            onPress={() => setActiveType(t.key)}
          >
            <Text style={[styles.typeBtnText, activeType === t.key && styles.typeBtnTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Listings */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.purple} style={{ marginTop: 40 }} />
        ) : listings && (listings as any[]).length > 0 ? (
          (listings as any[]).map((item: any) => (
            <ListingCard key={item.listing?.id ?? item.id} item={item.listing ?? item} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🦋</Text>
            <Text style={styles.emptyText}>
              {location.city
                ? `Aucune annonce à ${location.city} pour l'instant`
                : "Aucune annonce pour l'instant"}
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/post")}>
              <Text style={styles.emptyBtnText}>Poster une annonce</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  headerSub: { fontSize: 11, color: COLORS.muted },
  postBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  filterRow: { backgroundColor: COLORS.surface, maxHeight: 52 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  filterChipText: { fontSize: 13, color: COLORS.muted, fontWeight: "600" },
  filterChipTextActive: { color: "#FFFFFF" },
  typeRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtnActive: { backgroundColor: COLORS.purpleDim, borderColor: COLORS.purple },
  typeBtnText: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  typeBtnTextActive: { color: COLORS.purple },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 16 },

  // Card with real image
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.border,
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "#00000040",
  },
  cardBadges: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  cardContent: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.muted, lineHeight: 18, marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.muted },
  metaDot: { fontSize: 12, color: COLORS.border },

  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 15, color: COLORS.muted, fontWeight: "600", textAlign: "center" },
  emptyBtn: {
    backgroundColor: COLORS.purpleDim,
    borderWidth: 1,
    borderColor: COLORS.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyBtnText: { color: COLORS.purple, fontWeight: "700", fontSize: 14 },
});
