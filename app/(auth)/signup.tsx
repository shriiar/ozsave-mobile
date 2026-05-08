// app/(auth)/signup.tsx

import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="flash" size={20} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Sign up to start tracking shared expenses</Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <GlassView glassEffectStyle="clear" colorScheme="dark" style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons name="person-outline" size={16} color="rgba(148,163,184,0.82)" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="rgba(148,163,184,0.45)"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </GlassView>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <GlassView glassEffectStyle="clear" colorScheme="dark" style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={16} color="rgba(148,163,184,0.82)" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(148,163,184,0.45)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
              />
            </GlassView>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <GlassView glassEffectStyle="clear" colorScheme="dark" style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={16} color="rgba(148,163,184,0.82)" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="rgba(148,163,184,0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                autoComplete="new-password"
              />
              <Pressable onPress={() => setShowPw(p => !p)} hitSlop={10} style={styles.eyeBtn}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(148,163,184,0.82)" />
              </Pressable>
            </GlassView>
            <Text style={styles.hint}>Must include uppercase, lowercase and a number.</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit */}
          <Pressable
            disabled={!canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonBg}
            >
              <Text style={styles.buttonText}>{busy ? "Creating…" : "Create account"}</Text>
              {!busy && <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text onPress={() => !busy && router.push("/(auth)/login")} style={[styles.link, busy && { opacity: 0.4 }]}>
              Go to Login
            </Text>
          </Text>
          <Text style={styles.subfooter}>OzSave • Email verification required</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  header: {
    marginBottom: 36,
  },
  logoMark: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: -0.8,
  },
  subheading: {
    fontSize: 15,
    color: "rgba(148,163,184,0.82)",
    marginTop: 6,
  },
  fields: {
    gap: 6,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(148,163,184,0.82)",
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 54,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "rgba(0,0,0,0.40)",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    paddingVertical: 0,
  },
  eyeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(148,163,184,0.60)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 6,
  },
  button: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4F46E5",
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  buttonBg: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(148,163,184,0.82)",
  },
  link: {
    color: "#818CF8",
    fontWeight: "600",
  },
  subfooter: {
    fontSize: 12,
    color: "rgba(148,163,184,0.40)",
  },
});
