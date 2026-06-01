import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
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

const CATEGORIES = [
  { id: "", label: "Tout", emoji: "✨" },
  { id: "nightlife", label: "Nuit", emoji: "🌙" },
  { id: "restauration", label: "Food", emoji: "🍽️" },
  { id: "transport", label: "Transport", emoji: "🚗" },
  { id: "emploi", label: "Emploi", emoji: "💼" },
  { id: "dating", label: "Dating", emoji: "❤️" },
];

const TYPES = [
  { id: "", label: "Tout" },
  { id: "offer", label: "✅ Offre" },
  { id: "request", label: "🔎 Recherche" },
];

const CATEGORY_COLORS: Record<string, string> = {
  nightlife: "#1A1A3E",
  restauration: "#1E1209",
  transport: "#0D1A2E",
  emploi: "#0D1E16",
  dating: "#2E0D1A",
};

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["listings-explore"],
    queryFn: async () => {
      const res = await api.listings.$get();
      return res.json();
    },
  });

  const all = (data as any)?.listings ?? [];

  const filtered = all.filter((item: any) => {
    const l = item.listing;
    const matchCat = !category || l.category === category;
    const matchType = !type || l.type === type;
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
      (l.location && l.location.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchType && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explorer</Text>
          <Text style={styles.subtitle}>AURA · {all.length} annonces</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: COLORS.muted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, category === cat.id && styles.chipActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              <Text style={[styles.chipLabel, category === cat.id && styles.chipLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type filters */}
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeChip, type === t.id && styles.typeChipActive]}
              onPress={() => setType(t.id)}
            >
              <Text style={[styles.typeLabel, type === t.id && styles.typeLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.resultCount}>{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={COLORS.gold} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item: any) => item.listing.id}
            contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.empty}>Aucun résultat</Text>
            }
            renderItem={({ item }: any) => {
              const l = item.listing;
              const u = item.user;
              const bg = CATEGORY_COLORS[l.category] ?? COLORS.surface;
              const catObj = CATEGORIES.find((c) => c.id === l.category);
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push(`/listing/${l.id}`)}
                >
                  <View style={[styles.cardLeft, { backgroundColor: bg }]}>
                    <Text style={{ fontSize: 26 }}>{catObj?.emoji ?? "✨"}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardCat}>{catObj?.label ?? l.category}</Text>
                      <Text style={styles.cardTypeLabel}>
                        {l.type === "offer" ? "✅ Offre" : "🔎 Recherche"}
                      </Text>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>{l.title}</Text>
                    <View style={styles.cardRow}>
                      <Text style={styles.cardLoc}>📍 {l.location}</Text>
                      {l.price && (
                        <Text style={styles.cardPrice}>{l.price}€/{l.priceUnit}</Text>
                      )}
                    </View>
                    {u?.name && (
                      <View style={styles.cardUser}>
                        <View style={styles.miniAvatar}>
                          <Text style={{ fontSize: 9, color: COLORS.gold, fontWeight: "700" }}>
                            {u.name[0]}
                          </Text>
                        </View>
                        <Text style={styles.cardUserName}>{u.name}</Text>
                        {u.verified && <Text style={{ fontSize: 10, color: COLORS.gold }}>✓</Text>}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </KeyboardAvoidingView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/explore")}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={[styles.navLabel, { color: COLORS.gold }]}>Explorer</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, height: 44, color: COLORS.text, fontSize: 15 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  chipEmoji: { fontSize: 12 },
  chipLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  chipLabelActive: { color: COLORS.gold },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  typeLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  typeLabelActive: { color: COLORS.gold },
  resultCount: { marginLeft: "auto", fontSize: 12, color: COLORS.muted },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  cardLeft: { width: 64, alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, padding: 12, gap: 4 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardCat: { fontSize: 10, color: COLORS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardTypeLabel: { fontSize: 10, color: COLORS.muted },
  cardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cardLoc: { fontSize: 11, color: COLORS.muted },
  cardPrice: { fontSize: 12, fontWeight: "700", color: COLORS.gold },
  cardUser: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.goldDim,
    alignItems: "center",
    justifyContent: "center",
  },
  cardUserName: { fontSize: 11, color: COLORS.muted },
  empty: { color: COLORS.muted, textAlign: "center", marginTop: 40 },
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
