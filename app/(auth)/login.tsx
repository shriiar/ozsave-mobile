// app/(auth)/login.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
        <BlurView intensity={34} tint="light" style={StyleSheet.absoluteFill} />

        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(255,255,255,0.78)",
            "rgba(255,255,255,0.54)",
            "rgba(255,255,255,0.30)",
          ]}
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

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.formIntro}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>
              Sign in to continue managing your shared costs and household insights.
            </Text>
          </View>
          {/* Email */}
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Email</Text>

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
          </View>

          {/* Password */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Password</Text>

            <GlassView glassEffectStyle="clear" colorScheme="light" style={styles.inputWrap}>
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
            </GlassView>
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
            <LinearGradient
              colors={["#4F46E5", "#6366F1", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonBg}
            >
              <View style={styles.buttonInnerGlow} />
              <Text style={styles.buttonText}>{busy ? "Signing in..." : "Login"}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
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
      </GlassView>
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
  formIntro: {
    marginBottom: 18,
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
    paddingTop: 26,
    paddingBottom: 20,
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
    paddingVertical: 0, // prevents weird vertical drift on Android
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
});