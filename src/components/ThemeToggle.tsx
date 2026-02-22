// src/components/ThemeToggle.tsx
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

type Theme = "light" | "dark" | "system";

const AnimatedView = Animated.createAnimatedComponent(View);

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggle, mounted } = useTheme();
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  // 0 = light, 1 = dark
  const p = useDerivedValue(() => withTiming(isDark ? 1 : 0, { duration: 220 }), [isDark]);

  // Crossfade two background layers instead of swapping props
  const lightLayer = useAnimatedStyle(() => ({ opacity: 1 - p.value }));
  const darkLayer = useAnimatedStyle(() => ({ opacity: p.value }));

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(p.value, [0, 1], ["rgba(0,0,0,0.10)", "rgba(255,255,255,0.10)"]),
    backgroundColor: interpolateColor(p.value, [0, 1], ["rgba(255,255,255,0.20)", "rgba(0,0,0,0.10)"]),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], ["#111827", "rgba(255,255,255,0.92)"]),
  }));

  const subStyle = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], ["#6B7280", "rgba(148,163,184,0.95)"]),
  }));

  const quickBtnStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ["rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)"]),
    borderColor: interpolateColor(p.value, [0, 1], ["rgba(0,0,0,0.08)", "rgba(255,255,255,0.10)"]),
  }));

  const segmentStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ["rgba(0,0,0,0.05)", "rgba(255,255,255,0.06)"]),
    borderColor: interpolateColor(p.value, [0, 1], ["rgba(0,0,0,0.08)", "rgba(255,255,255,0.10)"]),
  }));

  const seg = (t: Theme) => {
    const active = theme === t;

    // active bg should also not “jump”
    const activeBg = active ? styles.segBtnActive : null;

    return (
      <Pressable key={t} onPress={() => setTheme(t)} style={[styles.segBtn, activeBg]}>
        <Animated.Text
          style={[
            styles.segText,
            {
              color: active ? "#4F46E5" : undefined,
            },
            !active && {
              // non-active text animates with theme
              // (active stays purple)
            },
            !active &&
              useAnimatedStyle(() => ({
                color: interpolateColor(p.value, [0, 1], ["#111827", "rgba(255,255,255,0.88)"]),
              })),
          ]}
        >
          {t === "system" ? "System" : t === "light" ? "Light" : "Dark"}
        </Animated.Text>
      </Pressable>
    );
  };

  // Memoize the label so it doesn’t thrash renders
  const subtitle = useMemo(() => {
    return theme === "system" ? `System (${resolvedTheme})` : resolvedTheme;
  }, [theme, resolvedTheme]);

  return (
    <AnimatedView style={[styles.root, cardStyle]}>
      {/* Background layers: render BOTH and crossfade */}
      <AnimatedView pointerEvents="none" style={[StyleSheet.absoluteFill, lightLayer]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.60)", "rgba(255,255,255,0.45)", "rgba(255,255,255,0.30)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0.00)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: 0.22 }]}
        />
      </AnimatedView>

      <AnimatedView pointerEvents="none" style={[StyleSheet.absoluteFill, darkLayer]}>
        <LinearGradient
          colors={["rgba(15,23,42,0.55)", "rgba(15,23,42,0.35)", "rgba(15,23,42,0.22)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.00)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: 0.12 }]}
        />
      </AnimatedView>

      <View style={styles.row}>
        <View style={styles.left}>
          <Animated.Text style={[styles.title, titleStyle]}>Theme</Animated.Text>
          <Animated.Text style={[styles.sub, subStyle]}>{subtitle}</Animated.Text>
        </View>

        <Pressable onPress={toggle}>
          <AnimatedView style={[styles.quickBtn, quickBtnStyle]}>
            <Ionicons
              name={resolvedTheme === "dark" ? "sunny-outline" : "moon-outline"}
              size={16}
              color={isDark ? "rgba(255,255,255,0.92)" : "#111827"}
            />
          </AnimatedView>
        </Pressable>
      </View>

      <AnimatedView style={[styles.segment, segmentStyle]}>
        {(["system", "light", "dark"] as Theme[]).map(seg)}
      </AnimatedView>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  left: { flex: 1 },

  title: { fontSize: 13, fontWeight: "800" },
  sub: { marginTop: 2, fontSize: 11 },

  quickBtn: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },

  segment: {
    marginTop: 10,
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },

  segBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segBtnActive: {
    backgroundColor: "rgba(79,70,229,0.14)",
  },
  segText: { fontSize: 12, fontWeight: "800" },
});