import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle } from "lucide-react";
import { authClient } from "../lib/auth";
import { getToken } from "../lib/auth";
import { useLocation } from "wouter";
import { useToast } from "../components/Toast";

const API = import.meta.env.VITE_SERVER_URL || "";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function MessagesPage() {
  const { data: session } = authClient.useSession();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const { success, error } = useToast();

  // Pick up ?convoId= from query params (set by listing page contact button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("convoId");
    if (cid) setActiveConvoId(cid);
  }, [location]);

  const userId = session?.user?.id;

  // Fetch conversations
  const convosQuery = useQuery({
    queryKey: ["conversations", userId],
    enabled: !!userId,
    queryFn: () => apiFetch(`/api/conversations?userId=${userId}`),
    refetchInterval: 5000,
  });

  const convos: any[] = convosQuery.data?.conversations || [];

  // Set first convo as default
  useEffect(() => {
    if (!activeConvoId && convos.length > 0) {
      setActiveConvoId(convos[0].id);
    }
  }, [convos, activeConvoId]);

  // Fetch messages for active convo
  const msgsQuery = useQuery({
    queryKey: ["messages", activeConvoId],
    enabled: !!activeConvoId,
    queryFn: () => apiFetch(`/api/conversations/${activeConvoId}/messages`),
    refetchInterval: 3000,
  });

  const messages: any[] = msgsQuery.data?.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/conversations/${activeConvoId}/messages`, {
        method: "POST",
        body: JSON.stringify({ senderId: userId, content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvoId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
      success("Message envoyé");
    },
    onError: () => error("Échec de l'envoi"),
  });

  const send = () => {
    if (!newMsg.trim() || !activeConvoId) return;
    sendMutation.mutate(newMsg.trim());
    setNewMsg("");
  };

  const activeConvo = convos.find((c: any) => c.id === activeConvoId);

  // Get other participant's name
  const getOtherName = (convo: any) => {
    if (!convo) return "?";
    if (convo.participant1Id === userId) {
      return convo.participant2?.name || convo.participant2?.email || "?";
    }
    return convo.participant1?.name || convo.participant1?.email || "?";
  };

  const getAvatar = (name: string) => name?.[0]?.toUpperCase() || "?";

  const formatTime = (ts: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" });
  };

  if (!userId) {
    return (
      <div style={{ paddingTop: 64, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <p style={{ color: "#8A8A9A" }}>Connectez-vous pour accéder à vos messages.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 64, height: "100vh", display: "flex", background: "var(--bg-primary)" }}>

      {/* Sidebar */}
      <div style={{
        width: 320, borderRight: "1px solid rgba(42,42,58,0.8)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(42,42,58,0.8)" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: "#F5F5F0" }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {convosQuery.isLoading && (
            <div style={{ padding: 24, color: "#8A8A9A", fontSize: 14 }}>Chargement...</div>
          )}
          {!convosQuery.isLoading && convos.length === 0 && (
            <div style={{ padding: 24, textAlign: "center" }}>
              <MessageCircle size={32} color="#8A8A9A" style={{ marginBottom: 12 }} />
              <p style={{ color: "#8A8A9A", fontSize: 14 }}>Aucune conversation pour le moment.</p>
            </div>
          )}
          {convos.map((c: any) => {
            const otherName = getOtherName(c);
            const lastMsg = c.lastMessage?.content || c.listing?.title || "";
            const lastTime = c.lastMessage?.createdAt ? formatTime(c.lastMessage.createdAt) : "";
            return (
              <div key={c.id} onClick={() => setActiveConvoId(c.id)} style={{
                padding: "16px 20px", cursor: "pointer", borderBottom: "1px solid rgba(42,42,58,0.4)",
                background: activeConvoId === c.id ? "rgba(212,175,55,0.08)" : "transparent",
                borderLeft: activeConvoId === c.id ? "3px solid #D4AF37" : "3px solid transparent",
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4AF37, #B76E79)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 16, color: "#0A0A0F", flexShrink: 0,
                  }}>{getAvatar(otherName)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#F5F5F0" }}>{otherName}</span>
                      <span style={{ fontSize: 11, color: "#8A8A9A" }}>{lastTime}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#8A8A9A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lastMsg}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!activeConvoId ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <MessageCircle size={48} color="#8A8A9A" style={{ marginBottom: 16 }} />
              <p style={{ color: "#8A8A9A" }}>Sélectionnez une conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid rgba(42,42,58,0.8)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #D4AF37, #B76E79)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, color: "#0A0A0F",
              }}>{getAvatar(getOtherName(activeConvo))}</div>
              <div>
                <div style={{ fontWeight: 600, color: "#F5F5F0" }}>{getOtherName(activeConvo)}</div>
                {activeConvo?.listing?.title && (
                  <div style={{ fontSize: 12, color: "#8A8A9A" }}>{activeConvo.listing.title}</div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {msgsQuery.isLoading && <div style={{ color: "#8A8A9A", fontSize: 14 }}>Chargement...</div>}
              {messages.map((m: any) => {
                const isMe = m.senderId === userId;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "65%", padding: "12px 16px",
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMe ? "linear-gradient(135deg, #D4AF37, #FFBF00)" : "rgba(26,26,38,0.8)",
                      border: isMe ? "none" : "1px solid rgba(42,42,58,0.8)",
                      color: isMe ? "#0A0A0F" : "#F5F5F0", fontSize: 14, lineHeight: 1.5,
                    }}>
                      <div>{m.content}</div>
                      <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6, textAlign: "right" }}>
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={msgEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: "16px 24px", borderTop: "1px solid rgba(42,42,58,0.8)",
              display: "flex", gap: 12,
            }}>
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Écrivez un message..."
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 50,
                  background: "rgba(26,26,38,0.8)", border: "1px solid rgba(42,42,58,0.8)",
                  color: "#F5F5F0", fontSize: 14, fontFamily: "inherit", outline: "none",
                }} />
              <button onClick={send} disabled={sendMutation.isPending} style={{
                background: "linear-gradient(135deg, #D4AF37, #FFBF00)",
                border: "none", borderRadius: "50%", width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", opacity: sendMutation.isPending ? 0.6 : 1,
              }}>
                <Send size={18} color="#0A0A0F" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
