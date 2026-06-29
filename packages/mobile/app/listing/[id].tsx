import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useSession } from "../../lib/auth";
import { useCustomer } from "autumn-js/react";

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
};

const CATEGORIES: Record<string, { label: string; emoji: string; bg: string }> = {
  nightlife: { label: "Nuit & Nightlife", emoji: "🌙", bg: "#1A1A3E" },
  restauration: { label: "Food & Resto", emoji: "🍽️", bg: "#1E1209" },
  transport: { label: "Transport", emoji: "🚗", bg: "#0D1A2E" },
  emploi: { label: "Emploi", emoji: "💼", bg: "#0D1E16" },
  dating: { label: "Dating", emoji: "❤️", bg: "#2E0D1A" },
  entertainment: { label: "Entertainment", emoji: "🎭", bg: "#1A1A2E" },
  hebergement: { label: "Hébergement", emoji: "🏠", bg: "#1A2E1A" },
  vip: { label: "VIP", emoji: "👑", bg: "#2E2200" },
  location: { label: "Location", emoji: "🔑", bg: "#1E1A2E" },
};

const AVATAR_PALETTE = ["#D4AF37", "#7B68EE", "#AB47BC", "#4A90D9", "#E91E8C", "#26C6DA"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: customer } = useCustomer();
  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";
  const canContact = activePlan === "pro" || activePlan === "vip";

  const { data, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await api.listings[":id"].$get({ param: { id: id! } });
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const row = data as any;
  if (!row?.listing) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <Text style={styles.error}>Annonce introuvable</Text>
      </SafeAreaView>
    );
  }

  const l = row.listing;
  const u = row.user;
  const catInfo = CATEGORIES[l.category] ?? { label: l.category, emoji: "✨", bg: COLORS.surface };
  const tags = l.tags ? JSON.parse(l.tags) : [];
  const avatarColor = u?.name ? getAvatarColor(u.name) : COLORS.gold;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: catInfo.bg }]}>
          <Text style={styles.heroEmoji}>{catInfo.emoji}</Text>
          <Text style={styles.heroCategory}>{catInfo.label}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {l.type === "offer" ? "✅ Offre" : "🔎 Recherche"}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Title */}
          <Text style={styles.title}>{l.title}</Text>

          {/* Price */}
          {l.price ? (
            <View style={styles.priceWrap}>
              <Text style={styles.price}>{l.price}€</Text>
              {l.priceUnit && <Text style={styles.priceUnit}>/ {l.priceUnit}</Text>}
            </View>
          ) : l.priceUnit === "devis" ? (
            <Text style={styles.priceDevis}>Sur devis</Text>
          ) : null}

          {/* Location */}
          {l.location && (
            <View style={styles.row}>
              <Text style={styles.rowIcon}>📍</Text>
              <Text style={styles.rowText}>{l.location}</Text>
            </View>
          )}

          {/* Date */}
          {l.date && (
            <View style={styles.row}>
              <Text style={styles.rowIcon}>📅</Text>
              <Text style={styles.rowText}>{l.date}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{l.description}</Text>

          {/* Tags */}
          {tags.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.tagsWrap}>
                {tags.map((tag: string, i: number) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Author */}
          {u?.name && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Publié par</Text>
              <TouchableOpacity style={styles.authorCard} onPress={() => u?.id && router.push(`/user/${u.id}`)}>
                <View style={[styles.avatar, { backgroundColor: avatarColor + "33" }]}>
                  <Text style={[styles.avatarText, { color: avatarColor }]}>{u.name[0]}</Text>
                </View>
                <View style={styles.authorInfo}>
                  <View style={styles.authorRow}>
                    <Text style={[styles.authorName, { color: COLORS.gold }]}>{u.name}</Text>
                    {u.verified && (
                      <View style={styles.verifiedChip}>
                        <Text style={styles.verifiedText}>✓ Vérifié</Text>
                      </View>
                    )}
                  </View>
                  {u.rating > 0 && (
                    <Text style={styles.rating}>⭐ {u.rating} · {u.reviewCount} avis</Text>
                  )}
                  {u.bio && <Text style={styles.bio} numberOfLines={2}>{u.bio}</Text>}
                </View>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        {canContact ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => {
              Alert.alert(
                "Contacter",
                `Envoyer un message à ${u?.name ?? "cet annonceur"} ?`,
                [
                  { text: "Annuler", style: "cancel" },
                  { text: "Messages →", onPress: () => router.push("/messages") },
                ]
              );
            }}
          >
            <Text style={styles.ctaBtnText}>Contacter ✦</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: "#1E1E2E", borderWidth: 1.5, borderColor: COLORS.gold }]}
            onPress={() => {
              if (!session) {
                router.push("/sign-in");
              } else {
                router.push("/subscribe");
              }
            }}
          >
            <Text style={[styles.ctaBtnText, { color: COLORS.gold }]}>
              {session ? "Passer Pro pour contacter ✦" : "Se connecter pour contacter"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  back: { paddingHorizontal: 20, paddingVertical: 12 },
  backText: { color: COLORS.gold, fontSize: 14, fontWeight: "600" },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  heroEmoji: { fontSize: 64 },
  heroCategory: { fontSize: 13, color: COLORS.muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  typeBadge: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.gold + "44",
  },
  typeBadgeText: { fontSize: 12, color: COLORS.gold, fontWeight: "700" },
  body: { padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, lineHeight: 28, marginBottom: 12 },
  priceWrap: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 10 },
  price: { fontSize: 28, fontWeight: "800", color: COLORS.gold },
  priceUnit: { fontSize: 14, color: COLORS.muted },
  priceDevis: { fontSize: 16, color: COLORS.gold, fontWeight: "600", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  rowIcon: { fontSize: 15 },
  rowText: { fontSize: 14, color: COLORS.muted },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  sectionLabel: { fontSize: 11, color: COLORS.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  description: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { fontSize: 12, color: COLORS.muted },
  authorCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700" },
  authorInfo: { flex: 1, gap: 4 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  authorName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  verifiedChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORS.goldDim,
  },
  verifiedText: { fontSize: 10, color: COLORS.gold, fontWeight: "700" },
  rating: { fontSize: 13, color: COLORS.muted },
  bio: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  error: { color: COLORS.muted, textAlign: "center", marginTop: 60 },
  ctaWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: COLORS.bg + "EE",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaBtnText: { fontSize: 16, fontWeight: "800", color: COLORS.bg, letterSpacing: 0.5 },
});
