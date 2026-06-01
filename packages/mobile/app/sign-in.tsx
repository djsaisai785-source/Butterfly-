import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { signIn } from "../lib/auth";

const C = {
  bg: "#0A0A0F",
  surface: "#13131A",
  border: "#1E1E2E",
  gold: "#D4AF37",
  text: "#FFFFFF",
  muted: "#6B6B7E",
};

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        Alert.alert("Connexion échouée", res.error.message ?? "Email ou mot de passe incorrect.");
      } else {
        router.replace("/");
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <Text style={styles.logo}>AURA</Text>
        <Text style={styles.tagline}>Le réseau des nuits d'exception</Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            placeholderTextColor={C.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={C.muted}
            secureTextEntry
            autoComplete="current-password"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <Text style={styles.btnText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text style={styles.footerLink}>Créer un compte</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.replace("/")} style={{ marginTop: 16 }}>
          <Text style={[styles.muted, { textAlign: "center" }]}>Continuer sans compte</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: C.gold,
    letterSpacing: 8,
    textAlign: "center",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    marginBottom: 48,
    letterSpacing: 1,
  },
  form: { gap: 4 },
  label: {
    color: C.muted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.text,
    fontSize: 15,
  },
  btn: {
    backgroundColor: C.gold,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: C.bg, fontWeight: "700", fontSize: 15, letterSpacing: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: { color: C.muted, fontSize: 14 },
  footerLink: { color: C.gold, fontSize: 14, fontWeight: "600" },
  muted: { color: C.muted, fontSize: 13 },
});
