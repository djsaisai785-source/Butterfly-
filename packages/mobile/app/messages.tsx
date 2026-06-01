import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";

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

function timeAgo(ts: any): string {
  const d = typeof ts === "number" ? ts * 1000 : new Date(ts).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "maintenant";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}j`;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return { conversations: [] };
      const res = await api.conversations.$get({ query: { userId } });
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });

  // For each conversation, fetch the other user's info
  const { data: allUsers } = useQuery({
    queryKey: ["all-users-cache"],
    queryFn: async () => {
      // We'll resolve names from listings or just show userId for now
      return {};
    },
  });

  const conversations = (data as any)?.conversations ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {conversations.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversations.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.goldLine} />

      {!session ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🔒</Text>
          <Text style={styles.emptyTitle}>Connexion requise</Text>
          <Text style={styles.emptyText}>Connectez-vous pour accéder à vos messages.</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push("/sign-in")}>
            <Text style={styles.exploreBtnText}>Se connecter →</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 60 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>Aucune conversation</Text>
          <Text style={styles.emptyText}>
            Contactez un annonceur pour démarrer une conversation.
          </Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push("/explore")}>
            <Text style={styles.exploreBtnText}>Explorer les annonces →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }: { item: any }) => {
            const otherId =
              item.participant1Id === userId ? item.participant2Id : item.participant1Id;
            const color = getAvatarColor(otherId ?? "?");
            return (
              <TouchableOpacity
                style={styles.convo}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <View style={[styles.avatar, { backgroundColor: color + "22" }]}>
                  <Text style={[styles.avatarText, { color }]}>
                    {(otherId ?? "?")[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.convoBody}>
                  <View style={styles.convoTop}>
                    <Text style={styles.convoName} numberOfLines={1}>
                      {otherId ?? "Utilisateur"}
                    </Text>
                    {item.lastMessageAt && (
                      <Text style={styles.convoTime}>{timeAgo(item.lastMessageAt)}</Text>
                    )}
                  </View>
                  <Text style={styles.convoLast} numberOfLines={1}>
                    {item.lastMessage ?? "Nouvelle conversation"}
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

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
          <Text style={[styles.navLabel, { color: COLORS.gold }]}>Messages</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text },
  badge: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 12, color: COLORS.bg, fontWeight: "800" },
  goldLine: { height: 1, backgroundColor: COLORS.gold, marginHorizontal: 20, opacity: 0.3 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 20 },
  exploreBtn: {
    marginTop: 8,
    backgroundColor: COLORS.goldDim,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  exploreBtnText: { fontSize: 14, color: COLORS.gold, fontWeight: "600" },
  convo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700" },
  convoBody: { flex: 1, gap: 4 },
  convoTop: { flexDirection: "row", justifyContent: "space-between" },
  convoName: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  convoTime: { fontSize: 11, color: COLORS.muted },
  convoLast: { fontSize: 13, color: COLORS.muted },
  arrow: { fontSize: 22, color: COLORS.muted },
  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 84 },
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
