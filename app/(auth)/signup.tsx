// app/(auth)/signup.tsx
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
    return name.trim().length > 0 && normalizedEmail.length > 0 && password.length >= 6 && !busy;
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

      setVerifyCooldown(normalizedEmail, Date.now() + COOLDOWN_MS).catch(() => {});

      router.replace({
        pathname: "/(auth)/verify",
        params: { email: normalizedEmail },
      });
    } catch (e: any) {
      const msg = e?.message ?? "Signup failed";
      setError(msg);
      Alert.alert("Signup failed", msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Background glows */}
      <LinearGradient
        colors={["rgba(99,102,241,0.25)", "transparent"]}
        style={[styles.glow, { top: -100, left: -100, width: 400, height: 400 }]}
      />
      <LinearGradient
        colors={["rgba(16,185,129,0.15)", "transparent"]}
        style={[styles.glow, { bottom: -120, right: -120, width: 440, height: 440 }]}
      />

      <View style={styles.card}>
        {/* Glass card layers */}
        <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.78)", "rgba(255,255,255,0.52)", "rgba(255,255,255,0.28)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.cardRing} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Create your account</Text>
            <Text style={styles.subheading}>Sign up to start tracking shared expenses in OzSave.</Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrap}>
            <View style={styles.inputIcon}>
              <Ionicons name="person-outline" size={16} color="#64748B" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email */}
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <View style={styles.inputWrap}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail-outline" size={16} color="#64748B" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <View style={styles.inputWrap}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed-outline" size={16} color="#64748B" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setShowPw(p => !p)} hitSlop={10} style={styles.eyeBtn}>
              <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
            </Pressable>
          </View>

          <Text style={styles.hint}>Must include uppercase, lowercase and a number.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            disabled={!canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  glow: {
    position: "absolute",
    borderRadius: 230,
    transform: [{ rotate: "45deg" }],
  },

  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    overflow: "hidden",
  },
  cardRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(15,23,42,0.10)",
  },
  heading: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  subheading: { fontSize: 13, color: "#475569", marginTop: 4 },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(99,102,241,0.14)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 14, fontWeight: "800", color: "#0F172A" },

  form: { paddingHorizontal: 24, paddingVertical: 18 },

  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 6 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 48,

    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",

    shadowColor: "rgba(15,23,42,0.10)",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99,102,241,0.10)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.18)",
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 0,
  },

  eyeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2,6,23,0.04)",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
  },

  hint: { marginTop: 8, fontSize: 12, color: "#64748B" },
  errorText: { color: "#DC2626", marginTop: 10, fontSize: 13, fontWeight: "600" },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 18,
    paddingVertical: 12,
    backgroundColor: "#4F46E5",
    shadowColor: "rgba(79,70,229,0.45)",
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
  },
  buttonPressed: { transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },

  footerText: { marginTop: 14, fontSize: 13, color: "#64748B", textAlign: "center" },
  link: { color: "#4F46E5", fontWeight: "800" },

  subfooter: { marginTop: 8, fontSize: 12, color: "#94A3B8" },
});