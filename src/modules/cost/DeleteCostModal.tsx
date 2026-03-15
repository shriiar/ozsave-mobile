import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/ThemeContext";
import { useDeleteCost } from "./hooks/useCostApi";

type Props = {
  open: boolean;
  costId: string | null;
  costName: string;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function DeleteCostModal({ open, costId, costName, onClose, onDeleted }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const del = useDeleteCost();
  const busy = del.isPending;

  const [localError, setLocalError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(costName);

  React.useEffect(() => {
    if (open) {
      setDisplayName(costName);
    }
  }, [open, costName]);

  const T = useMemo(() => {
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const headerBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";
    const danger = isDark ? "#FCA5A5" : "#B91C1C";

    const shadow = isDark
      ? { shadowColor: "#000", shadowOpacity: 0.6, shadowRadius: 36, shadowOffset: { width: 0, height: 18 }, elevation: 16 }
      : { shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 12 };

    return { border, headerBorder, text, muted, danger, shadow };
  }, [isDark]);

  function closeIfAllowed() {
    if (!busy) onClose();
  }

  function handleDelete() {
    if (!costId || busy) return;

    setLocalError(null);

    del.mutate(costId, {
      onSuccess: () => {
        onDeleted?.();
        onClose();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete cost";
        setLocalError(msg);
      },
    });
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={closeIfAllowed}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeIfAllowed}>
          <View style={{ flex: 1, backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)" }} />
        </Pressable>

        <View style={styles.center}>
          <View style={styles.modalWrap}>
            <GlassView
              glassEffectStyle="regular"
              colorScheme={isDark ? "dark" : "light"}
              style={[styles.modal, { borderColor: T.border }, T.shadow]}
            >

              {/* Header */}
              <View style={[styles.header, { borderBottomColor: T.headerBorder }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <View style={[styles.iconPill, { borderColor: T.border, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]}>
                    <Ionicons name="trash-outline" size={18} color={T.text} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.h1, { color: T.text }]}>Delete cost</Text>
                    <Text style={[styles.h2, { color: T.muted }]}>
                      This will permanently remove the cost and recalculate balances.
                    </Text>
                  </View>
                </View>


              </View>

              {/* Body */}
              <View style={styles.body}>
                <Text style={[styles.bodyText, { color: T.text }]}>
                  Are you sure you want to delete{" "}
                  <Text style={{ fontWeight: "800" }}>{displayName || "this cost"}</Text>?
                </Text>
                <Text style={[styles.bodySub, { color: T.muted }]}>You can’t undo this.</Text>

                {localError ? (
                  <View style={[styles.errorBox, { borderColor: "rgba(239,68,68,0.30)", backgroundColor: "rgba(239,68,68,0.10)" }]}>
                    <Text style={{ color: T.danger, fontWeight: "800" }}>Delete failed</Text>
                    <Text style={{ color: T.danger, marginTop: 4 }}>{localError}</Text>
                  </View>
                ) : null}
              </View>

              {/* Footer */}
              <View style={[styles.footer, { borderTopColor: T.headerBorder }]}>
                <Pressable
                  onPress={closeIfAllowed}
                  disabled={busy}
                  style={({ pressed }) => [
                    styles.footerBtn,
                    {
                      borderColor: T.border,
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: T.text, fontWeight: "800" }}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleDelete}
                  disabled={!costId || busy}
                  style={({ pressed }) => [
                    styles.footerBtnPrimary,
                    { backgroundColor: "rgba(239,68,68,0.95)", opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "900" }}>Delete</Text>
                  )}
                </Pressable>
              </View>
            </GlassView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 12 },

  modalWrap: { width: "100%", maxWidth: 420 },
  modal: {
    borderRadius: 24,
    // borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },

  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  iconPill: {
    height: 36,
    width: 36,
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    height: 36,
    width: 36,
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  h1: { fontSize: 16, fontWeight: "800" },
  h2: { marginTop: 2, fontSize: 12, fontWeight: "500", lineHeight: 16 },

  body: { padding: 16 },
  bodyText: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  bodySub: { marginTop: 6, fontSize: 12, fontWeight: "600" },

  errorBox: { marginTop: 12, borderRadius: 16, 
    // borderWidth: StyleSheet.hairlineWidth, 
    padding: 12 },

  footer: {
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnPrimary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});