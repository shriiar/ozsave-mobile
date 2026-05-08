// app/(auth)/login.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    if (!email.trim() || !password) {
      return Alert.alert("Required", "Email and password are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    setBusy(true);
    setError("");

    try {
      await login(normalizedEmail, password);
      router.replace("/(user)/dashboard");
    } catch (err: any) {
      const msg = extractMsg(err);

      if (isVerifyPending(err)) {
        router.replace({
          pathname: "/(auth)/verify",
          params: { email: normalizedEmail },
        });
        return;
      }

      setError(msg || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function extractMsg(err: any): string {
    const direct = err?.message;
    if (typeof direct === "string" && direct.trim()) return direct;

    const apiMsg = err?.response?.data?.message;
    if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;

    const srcMsg =
      err?.response?.data?.errorSource?.[0]?.message ??
      err?.errorSource?.[0]?.message;
    if (typeof srcMsg === "string" && srcMsg.trim()) return srcMsg;

    try {
      return JSON.stringify(err);
    } catch {
      return String(err ?? "");
    }
  }

  function isVerifyPending(err: any) {
    const msg = extractMsg(err).toLowerCase();
    return (
      msg.includes("verification is pending") ||
      msg.includes("please verify your account") ||
      msg.includes("verify your account") ||
      msg.includes("not verified") ||
      msg.includes("account verification")
    );
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
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to your account</Text>
        </View>

        {/* Fields */}
        <View style={styles.fields}>

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
                placeholder="••••••••"
                placeholderTextColor="rgba(148,163,184,0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoCorrect={false}
                textContentType="password"
                autoComplete="current-password"
              />
              <Pressable onPress={() => setShowPw(p => !p)} hitSlop={10} style={styles.eyeBtn}>
                <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(148,163,184,0.82)" />
              </Pressable>
            </GlassView>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit */}
          <Pressable
            disabled={busy}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.button,
              busy && styles.buttonDisabled,
              pressed && !busy && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
          >
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonBg}
            >
              <Text style={styles.buttonText}>{busy ? "Signing in…" : "Sign in"}</Text>
              {!busy && <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text onPress={() => !busy && router.push("/(auth)/signup")} style={[styles.link, busy && { opacity: 0.4 }]}>
              Sign up
            </Text>
          </Text>
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
  },
  footerText: {
    fontSize: 14,
    color: "rgba(148,163,184,0.82)",
  },
  link: {
    color: "#818CF8",
    fontWeight: "600",
  },
});
