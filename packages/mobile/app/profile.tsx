import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession, signOut } from "../lib/auth";
import { useState } from "react";

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
  input: "#0D0D14",
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
};

// ─── Edit Modal ───
function EditModal({
  visible,
  user,
  onClose,
  onSave,
  saving,
}: {
  visible: boolean;
  user: any;
  onClose: () => void;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.container}>
        {/* Header */}
        <View style={modal.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={modal.cancel}>Annuler</Text>
          </TouchableOpacity>
          <Text style={modal.title}>Modifier le profil</Text>
          <TouchableOpacity
            onPress={() => onSave({ name, bio, location, phone })}
            disabled={saving}
          >
            <Text style={[modal.save, saving && { opacity: 0.5 }]}>
              {saving ? "..." : "Sauvegarder"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={modal.goldLine} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={modal.body}>
          {/* Avatar preview */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View style={[modal.avatar, { backgroundColor: getAvatarColor(name || "A") + "22" }]}>
              <Text style={[modal.avatarText, { color: getAvatarColor(name || "A") }]}>
                {(name || "A")[0]?.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={modal.label}>Nom complet</Text>
          <TextInput
            style={modal.input}
            value={name}
            onChangeText={setName}
            placeholder="Votre nom"
            placeholderTextColor={COLORS.muted}
          />

          <Text style={modal.label}>Bio</Text>
          <TextInput
            style={[modal.input, { height: 90, textAlignVertical: "top" }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Décrivez-vous en quelques mots..."
            placeholderTextColor={COLORS.muted}
            multiline
          />

          <Text style={modal.label}>Localisation</Text>
          <TextInput
            style={modal.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Paris, Nice, Lyon..."
            placeholderTextColor={COLORS.muted}
          />

          <Text style={modal.label}>Téléphone</Text>
          <TextInput
            style={modal.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+33 6 00 00 00 00"
            placeholderTextColor={COLORS.muted}
            keyboardType="phone-pad"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  cancel: { fontSize: 16, color: COLORS.muted },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  save: { fontSize: 16, color: COLORS.gold, fontWeight: "700" },
  goldLine: { height: 1, backgroundColor: COLORS.gold, opacity: 0.3 },
  body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 32, fontWeight: "700" },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
});

// ─── Main Screen ───
export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "u1";
  const [editOpen, setEditOpen] = useState(false);

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await api.users[":id"].$get({ param: { id: userId } });
      return res.json();
    },
  });

  const { data: listingsData, isLoading: loadingListings } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await api.listings.$get();
      return res.json();
    },
  });

  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", userId] });
      setEditOpen(false);
    },
    onError: () => Alert.alert("Erreur", "Impossible de sauvegarder les modifications."),
  });

  const user = (userData as any)?.user;
  const allListings = (listingsData as any)?.listings ?? [];
  const myListings = allListings.filter((item: any) => item.listing?.userId === userId);

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const avatarColor = user?.name ? getAvatarColor(user.name) : COLORS.gold;
  const userCategories = user?.categories ? JSON.parse(user.categories) : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <EditModal
        visible={editOpen}
        user={user}
        onClose={() => setEditOpen(false)}
        onSave={(data) => updateUser.mutate(data)}
        saving={updateUser.isPending}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity onPress={() => setEditOpen(true)}>
            <Text style={styles.editBtn}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={() => setEditOpen(true)}>
            <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
              <Text style={[styles.avatarText, { color: avatarColor }]}>
                {user?.name?.[0] ?? "A"}
              </Text>
              <View style={styles.editAvatarBadge}>
                <Text style={styles.editAvatarIcon}>✎</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.name ?? "Utilisateur"}</Text>

          {user?.verified && (
            <View style={styles.verifiedChip}>
              <Text style={styles.verifiedText}>✓ Compte vérifié</Text>
            </View>
          )}

          {user?.type && user.type !== "user" && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {user.type === "pro" ? "⚡ Pro" : user.type === "vip" ? "👑 VIP" : user.type}
              </Text>
            </View>
          )}

          {user?.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : (
            <TouchableOpacity onPress={() => setEditOpen(true)}>
              <Text style={styles.addBio}>+ Ajouter une bio</Text>
            </TouchableOpacity>
          )}

          {user?.location && (
            <Text style={styles.location}>📍 {user.location}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{myListings.length}</Text>
              <Text style={styles.statLabel}>Annonces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user?.rating ?? "—"}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user?.reviewCount ?? 0}</Text>
              <Text style={styles.statLabel}>Avis</Text>
            </View>
          </View>

          {/* Categories */}
          {userCategories.length > 0 && (
            <View style={styles.catWrap}>
              {userCategories.map((cat: string) => {
                const info = CATEGORIES[cat];
                return (
                  <View key={cat} style={styles.catTag}>
                    <Text style={styles.catTagText}>
                      {info ? `${info.emoji} ${info.label}` : cat}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* My listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes annonces</Text>
          {loadingListings ? (
            <ActivityIndicator color={COLORS.gold} style={{ margin: 16 }} />
          ) : myListings.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Aucune annonce pour le moment</Text>
              <TouchableOpacity style={styles.postBtn} onPress={() => router.push("/post")}>
                <Text style={styles.postBtnText}>Créer une annonce ✦</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myListings.map((item: any) => {
              const l = item.listing;
              const catInfo = CATEGORIES[l.category];
              return (
                <TouchableOpacity
                  key={l.id}
                  style={styles.listingCard}
                  onPress={() => router.push(`/listing/${l.id}`)}
                >
                  <View style={styles.listingLeft}>
                    <Text style={{ fontSize: 22 }}>{catInfo?.emoji ?? "✨"}</Text>
                  </View>
                  <View style={styles.listingBody}>
                    <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                    <Text style={styles.listingMeta}>
                      {catInfo?.label} · {l.type === "offer" ? "Offre" : "Recherche"}
                      {l.price ? ` · ${l.price}€/${l.priceUnit}` : ""}
                    </Text>
                  </View>
                  <View style={[styles.statusDot, l.status === "active" ? styles.statusActive : styles.statusPaused]} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push("/subscribe")}>
            <Text style={styles.actionIcon}>💎</Text>
            <Text style={[styles.actionLabel, { color: COLORS.gold }]}>Plans & Abonnement</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionRow} onPress={() => setEditOpen(true)}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Modifier le profil</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>⭐</Text>
            <Text style={styles.actionLabel}>Mes avis</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={styles.actionLabel}>Aide & support</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          {session ? (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={async () => {
                await signOut();
                router.replace("/sign-in");
              }}
            >
              <Text style={styles.actionIcon}>🚪</Text>
              <Text style={[styles.actionLabel, { color: "#EF4444" }]}>Se déconnecter</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionRow} onPress={() => router.push("/sign-in")}>
              <Text style={styles.actionIcon}>🔑</Text>
              <Text style={[styles.actionLabel, { color: COLORS.gold }]}>Se connecter</Text>
            </TouchableOpacity>
          )}
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
          <Text style={[styles.navLabel, { color: COLORS.gold }]}>Profil</Text>
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
  headerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  editBtn: { fontSize: 14, color: COLORS.gold, fontWeight: "600" },
  profileCard: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    position: "relative",
  },
  avatarText: { fontSize: 32, fontWeight: "700" },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarIcon: { fontSize: 11, color: COLORS.bg, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  verifiedChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.gold + "44",
  },
  verifiedText: { fontSize: 12, color: COLORS.gold, fontWeight: "700" },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBadgeText: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  bio: { fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  addBio: { fontSize: 13, color: COLORS.gold, opacity: 0.7 },
  location: { fontSize: 13, color: COLORS.muted },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    width: "100%",
    marginTop: 8,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: COLORS.gold },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  catWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  catTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catTagText: { fontSize: 12, color: COLORS.muted },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  emptyWrap: { alignItems: "center", padding: 24, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.muted },
  postBtn: {
    backgroundColor: COLORS.goldDim,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  postBtnText: { fontSize: 14, color: COLORS.gold, fontWeight: "600" },
  listingCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  listingLeft: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  listingBody: { flex: 1 },
  listingTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  listingMeta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusActive: { backgroundColor: "#4CAF50" },
  statusPaused: { backgroundColor: COLORS.muted },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  actionArrow: { fontSize: 20, color: COLORS.muted },
  actionDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 46 },
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
