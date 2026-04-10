import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { VerificationApi } from "../../src/modules/verify/api";
import { useAuth } from "../../src/context/AuthContext";
import { clearVerifyCooldown, getVerifyCooldown, setVerifyCooldown } from "../../src/lib/storage";

const COOLDOWN_MS = 5 * 60 * 1000;

function cleanCode(v: string) {
  return v.replace(/\D/g, "").slice(0, 6);
}

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Verify() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const emailStr = String(email ?? "").trim().toLowerCase();

  const { loginWithToken } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // restore cooldown
  useEffect(() => {
    (async () => {
      if (!emailStr) return;
      const end = await getVerifyCooldown(emailStr);
      const left = end - Date.now();
      if (left <= 0) {
        await clearVerifyCooldown(emailStr);
        setRemainingMs(0);
      } else {
        setRemainingMs(left);
      }
    })();
  }, [emailStr]);

  // countdown
  useEffect(() => {
    if (remainingMs <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - 1000;
        return next <= 0 ? 0 : next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [remainingMs]);

  const resendDisabled = useMemo(() => {
    return !emailStr || loadingResend || remainingMs > 0;
  }, [emailStr, loadingResend, remainingMs]);

  async function handleVerify() {
    setError("");
    setSuccess("");

    const c = cleanCode(code);
    if (c.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (!emailStr) {
      setError("Email missing in link.");
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await VerificationApi.verify({ email: emailStr, code: c });
      const token = res.data?.accessToken;
      if (!token) throw new Error("No token returned");
      if (!token) throw new Error("No token returned");

      await loginWithToken(token);

      setSuccess("Verified. Redirecting...");
      router.replace("/(user)/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Verification failed");
      Alert.alert("Verification failed", e?.message ?? "Try again.");
    } finally {
      setLoadingVerify(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");

    if (!emailStr) {
      setError("Email missing in link.");
      return;
    }
    if (remainingMs > 0) return;

    setLoadingResend(true);
    try {
      await VerificationApi.resend({ email: emailStr });
      const end = Date.now() + COOLDOWN_MS;
      await setVerifyCooldown(emailStr, end);
      setRemainingMs(end - Date.now());
      setSuccess("Verification code resent.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to resend code");
    } finally {
      setLoadingResend(false);
    }
  }

  return (
    <View style={s.container}>
      {/* Background washes */}
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
        style={s.topWash}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(14,165,233,0.08)", "rgba(255,255,255,0.00)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.bottomWash}
      />

      <GlassView glassEffectStyle="clear" colorScheme="light" style={s.card}>
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
          style={s.cardSheen}
        />
        <View pointerEvents="none" style={s.cardRing} />

        <View style={s.header}>
          <View style={s.chip}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#4F46E5" />
            <Text style={s.chipText}>Verify account</Text>
          </View>

          <Text style={s.title}>Enter your code</Text>
          <Text style={s.subtitle}>
            We sent a 6-digit code to your email so you can finish creating your account.
          </Text>

          <View style={s.emailRow}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={s.emailText} numberOfLines={1}>{emailStr || "Unknown email"}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text style={s.label}>Verification code</Text>

          <GlassView glassEffectStyle="clear" colorScheme="light" style={s.otpWrap}>
            <TextInput
              value={code}
              onChangeText={(v) => setCode(cleanCode(v))}
              keyboardType="number-pad"
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              style={s.otp}
              maxLength={6}
            />
          </GlassView>

          <Text style={s.tip}>Tip: check spam/junk if you don’t see it.</Text>

          {error ? <Text style={s.error}>{error}</Text> : null}
          {success ? <Text style={s.success}>{success}</Text> : null}

          <Pressable
            disabled={loadingVerify}
            onPress={handleVerify}
            style={({ pressed }) => [
              s.btnPrimary,
              loadingVerify && { opacity: 0.6 },
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <LinearGradient
              colors={["#4F46E5", "#6366F1", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.btnPrimaryBg}
            >
              <View style={s.btnPrimaryGlow} />
              <Text style={s.btnPrimaryText}>{loadingVerify ? "Verifying..." : "Verify account"}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </Pressable>

          <Pressable
            disabled={resendDisabled}
            onPress={handleResend}
            style={({ pressed }) => [
              s.btnGhost,
              resendDisabled && { opacity: 0.6 },
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <Ionicons name="refresh-outline" size={16} color="#475569" />
            <Text style={s.btnGhostText}>
              {remainingMs > 0
                ? `Resend available in ${formatTime(remainingMs)}`
                : loadingResend
                  ? "Resending..."
                  : "Resend verification code"}
            </Text>
          </Pressable>
        </View>
      </GlassView>
    </View>
  );
}

const s = StyleSheet.create({
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
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  title: {
    marginTop: 14,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
  emailRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  emailText: {
    flex: 1,
    color: "#475569",
    fontSize: 13,
  },
  body: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  otpWrap: {
    marginTop: 10,
    borderRadius: 18,
    height: 56,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    shadowColor: "rgba(15,23,42,0.10)",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    justifyContent: "center",
  },
  otp: {
    paddingHorizontal: 16,
    fontSize: 20,
    letterSpacing: 8,
    color: "#111827",
    textAlign: "center",
  },
  tip: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
  },
  error: {
    marginTop: 10,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },
  success: {
    marginTop: 10,
    color: "#059669",
    fontSize: 13,
    fontWeight: "600",
  },
  btnPrimary: {
    marginTop: 18,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "rgba(79,70,229,0.42)",
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  btnPrimaryBg: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 18,
    position: "relative",
    overflow: "hidden",
  },
  btnPrimaryGlow: {
    position: "absolute",
    top: -18,
    left: -10,
    width: 180,
    height: 70,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    transform: [{ rotate: "-8deg" }],
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  btnGhost: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnGhostText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 13,
  },
});