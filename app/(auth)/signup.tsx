// app/(auth)/signup.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
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
        colors={["#EEF2FF", "#F8FAFC", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(99,102,241,0.10)", "rgba(255,255,255,0.00)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topWash}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(14,165,233,0.08)", "rgba(255,255,255,0.00)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bottomWash}
      />

      <GlassView glassEffectStyle="clear" colorScheme="light" style={styles.card}>
        {/* Glass card layers */}
        <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.78)", "rgba(255,255,255,0.54)", "rgba(255,255,255,0.30)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.34)", "rgba(255,255,255,0.00)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0.00)"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 0.9 }}
          style={styles.cardSheen}
        />
        <View pointerEvents="none" style={styles.cardRing} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Create your account</Text>
            <Text style={styles.subheading}>
              Sign up to start tracking shared expenses and household insights in OzSave.
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <GlassView glassEffectStyle="clear" colorScheme="light" style={styles.inputWrap}>
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
          </GlassView>

          {/* Email */}
          <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
          <GlassView glassEffectStyle="clear" colorScheme="light" style={styles.inputWrap}>
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
          </GlassView>

          {/* Password */}
          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <GlassView glassEffectStyle="clear" colorScheme="light" style={styles.inputWrap}>
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
          </GlassView>

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
            <LinearGradient
              colors={["#4F46E5", "#6366F1", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonBg}
            >
              <View style={styles.buttonInnerGlow} />
              <Text style={styles.buttonText}>{busy ? "Creating..." : "Create account"}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </Pressable>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text onPress={() => router.push("/(auth)/login")} style={styles.link}>
              Go to Login
            </Text>
          </Text>
        </View>
      </GlassView>

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
  topWash: {
    position: "absolute",
    top: -40,
    left: 0,
    right: 0,
    height: 280,
  },
  bottomWash: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -30,
    height: 260,
  },

  card: {
    width: "100%",
    maxWidth: 392,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    shadowColor: "rgba(15,23,42,0.10)",
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
  },
  cardRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },
  cardSheen: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    paddingTop: 24,
    paddingBottom: 10,
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: "#0F172A",
  },
  subheading: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 20,
  },

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

  form: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 20,
  },

  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 6 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 54,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    shadowColor: "rgba(15,23,42,0.10)",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
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
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  hint: { marginTop: 8, fontSize: 12, color: "#64748B" },
  errorText: { color: "#DC2626", marginTop: 10, fontSize: 13, fontWeight: "600" },

  button: {
    marginTop: 18,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "rgba(79,70,229,0.42)",
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  buttonBg: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 18,
    position: "relative",
    overflow: "hidden",
  },
  buttonInnerGlow: {
    position: "absolute",
    top: -18,
    left: -10,
    width: 180,
    height: 70,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    transform: [{ rotate: "-8deg" }],
  },
  buttonPressed: { transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },

  footerText: { marginTop: 14, fontSize: 13, color: "#64748B", textAlign: "center" },
  link: { color: "#4F46E5", fontWeight: "800" },

  subfooter: { marginTop: 8, fontSize: 12, color: "#94A3B8" },
});