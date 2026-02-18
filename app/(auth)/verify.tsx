import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
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
      <View style={s.card}>
        <View style={s.header}>
          <View style={s.chip}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#4F46E5" />
            <Text style={s.chipText}>Verify account</Text>
          </View>

          <Text style={s.title}>Enter your code</Text>
          <Text style={s.subtitle}>We sent a 6-digit code to your email.</Text>

          <View style={s.emailRow}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={s.emailText} numberOfLines={1}>{emailStr || "Unknown email"}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text style={s.label}>Verification code</Text>

          <TextInput
            value={code}
            onChangeText={(v) => setCode(cleanCode(v))}
            keyboardType="number-pad"
            placeholder="123456"
            placeholderTextColor="#9CA3AF"
            style={s.otp}
            maxLength={6}
          />

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
            <Text style={s.btnPrimaryText}>{loadingVerify ? "Verifying..." : "Verify account"}</Text>
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
            <Ionicons name="refresh-outline" size={16} color="#374151" />
            <Text style={s.btnGhostText}>
              {remainingMs > 0
                ? `Resend available in ${formatTime(remainingMs)}`
                : loadingResend
                  ? "Resending..."
                  : "Resend verification code"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  card: { width: "100%", maxWidth: 380, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.85)", overflow: "hidden" },
  header: { padding: 24, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB" },
  chip: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.04)", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#111827" },
  title: { marginTop: 14, fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },
  emailRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  emailText: { flex: 1, color: "#374151", fontSize: 13 },
  body: { padding: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  otp: { marginTop: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, letterSpacing: 8, color: "#111827", backgroundColor: "rgba(255,255,255,0.6)" },
  tip: { marginTop: 10, fontSize: 12, color: "#6B7280" },
  error: { marginTop: 10, color: "#DC2626", fontSize: 13 },
  success: { marginTop: 10, color: "#059669", fontSize: 13 },
  btnPrimary: { marginTop: 16, borderRadius: 18, paddingVertical: 12, backgroundColor: "#4F46E5", alignItems: "center" },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  btnGhost: { marginTop: 12, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", backgroundColor: "rgba(255,255,255,0.65)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnGhostText: { color: "#374151", fontWeight: "700", fontSize: 13 },
});