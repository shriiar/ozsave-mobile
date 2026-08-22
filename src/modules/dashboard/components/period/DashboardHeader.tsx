import React from "react";
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import { GlassView, GlassContainer } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../../context/ThemeContext";

export type RangeKey = "7d" | "14d" | "30d";

const RANGE_TABS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "14d", label: "14D" },
  { key: "30d", label: "30D" },
];

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

  const textPrimary = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
  const textMuted = isDark ? "rgba(148,163,184,0.95)" : "#64748B";
  const btnBorder = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
  const segmentBorder = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)";

  return (
    <GlassView
      glassEffectStyle="regular"
      colorScheme={isDark ? "dark" : "light"}
      onLayout={props.onLayout}
      style={[styles.header, { paddingTop: insets.top + 20 }]}
    >
      <View style={[styles.headerRow, { marginBottom: 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: textPrimary }]}>{props.title}</Text>
          {!!props.subtitle && (
            <Text style={[styles.h2, { color: textMuted }]}>{props.subtitle}</Text>
          )}
        </View>

        <Pressable
          onPress={props.onPrev}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <View style={styles.iconBtn}>
            <GlassView
              glassEffectStyle="regular"
              isInteractive
              colorScheme={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Plain-View border overlay: GlassView's own border rim has the
                same native attach-timing flash the fill used to have, so the
                border is drawn here instead, on an ordinary layer. */}
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: btnBorder },
              ]}
            />
            <Ionicons name="chevron-back" size={16} color={textPrimary} />
          </View>
        </Pressable>

        <Pressable
          onPress={props.onNext}
          disabled={!props.canGoForward}
          style={({ pressed }) => [{ opacity: !props.canGoForward ? 0.35 : pressed ? 0.9 : 1 }]}
        >
          <View style={styles.iconBtn}>
            <GlassView
              glassEffectStyle="regular"
              isInteractive={props.canGoForward}
              colorScheme={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFillObject}
            />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: btnBorder },
              ]}
            />
            <Ionicons name="chevron-forward" size={16} color={textPrimary} />
          </View>
        </Pressable>
      </View>

      <GlassContainer spacing={8} style={styles.segmentRow}>
        {RANGE_TABS.map((opt) => {
          const active = opt.key === props.range;
          return (
            <Pressable key={opt.key} style={{ flex: 1 }} onPress={() => props.onRangeChange(opt.key)}>
              <View style={styles.segment}>
                <GlassView
                  glassEffectStyle="regular"
                  isInteractive
                  colorScheme={isDark ? "dark" : "light"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFillObject,
                    { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: segmentBorder },
                  ]}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? textPrimary : textMuted, fontWeight: active ? "800" : "600" },
                  ]}
                >
                  {opt.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </GlassContainer>
    </GlassView>
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
  segmentRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 14,
  },
  segment: {
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  segmentText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
