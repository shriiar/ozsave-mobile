import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { setVerifyCooldown } from "../../src/lib/storage";

const COOLDOWN_MS = 5 * 60 * 1000;

function meetsPasswordRules(pw: string) {
  return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);
}

export default function Signup() {
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const normalizedEmail = email.trim().toLowerCase();

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      normalizedEmail.length > 0 &&
      password.length >= 6 &&
      !busy
    );
  }, [name, normalizedEmail, password, busy]);

  async function onSubmit() {
    if (!canSubmit) return;

    if (!meetsPasswordRules(password)) {
      setError("Password must include uppercase, lowercase, and a number.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await signup(name.trim(), normalizedEmail, password);
    
      // ✅ don't let cooldown write block routing
      setVerifyCooldown(normalizedEmail, Date.now() + COOLDOWN_MS).catch(() => {});
    
      router.replace({
        pathname: "/(auth)/verify",
        params: { email: normalizedEmail },
      });
    } catch (e: any) {
      setError(e?.message ?? "Signup failed");
      Alert.alert("Signup failed", e?.message ?? "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(99,102,241,0.25)", "transparent"]}
        style={[styles.glow, { top: -100, left: -100, width: 400, height: 400 }]}
      />
      <LinearGradient
        colors={["rgba(16,185,129,0.15)", "transparent"]}
        style={[styles.glow, { bottom: -120, right: -120, width: 440, height: 440 }]}
      />

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Sign up to start tracking shared expenses in OzSave.</Text>
        </View>

        <View style={styles.form}>
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <BlurView intensity={25} tint="light" style={styles.inputRow}>
            <Ionicons name="person-outline" size={16} color="#667085" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </BlurView>

          {/* Email */}
          <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
          <BlurView intensity={25} tint="light" style={styles.inputRow}>
            <Ionicons name="mail-outline" size={16} color="#667085" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </BlurView>

          {/* Password */}
          <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
          <BlurView intensity={25} tint="light" style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={16} color="#667085" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPw((p) => !p)} style={{ padding: 6 }}>
              <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={16} color="#6B7280" />
            </Pressable>
          </BlurView>

          <Text style={styles.hint}>
            Must include uppercase, lowercase and a number.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            disabled={!canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>{busy ? "Creating..." : "Create account"}</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text onPress={() => router.push("/(auth)/login")} style={styles.link}>
              Go to Login
            </Text>
          </Text>
        </View>
      </View>

      <Text style={styles.subfooter}>OzSave • Email verification required</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  glow: { position: "absolute", borderRadius: 230, transform: [{ rotate: "45deg" }] },
  card: { width: "100%", maxWidth: 380, borderRadius: 24, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.75)" },
  header: { paddingTop: 20, paddingBottom: 12, paddingHorizontal: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB" },
  heading: { fontSize: 20, fontWeight: "600", color: "#1F2937" },
  subheading: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  form: { paddingHorizontal: 24, paddingVertical: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", backgroundColor: "rgba(255,255,255,0.55)" },
  input: { flex: 1, fontSize: 14, color: "#1F2937" },
  hint: { marginTop: 8, fontSize: 12, color: "#6B7280" },
  errorText: { color: "#DC2626", marginTop: 8, fontSize: 13 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16, borderRadius: 20, paddingVertical: 12, backgroundColor: "#4F46E5", shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  buttonPressed: { transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  footerText: { marginTop: 14, fontSize: 13, color: "#6B7280", textAlign: "center" },
  link: { color: "#4F46E5", fontWeight: "600" },
  subfooter: { marginTop: 8, fontSize: 12, color: "#9CA3AF" },
});