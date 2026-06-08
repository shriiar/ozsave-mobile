import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../../context/ThemeContext";

export type RangeKey = "7d" | "14d" | "30d";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "14d", label: "Last 14 days" },
  { key: "30d", label: "Last 30 days" },
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
    const doneBg = isDark ? "#2a2a2a" : "#e2e4e8";
    const doneText = isDark ? "rgba(255,255,255,0.88)" : "#1a1a1a";
    return { border, text, muted, doneBg, doneText };
  }, [isDark]);

  const [draft, setDraft] = useState<RangeKey>(props.value);

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
              </>
            ) : (
              <ScrollView contentContainerStyle={{ padding: 12 }}>
                {RANGE_OPTIONS.map((o) => {
                  const active = o.key === props.value;
                  return (
                    <Pressable
                      key={o.key}
                      onPress={() => { props.onChange(o.key); props.onClose(); }}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          opacity: pressed ? 0.9 : 1,
                          borderColor: T.border,
                          backgroundColor: active ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)") : "transparent",
                        },
                      ]}
                    >
                      <Text style={{ color: T.text, fontSize: 14, fontWeight: active ? "700" : "600" }}>
                        {o.label}
                      </Text>
                      {active ? <Ionicons name="checkmark" size={18} color={T.text} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {/* Full-width done button */}
            <View style={[styles.sheetFooter, { borderTopColor: T.border }]}>
              <Pressable
                onPress={() => {
                  if (Platform.OS === "ios") props.onChange(draft);
                  props.onClose();
                }}
                style={({ pressed }) => [styles.doneBtn, { backgroundColor: T.doneBg, opacity: pressed ? 0.88 : 1 }]}
              >
                <Text style={[styles.doneBtnText, { color: T.doneText }]}>Done</Text>
              </Pressable>
            </View>
          </GlassView>
        </View>
      </View>
    </Modal>
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
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();
  const [rangeOpen, setRangeOpen] = useState(false);

  const textPrimary = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
  const textMuted = isDark ? "rgba(148,163,184,0.95)" : "#64748B";
  const btnBorder = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";

  return (
    <>
      <GlassView
        glassEffectStyle="regular"
        colorScheme={isDark ? "dark" : "light"}
        onLayout={props.onLayout}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={[styles.headerRow, { marginBottom: 10 }]}>
          <Pressable style={{ flex: 1 }} onPress={() => setRangeOpen(true)}>
            <Text style={[styles.h1, { color: textPrimary }]}>{props.title}</Text>
            {!!props.subtitle && (
              <Text style={[styles.h2, { color: textMuted }]}>{props.subtitle}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={props.onPrev}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <GlassView
              glassEffectStyle="clear"
              colorScheme={isDark ? "dark" : "light"}
              style={[styles.iconBtn, { borderColor: btnBorder }]}
            >
              <Ionicons name="chevron-back" size={16} color={textPrimary} />
            </GlassView>
          </Pressable>

          <Pressable
            onPress={props.onNext}
            disabled={!props.canGoForward}
            style={({ pressed }) => [{ opacity: !props.canGoForward ? 0.35 : pressed ? 0.9 : 1 }]}
          >
            <GlassView
              glassEffectStyle="clear"
              colorScheme={isDark ? "dark" : "light"}
              style={[styles.iconBtn, { borderColor: btnBorder }]}
            >
              <Ionicons name="chevron-forward" size={16} color={textPrimary} />
            </GlassView>
          </Pressable>
        </View>
      </GlassView>

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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 18,
    paddingBottom: 0,
    borderRadius: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 10,
  },
  h1: { fontSize: 18, fontWeight: "700" },
  h2: { marginTop: 2, fontSize: 13, lineHeight: 18 },
  iconBtn: {
    height: 38,
    width: 38,
    borderRadius: 14,
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
    maxHeight: Platform.OS === "ios" ? "55%" : "70%",
  },
  sheetHeader: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetFooter: { padding: 14, borderTopWidth: StyleSheet.hairlineWidth },
  doneBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
