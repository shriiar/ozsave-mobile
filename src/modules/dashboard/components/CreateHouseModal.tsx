// src/modules/dashboard/CreateHouseModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { useMutation } from "@tanstack/react-query";

import { HouseApi } from "../../house/api";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { useGlassStyle } from "../../../context/GlassStyleContext";
import { typography } from "../../../theme/typography";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateHouseModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { refreshUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const { glassStyle } = useGlassStyle();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    const modalBgGrad = isDark
      ? ["rgba(5,5,5,0.58)", "rgba(18,18,18,0.46)", "rgba(5,5,5,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const headerBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.95)" : "#475569";

    const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.70)";
    const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const placeholder = isDark ? "rgba(148,163,184,0.75)" : "rgba(100,116,139,0.85)";

    const ghostBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const ghostBgHover = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

    const footerBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

    const shadow = isDark
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.6,
          shadowRadius: 36,
          shadowOffset: { width: 0, height: 18 },
          elevation: 16,
        }
      : {
          shadowColor: "#000",
          shadowOpacity: 0.14,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 14 },
          elevation: 12,
        };

    const glowA = isDark
      ? ["rgba(79,70,229,0.20)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"]
      : ["rgba(79,70,229,0.22)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"];

    return {
      isDark,
      modalBgGrad,
      border,
      headerBorder,
      text,
      muted,
      inputBg,
      inputBorder,
      placeholder,
      ghostBg,
      ghostBgHover,
      footerBg,
      shadow,
      glowA,
    };
  }, [isDark]);

  const createHouse = useMutation({
    mutationFn: async (payload: { name: string }) => HouseApi.create(payload.name),
    onSuccess: async () => {
      await refreshUser();
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || err?.message || "Something went wrong.");
    },
  });

  const busy = createHouse.isPending;

  useEffect(() => {
    if (!open) return;
    setName("");
    setError("");
  }, [open]);

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const handleCreate = () => {
    if (!name.trim() || busy) return;
    createHouse.mutate({ name: name.trim() });
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
            <View style={[styles.modal, { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" }]}>
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: T.headerBorder }]}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.title, { color: T.text }]}>Create a house</Text>
                  <Text style={[styles.subtitle, { color: T.muted }]}>
                    Give your house a name. You’ll become the admin.
                  </Text>
                </View>

                <Pressable
                  onPress={handleClose}
                  disabled={busy}
                  style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, busy && { opacity: 0.5 }]}
                  hitSlop={10}
                >
                  <GlassView
                    glassEffectStyle={glassStyle}
                    isInteractive={!busy}
                    colorScheme={isDark ? "dark" : "light"}
                    style={styles.iconBtn}
                  >
                    <Text style={[styles.iconBtnText, { color: T.text }]}>✕</Text>
                  </GlassView>
                </Pressable>
              </View>

              {/* Body */}
              <View style={styles.body}>
                <Text style={[styles.label, { color: T.text }]}>House name</Text>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Eg. Tarneit House"
                  placeholderTextColor={T.placeholder}
                  editable={!busy}
                  autoFocus
                  style={[
                    styles.input,
                    {
                      backgroundColor: T.inputBg,
                      borderColor: T.inputBorder,
                      color: T.text,
                    },
                  ]}
                />

                <Text style={[styles.help, { color: T.muted }]}>
                  Keep it short. You can rename later.
                </Text>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorTitle}>Can’t create house</Text>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
              </View>

              {/* Footer */}
              <View style={[styles.footer, { borderTopColor: T.headerBorder, backgroundColor: T.footerBg }]}>
                <View style={styles.footerRow}>
                  <Pressable
                    onPress={handleClose}
                    disabled={busy}
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, busy && { opacity: 0.5 }]}
                  >
                    <GlassView
                      glassEffectStyle={glassStyle}
                      isInteractive={!busy}
                      tintColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.045)"}
                      colorScheme={isDark ? "dark" : "light"}
                      style={styles.btnGhost}
                    >
                      <Text style={[styles.btnGhostText, { color: T.text }]}>Cancel</Text>
                    </GlassView>
                  </Pressable>

                  <Pressable
                    onPress={handleCreate}
                    disabled={!name.trim() || busy}
                    style={({ pressed }) => [
                      pressed && { transform: [{ translateY: 1 }] },
                      (!name.trim() || busy) && { opacity: 0.55 },
                    ]}
                  >
                    <GlassView
                      glassEffectStyle={glassStyle}
                      isInteractive={!!name.trim() && !busy}
                      tintColor="#4F46E5"
                      colorScheme={isDark ? "dark" : "light"}
                      style={styles.btnPrimary}
                    >
                      {busy ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={styles.btnPrimaryText}>Creating...</Text>
                        </View>
                      ) : (
                        <Text style={styles.btnPrimaryText}>Create</Text>
                      )}
                    </GlassView>
                  </Pressable>
                </View>
              </View>
            </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },

  header: {
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    // borderBottomWidth: StyleSheet.hairlineWidth,
  },

  title: {
    ...typography.headline,
    letterSpacing: -0.1,
  },

  subtitle: {
    ...typography.footnote,
    marginTop: 4,
  },

  iconBtn: {
    height: 36,
    width: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  iconBtnText: { ...typography.bodyEmphasized },

  body: {
    padding: 18,
    gap: 10,
  },

  label: { ...typography.footnoteEmphasized },

  input: {
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    // borderWidth: StyleSheet.hairlineWidth,
    ...typography.footnote,
  },

  help: { ...typography.caption1 },

  errorBox: {
    marginTop: 6,
    borderRadius: 18,
    // borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(239,68,68,0.20)",
    backgroundColor: "rgba(239,68,68,0.10)",
    padding: 12,
    gap: 4,
  },

  errorTitle: {
    ...typography.footnoteEmphasized,
    color: "#B91C1C",
  },

  errorText: {
    ...typography.caption1,
    color: "rgba(185,28,28,0.92)",
  },

  footer: {
    padding: 14,
    // borderTopWidth: StyleSheet.hairlineWidth,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  btnGhost: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  btnGhostText: { ...typography.footnoteEmphasized },

  btnPrimary: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  btnPrimaryText: {
    ...typography.footnoteEmphasized,
    color: "#fff",
  },
});