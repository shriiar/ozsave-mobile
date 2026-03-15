// app/(auth)/login.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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

    const normalizedEmail = email.trim().toLowerCase(); // ✅ move here

    setBusy(true);
    setError("");

    try {
      await login(normalizedEmail, password);
      router.replace("/(user)/dashboard");
    } catch (err: any) {
      const msg = extractMsg(err);

      // ✅ if user not verified -> go verify screen with email
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
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />

        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.72)", "rgba(255,255,255,0.45)", "rgba(255,255,255,0.25)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View pointerEvents="none" style={styles.cardRing} />

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Email</Text>

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
          </View>

          {/* Password */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputWrap}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={16} color="#64748B" />
              </View>

              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoCorrect={false}
              />

              <Pressable onPress={() => setShowPw(p => !p)} hitSlop={10} style={styles.eyeBtn}>
                <Ionicons
                  name={showPw ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Submit button */}
          <Pressable
            disabled={busy}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.button,
              busy && styles.buttonDisabled,
              pressed && !busy && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>{busy ? "Signing in..." : "Login"}</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don’t have an account?{" "}
            <Text onPress={() => router.push("/(auth)/signup")} style={styles.link}>
              Sign up
            </Text>
          </Text>
        </View>
      </View>
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
  // card: {
  //   width: "100%",
  //   maxWidth: 380,
  //   borderRadius: 24,
  //   overflow: "hidden",
  //   backgroundColor: "rgba(255,255,255,0.75)",
  // },
  header: {
    flexDirection: "row",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 24,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  form: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    fontSize: 13,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 12,
    backgroundColor: "#4F46E5",
    shadowColor: "rgba(79,70,229,0.5)",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#6B7280",
  },
  link: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  subfooter: {
    marginTop: 8,
    fontSize: 12,
    color: "#9CA3AF",
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 48,

    backgroundColor: "rgba(255,255,255,0.85)",
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
    paddingVertical: 0, // prevents weird vertical drift on Android
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
});