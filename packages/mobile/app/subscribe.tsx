import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCustomer, useListPlans } from "autumn-js/react";
import { useSession } from "../lib/auth";

const C = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#1E1E2E",
  gold: "#D4AF37",
  goldDim: "#D4AF3730",
  text: "#F5F0E8",
  muted: "#6B6B7E",
  green: "#4CAF50",
  purple: "#9C27B0",
};

const PLAN_META: Record<string, { emoji: string; color: string; desc: string; perks: string[] }> = {
  free: {
    emoji: "👁",
    color: C.muted,
    desc: "Découvrir AURA",
    perks: ["Consulter toutes les annonces", "Profil public", "Accès limité"],
  },
  pro: {
    emoji: "⭐",
    color: C.gold,
    desc: "Pour les professionnels actifs",
    perks: ["Poster jusqu'à 10 annonces", "500 messages/mois", "Badge Pro", "Support prioritaire"],
  },
  vip: {
    emoji: "💎",
    color: C.purple,
    desc: "Le cercle d'élite",
    perks: [
      "Annonces illimitées",
      "Messages illimités",
      "3 annonces mises en avant",
      "Badge VIP doré",
      "Accès exclusif",
    ],
  },
};

export default function SubscribeScreen() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: customer, attach, isPending: attachPending } = useCustomer();
  const { data: plans, isLoading: plansLoading } = useListPlans();

  const activePlanId = customer?.subscriptions?.[0]?.planId ?? "free";

  async function handleAttach(planId: string) {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    if (planId === activePlanId) return;

    const result = await attach({
      planId,
      successUrl: "aura://subscribe?success=true",
    });

    // If Autumn returns a checkout URL, open it
    if (result && typeof result === "object" && "checkoutUrl" in result) {
      Linking.openURL((result as any).checkoutUrl);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir un plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.hero}>Libère tout le potentiel d'AURA</Text>
        <Text style={styles.heroSub}>
          Accède aux outils réservés aux professionnels de la nuit
        </Text>

        {plansLoading ? (
          <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
        ) : (
          (plans ?? []).map((plan) => {
            const meta = PLAN_META[plan.id] ?? PLAN_META.free;
            const isActive = plan.id === activePlanId;
            const price = plan.price ? `${(plan.price.amount / 100).toFixed(0)}€/mois` : "Gratuit";
            const action = plan.customerEligibility?.attachAction;

            return (
              <View
                key={plan.id}
                style={[
                  styles.card,
                  isActive && styles.cardActive,
                  plan.id === "vip" && styles.cardVip,
                ]}
              >
                {plan.id === "vip" && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>RECOMMANDÉ</Text>
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <Text style={styles.planEmoji}>{meta.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planName, { color: meta.color }]}>{plan.name}</Text>
                    <Text style={styles.planDesc}>{meta.desc}</Text>
                  </View>
                  <Text style={[styles.planPrice, { color: meta.color }]}>{price}</Text>
                </View>

                <View style={styles.perks}>
                  {meta.perks.map((p, i) => (
                    <View key={i} style={styles.perkRow}>
                      <Text style={[styles.perkCheck, { color: meta.color }]}>✓</Text>
                      <Text style={styles.perkText}>{p}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.planBtn,
                    isActive && styles.planBtnActive,
                    { borderColor: meta.color },
                    !isActive && plan.id !== "free" && { backgroundColor: meta.color },
                  ]}
                  onPress={() => handleAttach(plan.id)}
                  disabled={isActive || attachPending || plan.id === "free"}
                  activeOpacity={0.85}
                >
                  {attachPending ? (
                    <ActivityIndicator color={isActive ? meta.color : C.bg} size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.planBtnText,
                        { color: isActive ? meta.color : plan.id === "free" ? C.muted : C.bg },
                      ]}
                    >
                      {isActive
                        ? "Plan actuel"
                        : plan.id === "free"
                        ? "Inclus"
                        : action === "upgrade"
                        ? "Passer au " + plan.name
                        : action === "downgrade"
                        ? "Rétrograder"
                        : "Choisir " + plan.name}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <Text style={styles.disclaimer}>
          Paiement sécurisé par Stripe. Annulez à tout moment depuis votre profil.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backArrow: { fontSize: 28, color: C.text, lineHeight: 32 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: C.text },
  content: { paddingHorizontal: 20, paddingTop: 28 },
  hero: {
    fontSize: 24,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 16,
  },
  cardActive: { borderColor: C.gold },
  cardVip: { borderColor: "#9C27B0" },
  badge: {
    position: "absolute",
    top: -12,
    right: 16,
    backgroundColor: "#9C27B0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  planEmoji: { fontSize: 28 },
  planName: { fontSize: 18, fontWeight: "800", letterSpacing: 1 },
  planDesc: { fontSize: 12, color: C.muted, marginTop: 2 },
  planPrice: { fontSize: 16, fontWeight: "700" },
  perks: { gap: 8, marginBottom: 20 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkCheck: { fontSize: 13, fontWeight: "700", width: 16 },
  perkText: { fontSize: 13, color: C.text, flex: 1 },
  planBtn: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 13,
    alignItems: "center",
  },
  planBtnActive: { backgroundColor: "transparent" },
  planBtnText: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
  disclaimer: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
});
