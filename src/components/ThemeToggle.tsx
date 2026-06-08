import React, { useEffect } from "react";
import { Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

type Theme = "light" | "dark";

const SEGMENTS: { key: Theme; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: "light", icon: "sunny-outline", label: "Light" },
  { key: "dark", icon: "moon-outline", label: "Dark" },
];

const DURATION = 240;

export function ThemeToggle() {
  const { resolvedTheme, setTheme, mounted } = useTheme();
  const isDark = resolvedTheme === "dark";

  const p = useDerivedValue(() => withTiming(isDark ? 1 : 0, { duration: DURATION }), [isDark]);

  // Track the active index based on resolved theme (handles "system" mode correctly)
  const activeIdx = useSharedValue(isDark ? 1 : 0);
  const trackWidth = useSharedValue(0);

  useEffect(() => {
    activeIdx.value = isDark ? 1 : 0;
  }, [isDark]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ["#E5E7EB", "#1a1a1a"]),
  }));

  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(activeIdx.value * (trackWidth.value / 2), {
          duration: DURATION,
        }),
      },
    ],
    width: trackWidth.value / 2 - 6,
    backgroundColor: interpolateColor(p.value, [0, 1], ["#FFFFFF", "#2a2a2a"]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], ["#6B7280", "#94A3B8"]),
  }));

  if (!mounted) return null;

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width;
  };

  return (
    <Animated.View style={[styles.track, trackStyle]} onLayout={onLayout}>
      {/* Sliding pill */}
      <Animated.View style={[styles.pill, pillStyle]} />

      {SEGMENTS.map((seg) => {
        const isActive = resolvedTheme === seg.key;
        return (
          <Pressable
            key={seg.key}
            style={styles.segment}
            onPress={() => setTheme(seg.key)}
          >
            <Ionicons
              name={seg.icon}
              size={14}
              color={isActive ? "#4F46E5" : isDark ? "#64748B" : "#9CA3AF"}
            />
            <Animated.Text
              style={[styles.label, labelStyle, isActive && styles.labelActive]}
            >
              {seg.label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    height: 42,
    position: "relative",
  },
  pill: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 9,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  labelActive: {
    color: "#4F46E5",
  },
});
