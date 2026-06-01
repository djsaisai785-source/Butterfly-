import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useSession } from "../../lib/auth";
import { useState, useRef, useEffect } from "react";


const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
  bubble: "#1A1A2E",
  bubbleMe: "#1E1A0A",
};

const AVATAR_PALETTE = ["#D4AF37", "#7B68EE", "#AB47BC", "#4A90D9", "#E91E8C", "#26C6DA"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function formatTime(ts: any) {
  const d = new Date(typeof ts === "number" ? ts * 1000 : ts);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const flatRef = useRef<FlatList>(null);

  const { data: msgsData, isLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const res = await api.conversations[":id"].messages.$get({ param: { id } });
      return res.json();
    },
    refetchInterval: 2500, // poll every 2.5s
  });

  const messages = (msgsData as any)?.messages ?? [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const send = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: userId, content }),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !userId) return;
    setText("");
    send.mutate(trimmed);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.gold,
          headerTitle: "Conversation",
          headerBackTitle: "Retour",
        }}
      />

      {isLoading ? (
        <ActivityIndicator color={COLORS.gold} style={{ marginTop: 40 }} />
      ) : messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyText}>Démarrez la conversation</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m: any) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: any }) => {
            const isMe = item.senderId === userId;
            return (
              <View style={[styles.row, isMe && styles.rowMe]}>
                {!isMe && (
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.senderId) + "22" }]}>
                    <Text style={[styles.avatarText, { color: getAvatarColor(item.senderId) }]}>
                      {item.senderId[0]?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={styles.bubbleText}>{item.content}</Text>
                  <Text style={styles.bubbleTime}>{formatTime(item.createdAt)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Votre message..."
            placeholderTextColor={COLORS.muted}
            multiline
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || send.isPending}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: COLORS.muted },
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12, gap: 8 },
  rowMe: { flexDirection: "row-reverse" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 13, fontWeight: "700" },
  bubble: {
    maxWidth: "72%",
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.bubble,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.bubbleMe,
    borderWidth: 1,
    borderColor: COLORS.gold + "33",
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: COLORS.muted, alignSelf: "flex-end" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 16, color: COLORS.bg, fontWeight: "700" },
});
