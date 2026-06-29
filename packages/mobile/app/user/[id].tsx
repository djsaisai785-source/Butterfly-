import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth";
import { useState } from "react";
import Constants from "expo-constants";

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
};

const AVATAR_PALETTE = ["#D4AF37", "#7B68EE", "#AB47BC", "#4A90D9", "#E91E8C", "#26C6DA"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  nightlife: { label: "Nuit", emoji: "🌙" },
  restauration: { label: "Food", emoji: "🍽️" },
  transport: { label: "Transport", emoji: "🚗" },
  emploi: { label: "Emploi", emoji: "💼" },
  dating: { label: "Dating", emoji: "❤️" },
  entertainment: { label: "Entertainment", emoji: "🎭" },
  hebergement: { label: "Hébergement", emoji: "🏠" },
  vip: { label: "VIP", emoji: "👑" },
  location: { label: "Location", emoji: "🔑" },
  famille: { label: "Famille", emoji: "👨‍👩‍👧" },
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const qc = useQueryClient();

  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: async () => {
      const baseUrl =
        Constants.expoConfig?.extra?.apiUrl ??
        process.env.EXPO_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/users/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const { getToken } = await import("../../lib/auth");
      const token = await getToken();
      const baseUrl =
        Constants.expoConfig?.extra?.apiUrl ??
        process.env.EXPO_PUBLIC_API_URL;
      await fetch(`${baseUrl}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reviewedId: id,
          reviewerId: session?.user?.id,
          rating,
          comment,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile", id] });
      setShowReview(false);
      setComment("");
      setRating(5);
      Alert.alert("✅", "Avis publié !");
    },
    onError: () => Alert.alert("Erreur", "Impossible de publier l'avis."),
  });

  async function handleContact() {
    if (!session) { router.push("/sign-in"); return; }
    const { getToken } = await import("../../lib/auth");
    const token = await getToken();
    const baseUrl =
      Constants.expoConfig?.extra?.apiUrl ??
      process.env.EXPO_PUBLIC_API_URL;
    const res = await fetch(`${baseUrl}/api/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        participant1Id: session.user.id,
        participant2Id: id,
      }),
    });
    const { conversation } = await res.json();
    router.push(`/chat/${conversation?.id}`);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const userData = data as any;
  if (!userData?.user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.error}>Profil introuvable</Text>
      </SafeAreaView>
    );
  }

  const { user, listings, reviews } = userData;
  const ac = getAvatarColor(user.name ?? "U");
  const isOwn = session?.user?.id === id;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: ac + "22" }]}>
            <Text style={[styles.avatarText, { color: ac }]}>
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
            {user.type === "vip" && (
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>VIP</Text>
              </View>
            )}
          </View>

          {user.location && (
            <Text style={styles.location}>📍 {user.location}</Text>
          )}

          {user.rating > 0 && (
            <Text style={styles.rating}>
              ★ {user.rating} <Text style={styles.ratingCount}>({user.reviewCount} avis)</Text>
            </Text>
          )}

          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: "Annonces", value: listings?.length ?? 0 },
              { label: "Note", value: user.rating > 0 ? `${user.rating}/5` : "—" },
              { label: "Avis", value: user.reviewCount ?? 0 },
            ].map((s, i) => (
              <View key={s.label} style={[styles.stat, i > 0 && styles.statBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          {!isOwn && (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
                <Text style={styles.contactBtnText}>💬 Contacter</Text>
              </TouchableOpacity>
              {session && (
                <TouchableOpacity style={styles.reviewBtn} onPress={() => setShowReview(true)}>
                  <Text style={styles.reviewBtnText}>★ Avis</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Listings */}
        {listings && listings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Annonces actives</Text>
            {listings.map(({ listing: l }: any) => {
              const cat = CATEGORIES[l.category];
              return (
                <TouchableOpacity
                  key={l.id}
                  style={styles.listingCard}
                  onPress={() => router.push(`/listing/${l.id}`)}
                >
                  <View style={styles.listingIcon}>
                    <Text style={{ fontSize: 22 }}>{cat?.emoji ?? "✨"}</Text>
                  </View>
                  <View style={styles.listingBody}>
                    <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                    <Text style={styles.listingMeta}>
                      {cat?.label} · {l.type === "offer" ? "Offre" : "Recherche"}
                      {l.price ? ` · ${l.price}€` : ""}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis reçus</Text>
            {reviews.map(({ review, reviewer }: any) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewAvatar, { backgroundColor: getAvatarColor(reviewer?.name ?? "?") + "33" }]}>
                    <Text style={{ color: getAvatarColor(reviewer?.name ?? "?"), fontWeight: "700" }}>
                      {reviewer?.name?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{reviewer?.name ?? "Anonyme"}</Text>
                    <Text style={styles.reviewStars}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</Text>
                  </View>
                </View>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={showReview} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowReview(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReview(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Laisser un avis</Text>
            <TouchableOpacity onPress={() => submitReview.mutate()} disabled={submitReview.isPending}>
              <Text style={[styles.modalSave, submitReview.isPending && { opacity: 0.5 }]}>
                {submitReview.isPending ? "..." : "Publier"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.goldLine} />

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalBody}>
            <Text style={styles.modalLabel}>Note</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={[styles.starBtn, { color: n <= rating ? COLORS.gold : COLORS.border }]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Commentaire (optionnel)</Text>
            <TextInput
              style={styles.modalInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Votre expérience..."
              placeholderTextColor={COLORS.muted}
              multiline
              numberOfLines={4}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  error: { textAlign: "center", color: COLORS.muted, marginTop: 80, fontSize: 15 },
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backText: { fontSize: 16, color: COLORS.gold },
  profileCard: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 32, fontWeight: "700" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  verifiedBadge: {
    backgroundColor: COLORS.goldDim, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: COLORS.gold + "44",
  },
  verifiedText: { color: COLORS.gold, fontSize: 12, fontWeight: "700" },
  vipBadge: {
    backgroundColor: "#B76E7922", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: "#B76E7944",
  },
  vipText: { color: "#B76E79", fontSize: 12, fontWeight: "700" },
  location: { fontSize: 13, color: COLORS.muted },
  rating: { fontSize: 15, color: COLORS.gold, fontWeight: "700" },
  ratingCount: { color: COLORS.muted, fontWeight: "400" },
  bio: { fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  statsRow: {
    flexDirection: "row", backgroundColor: COLORS.surface,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 16, width: "100%", marginTop: 8,
  },
  stat: { flex: 1, alignItems: "center" },
  statBorder: { borderLeftWidth: 1, borderLeftColor: COLORS.border },
  statValue: { fontSize: 20, fontWeight: "800", color: COLORS.gold },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4, width: "100%" },
  contactBtn: {
    flex: 2, backgroundColor: COLORS.gold, borderRadius: 12, padding: 13,
    alignItems: "center",
  },
  contactBtnText: { color: COLORS.bg, fontWeight: "700", fontSize: 14 },
  reviewBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 13,
    alignItems: "center", borderWidth: 1, borderColor: COLORS.border,
  },
  reviewBtnText: { color: COLORS.gold, fontWeight: "600", fontSize: 14 },
  section: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12, fontWeight: "700", color: COLORS.gold,
    textTransform: "uppercase", letterSpacing: 0.8,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  listingCard: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12,
  },
  listingIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center",
  },
  listingBody: { flex: 1 },
  listingTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  listingMeta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  arrow: { fontSize: 20, color: COLORS.muted },
  reviewCard: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  reviewerName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  reviewStars: { fontSize: 12, color: COLORS.gold },
  reviewComment: { fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
  },
  modalCancel: { fontSize: 16, color: COLORS.muted },
  modalTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  modalSave: { fontSize: 16, color: COLORS.gold, fontWeight: "700" },
  goldLine: { height: 1, backgroundColor: COLORS.gold, opacity: 0.3 },
  modalBody: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  modalLabel: {
    fontSize: 12, color: COLORS.muted, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 16,
  },
  starsRow: { flexDirection: "row", gap: 12 },
  starBtn: { fontSize: 34 },
  modalInput: {
    backgroundColor: "#0D0D14", borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 15, minHeight: 100, textAlignVertical: "top",
  },
});
