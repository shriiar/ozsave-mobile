import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Platform } from "react-native";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../../../context/ThemeContext";
import { BlurView } from "expo-blur";

export type RangeKey = "7d" | "14d" | "30d";

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "14d", label: "Last 14 days", days: 14 },
  { key: "30d", label: "Last 30 days", days: 30 },
];

function RangePickerModal(props: {
  open: boolean;
  onClose: () => void;
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";

    const sheetGrad = isDark
      ? ["rgba(2,6,23,0.65)", "rgba(15,23,42,0.45)", "rgba(2,6,23,0.35)"]
      : ["rgba(255,255,255,0.85)", "rgba(255,255,255,0.70)", "rgba(255,255,255,0.62)"];

    return { border, text, muted, sheetGrad };
  }, [isDark]);

  const [draft, setDraft] = useState<RangeKey>(props.value);

  // keep draft synced when opened
  React.useEffect(() => {
    if (props.open) setDraft(props.value);
  }, [props.open, props.value]);

  return (
    <Modal visible={props.open} transparent animationType="fade" onRequestClose={props.onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={props.onClose}>
          <View style={{ flex: 1, backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)" }} />
        </Pressable>

        <View style={styles.modalOverlay}>
          <GlassView
            glassEffectStyle="regular"
            colorScheme={isDark ? "dark" : "light"}
            style={[styles.sheet, { borderColor: T.border }]}
          >
            <LinearGradient
              colors={T.sheetGrad as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={[styles.sheetHeader, { borderBottomColor: T.border }]}>
              <Text style={{ color: T.text, fontSize: 15, fontWeight: "700" }}>Range</Text>
              <Text style={{ color: T.muted, marginTop: 2, fontSize: 12 }}>Choose a period</Text>
            </View>

            {Platform.OS === "ios" ? (
              <>
                <View style={{ paddingHorizontal: 8, paddingVertical: 10 }}>
                  <Picker
                    selectedValue={draft}
                    onValueChange={(v) => setDraft(String(v) as RangeKey)}
                    itemStyle={{ color: T.text, fontSize: 16 }}
                  >
                    {RANGE_OPTIONS.map((o) => (
                      <Picker.Item key={o.key} label={o.label} value={o.key} />
                    ))}
                  </Picker>
                </View>

                <View style={[styles.sheetFooter, { borderTopColor: T.border }]}>
                  <Pressable
                    onPress={() => {
                      props.onChange(draft);
                      props.onClose();
                    }}
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Text style={{ color: T.text, fontSize: 14, fontWeight: "700" }}>Done</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <ScrollView contentContainerStyle={{ padding: 12 }}>
                  {RANGE_OPTIONS.map((o) => {
                    const active = o.key === props.value;
                    return (
                      <Pressable
                        key={o.key}
                        onPress={() => {
                          props.onChange(o.key);
                          props.onClose();
                        }}
                        style={({ pressed }) => [
                          styles.optionRow,
                          {
                            opacity: pressed ? 0.9 : 1,
                            borderColor: active ? "rgba(79,70,229,0.35)" : T.border,
                            backgroundColor: active ? "rgba(79,70,229,0.10)" : "transparent",
                          },
                        ]}
                      >
                        <Text style={{ color: T.text, fontSize: 14, fontWeight: active ? "700" : "600" }}>
                          {o.label}
                        </Text>
                        {active ? <Ionicons name="checkmark" size={18} color="#4F46E5" /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={[styles.sheetFooter, { borderTopColor: T.border }]}>
                  <Pressable onPress={props.onClose} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
                    <Text style={{ color: T.text, fontSize: 14, fontWeight: "700" }}>Done</Text>
                  </Pressable>
                </View>
              </>
            )}
          </GlassView>
        </View>
      </View>
    </Modal>
  );
}

function HeaderGlassButton(props: {
  children: React.ReactNode;
  isDark: boolean;
  style: any;
  borderColor: string;
  fallbackBg: string;
}) {
  if (Platform.OS === "ios") {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={props.isDark ? "dark" : "light"}
        style={[props.style, { borderColor: props.borderColor }]}
      >
        {props.children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        props.style,
        {
          borderColor: props.borderColor,
          backgroundColor: props.fallbackBg,
        },
      ]}
    >
      {props.children}
    </View>
  );
}

export function DashboardHeader(props: {
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  title: string;
  subtitle: string;
  canGoForward: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [rangeOpen, setRangeOpen] = useState(false);

  const T = useMemo(() => {
    const cardGrad = isDark
      ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
      : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

    const glow = isDark
      ? ["rgba(79,70,229,0.22)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"]
      : ["rgba(79,70,229,0.22)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"];

    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const headerBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";
    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";
    const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.70)";

    const shadow = isDark
      ? { shadowColor: "#000", shadowOpacity: 0.55, shadowRadius: 30, shadowOffset: { width: 0, height: 16 }, elevation: 14 }
      : { shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 10 };

    return { cardGrad, glow, border, headerBorder, text, muted, inputBg, shadow };
  }, [isDark]);

  const rangeLabel = useMemo(
    () => RANGE_OPTIONS.find((r) => r.key === props.range)?.label ?? props.range,
    [props.range]
  );

  return (
    <>
      <View style={styles.wrap}>
        <BlurView
          intensity={isDark ? 28 : 45}
          tint={isDark ? "dark" : "light"}
          style={[styles.card, { borderColor: T.border }, T.shadow]}
        >
          <LinearGradient
            colors={T.cardGrad as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={T.glow as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.glow, { top: -90, left: -90 }]}
          />

          <View style={[styles.headerRow, { borderBottomColor: T.headerBorder }]}>
            {/* LEFT: fixed flex area */}
            <View style={styles.leftCol}>
              <View style={styles.titleRow}>
                <Text numberOfLines={1} style={[styles.title, { color: T.text }]}>
                  {props.title}
                </Text>

                <Pressable
                  onPress={() => setRangeOpen(true)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <HeaderGlassButton
                    isDark={isDark}
                    style={styles.rangeBtn}
                    borderColor={T.border}
                    fallbackBg={T.inputBg}
                  >
                    <Text numberOfLines={1} style={{ color: T.text, fontSize: 12, fontWeight: "800" }}>
                      {rangeLabel}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={T.muted} />
                  </HeaderGlassButton>
                </Pressable>
              </View>

              {!!props.subtitle ? (
                <Text numberOfLines={1} style={[styles.subtitle, { color: T.muted }]}>
                  {props.subtitle}
                </Text>
              ) : null}
            </View>

            {/* RIGHT: fixed width so it never moves */}
            <View style={styles.rightCol}>
              <Pressable
                onPress={props.onPrev}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              >
                <HeaderGlassButton
                  isDark={isDark}
                  style={styles.iconBtn}
                  borderColor={T.border}
                  fallbackBg={T.inputBg}
                >
                  <Ionicons name="chevron-back" size={16} color={T.text} />
                </HeaderGlassButton>
              </Pressable>

              <Pressable
                onPress={props.onNext}
                disabled={!props.canGoForward}
                style={({ pressed }) => [{ opacity: !props.canGoForward ? 0.4 : pressed ? 0.9 : 1 }]}
              >
                <HeaderGlassButton
                  isDark={isDark}
                  style={styles.iconBtn}
                  borderColor={T.border}
                  fallbackBg={T.inputBg}
                >
                  <Ionicons name="chevron-forward" size={16} color={T.text} />
                </HeaderGlassButton>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>

      <RangePickerModal
        open={rangeOpen}
        onClose={() => setRangeOpen(false)}
        value={props.range}
        onChange={props.onRangeChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },

  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },

  glassBtnFill: {
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    height: 260,
    width: 260,
    borderRadius: 260,
  },

  headerRow: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  subtitle: { marginTop: 6, fontSize: 12, fontWeight: "500" },

  rangeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },

  iconBtn: {
    height: 38,
    width: 38,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: Platform.OS === "ios" ? "55%" : "70%",
  },

  sheetHeader: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetFooter: { padding: 12, borderTopWidth: StyleSheet.hairlineWidth, alignItems: "flex-end" },

  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // add to StyleSheet.create(...)
  leftCol: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  rightCol: { flexDirection: "row", gap: 10, width: 38 + 10 + 38, justifyContent: "flex-end" },
  title: { fontSize: 16, fontWeight: "800", flexShrink: 1, minWidth: 0 },
});