import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import { useCustomer } from "autumn-js/react";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

const COLORS = {
  bg: "#0A0A0F",
  gold: "#D4AF37",
  goldDim: "#D4AF3722",
  surface: "#13131A",
  border: "#1E1E2E",
  text: "#F5F0E8",
  muted: "#6B6880",
  error: "#E53E3E",
};

const CATEGORIES = [
  { id: "nightlife", label: "Nuit & Nightlife", emoji: "🌙" },
  { id: "restauration", label: "Food & Resto", emoji: "🍽️" },
  { id: "transport", label: "Transport", emoji: "🚗" },
  { id: "emploi", label: "Emploi", emoji: "💼" },
  { id: "dating", label: "Dating", emoji: "❤️" },
];

const TYPES = [
  { id: "offer", label: "✅ Offre", desc: "Je propose" },
  { id: "demand", label: "🔎 Recherche", desc: "Je cherche" },
];

const PRICE_UNITS = ["heure", "soiree", "nuit", "jour", "semaine", "prestation", "devis"];

export default function PostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: customer } = useCustomer();
  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";
  const canPost = activePlan === "pro" || activePlan === "vip";

  const [type, setType] = useState("offer");
  const [category, setCategory] = useState("nightlife");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("heure");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a: any) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.listings.$post({
        json: {
          userId: session?.user?.id ?? "u1",
          type,
          category,
          title,
          description,
          price: price ? parseFloat(price) : null,
          priceUnit,
          location,
          images: images.length > 0 ? JSON.stringify(images) : null,
          status: "active",
        },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings-explore"] });
      Alert.alert("✦ Publié !", "Votre annonce est en ligne.", [
        { text: "OK", onPress: () => router.push("/") },
      ]);
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de publier l'annonce.");
    },
  });

  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10 && location.trim().length > 0;

  // Gate: redirect to subscribe if not pro/vip
  if (!canPost) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }]}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🔒</Text>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#F5F0E8", textAlign: "center", marginBottom: 8 }}>
          Fonctionnalité Pro
        </Text>
        <Text style={{ fontSize: 14, color: "#6B6B7E", textAlign: "center", marginBottom: 32, lineHeight: 20 }}>
          Poster une annonce est réservé aux membres Pro et VIP.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#D4AF37", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}
          onPress={() => router.push("/subscribe")}
        >
          <Text style={{ color: "#0A0A0F", fontWeight: "700", fontSize: 15 }}>Voir les plans ✦</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#6B6B7E", fontSize: 13 }}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle annonce</Text>
          <TouchableOpacity
            onPress={() => canSubmit && mutate()}
            disabled={!canSubmit || isPending}
            style={[styles.publishBtn, (!canSubmit || isPending) && styles.publishBtnDisabled]}
          >
            <Text style={[styles.publishText, (!canSubmit || isPending) && styles.publishTextDisabled]}>
              {isPending ? "..." : "Publier"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goldLine} />

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type */}
          <Text style={styles.label}>Je…</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeCard, type === t.id && styles.typeCardActive]}
                onPress={() => setType(t.id)}
              >
                <Text style={styles.typeCardLabel}>{t.label}</Text>
                <Text style={styles.typeCardDesc}>{t.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={styles.label}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, category === cat.id && styles.catChipActive]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Photos */}
          <Text style={styles.label}>Photos (optionnel)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => removeImage(idx)}>
                  <Text style={styles.photoRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.photoAdd} onPress={pickImage}>
                <Text style={styles.photoAddIcon}>📷</Text>
                <Text style={styles.photoAddText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Title */}
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: DJ disponible soirée privée..."
            placeholderTextColor={COLORS.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Décrivez votre annonce en détail..."
            placeholderTextColor={COLORS.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={800}
          />

          {/* Location */}
          <Text style={styles.label}>Lieu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Paris, Lyon, Côte d'Azur..."
            placeholderTextColor={COLORS.muted}
            value={location}
            onChangeText={setLocation}
          />

          {/* Price */}
          <Text style={styles.label}>Prix (optionnel)</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <Text style={styles.priceCurrency}>€</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {PRICE_UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitChip, priceUnit === u && styles.unitChipActive]}
                  onPress={() => setPriceUnit(u)}
                >
                  <Text style={[styles.unitLabel, priceUnit === u && styles.unitLabelActive]}>/{u}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || isPending) && styles.submitBtnDisabled]}
            onPress={() => canSubmit && mutate()}
            disabled={!canSubmit || isPending}
          >
            <Text style={styles.submitText}>
              {isPending ? "Publication..." : "Publier l'annonce ✦"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 14,
  },
  cancel: { color: COLORS.muted, fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  publishBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  publishBtnDisabled: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  publishText: { fontSize: 14, fontWeight: "700", color: COLORS.bg },
  publishTextDisabled: { color: COLORS.muted },
  goldLine: { height: 1, backgroundColor: COLORS.gold, marginHorizontal: 20, opacity: 0.3 },
  scroll: { flex: 1, padding: 20 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 18,
  },
  typeRow: { flexDirection: "row", gap: 10 },
  typeCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  typeCardActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  typeCardLabel: { fontSize: 15, color: COLORS.text, fontWeight: "700" },
  typeCardDesc: { fontSize: 12, color: COLORS.muted },
  catRow: { gap: 8, paddingBottom: 4 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  catEmoji: { fontSize: 13 },
  catLabel: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  catLabelActive: { color: COLORS.gold },
  photosRow: { gap: 10, paddingBottom: 4, paddingTop: 2 },
  photoWrap: { position: "relative" },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  photoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoRemoveText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  photoAdd: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoAddIcon: { fontSize: 22 },
  photoAddText: { fontSize: 11, color: COLORS.muted },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textarea: { height: 110, textAlignVertical: "top" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  priceInput: { width: 80 },
  priceCurrency: { fontSize: 18, color: COLORS.gold, fontWeight: "700" },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitChipActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldDim },
  unitLabel: { fontSize: 12, color: COLORS.muted },
  unitLabelActive: { color: COLORS.gold, fontWeight: "700" },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  submitBtn: {
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
  submitBtnDisabled: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, shadowOpacity: 0 },
  submitText: { fontSize: 16, fontWeight: "800", color: COLORS.bg, letterSpacing: 0.5 },
});
