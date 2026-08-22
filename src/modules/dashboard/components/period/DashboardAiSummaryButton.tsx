import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@/src/context/ThemeContext";

type Props = {
  onPress: () => void;
  disabled?: boolean;
};

export default function DashboardAiSummaryButton({
  onPress,
  disabled = false,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    return {
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
      text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
      mutedBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)",
    };
  }, [isDark]);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.9 : 1 }]}
    >
      <GlassView
        glassEffectStyle="regular"
        isInteractive={!disabled}
        colorScheme={isDark ? "dark" : "light"}
        style={[styles.btn, { borderColor: T.border, backgroundColor: T.mutedBg }]}
      >
        <Ionicons name="sparkles-outline" size={16} color={T.text} />
        <Text style={[styles.text, { color: T.text }]}>AI Summary</Text>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  text: {
    fontSize: 13,
    fontWeight: "800",
  },
});