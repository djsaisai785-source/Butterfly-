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
  bg: "#F0F9FF",
  sky: "#4FC3F7",
  green: "#66BB6A",
  yellow: "#FFD54F",
  coral: "#FF8A65",
  text: "#1A1A2E",
  subtext: "#555577",
  card: "#FFFFFF",
  border: "#E0F2FE",
};

const CATEGORIES = [
  { key: "", label: "🌈 Tout" },
  { key: "plage", label: "🏖️ Plage" },
  { key: "rando", label: "🥾 Rando" },
  { key: "parc", label: "🎡 Parcs & Zoos" },
  { key: "nounou", label: "🧸 Nounou" },
  { key: "sport", label: "⚽ Sport enfants" },
  { key: "atelier", label: "🎨 Ateliers créatifs" },
  { key: "spectacle", label: "🎪 Spectacles" },
  { key: "baignade", label: "🏊 Baignade" },
  { key: "indoor", label: "🏠 Indoor (pluie)" },
  { key: "weekend", label: "🗺️ Week-end famille" },
];

function ListingCard({ item }: { item: any }) {
  const router = useRouter();
  const catEmoji =
    CATEGORIES.find((c) => c.key === item.category)?.label?.split(" ")[0] ||
    "🎈";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/listing/${item.id}`)}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.cardHero,
          { backgroundColor: COLORS.sky + "33" },
        ]}
      >
        <Text style={styles.cardEmoji}>{catEmoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.type === "offer" ? COLORS.green + "22" : COLORS.coral + "22",
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    item.type === "offer" ? COLORS.green : COLORS.coral,
                },
              ]}
            >
              {item.type === "offer" ? "✅ Propose" : "🔎 Cherche"}
            </Text>
          </View>
          {item.price && (
            <Text style={styles.price}>{item.price}€</Text>
          )}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>
            📍 {item.city || "France"} · {item.category || "famille"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function KidoScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("");
  const [activeType, setActiveType] = useState<"" | "offer" | "request">("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", activeCategory, activeType],
    queryFn: () =>
      api.getListings({
        category: activeCategory || undefined,
        type: activeType || undefined,
      }),
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🎈 KIDO</Text>
          <Text style={styles.headerSub}>Activités & sorties famille</Text>
        </View>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => router.push("/post")}
        >
          <Text style={styles.postBtnText}>+ Poster</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌈</Text>
        <View>
          <Text style={styles.heroTitle}>Et on va où aujourd'hui ?</Text>
          <Text style={styles.heroSub}>Trouvez des activités près de chez vous</Text>
        </View>
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
            { key: "offer", label: "✅ Propose" },
            { key: "request", label: "🔎 Cherche" },
          ] as { key: "" | "offer" | "request"; label: string }[]
        ).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.typeBtn,
              activeType === t.key && styles.typeBtnActive,
            ]}
            onPress={() => setActiveType(t.key)}
          >
            <Text
              style={[
                styles.typeBtnText,
                activeType === t.key && styles.typeBtnTextActive,
              ]}
            >
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
          <ActivityIndicator color={COLORS.sky} style={{ marginTop: 40 }} />
        ) : listings && listings.length > 0 ? (
          listings.map((item: any) => (
            <ListingCard key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎈</Text>
            <Text style={styles.emptyText}>Aucune annonce pour l'instant</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push("/post")}
            >
              <Text style={styles.emptyBtnText}>Poster une annonce</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: "#FFFFFF",
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: COLORS.text },
  headerTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  headerSub: { fontSize: 11, color: COLORS.subtext },
  postBtn: {
    backgroundColor: COLORS.sky,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.sky + "22",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  heroSub: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  filterRow: { backgroundColor: "#FFFFFF", maxHeight: 52 },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.sky,
    borderColor: COLORS.sky,
  },
  filterChipText: { fontSize: 13, color: COLORS.subtext, fontWeight: "600" },
  filterChipTextActive: { color: "#FFFFFF" },
  typeRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "#FFFFFF",
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
  typeBtnActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  typeBtnText: { fontSize: 12, color: COLORS.subtext, fontWeight: "600" },
  typeBtnTextActive: { color: "#FFFFFF" },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 14 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.sky,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHero: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: { fontSize: 48 },
  cardBody: { padding: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  price: { fontSize: 16, fontWeight: "800", color: COLORS.green },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.subtext, lineHeight: 18, marginBottom: 8 },
  cardFooter: {},
  cardMeta: { fontSize: 12, color: COLORS.subtext },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 15, color: COLORS.subtext, fontWeight: "600" },
  emptyBtn: {
    backgroundColor: COLORS.sky,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
