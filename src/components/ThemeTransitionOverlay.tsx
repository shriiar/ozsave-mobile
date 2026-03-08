// src/components/ThemeTransitionOverlay.tsx
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const DURATION = 260;

function GlassBackdrop({ theme }: { theme: "light" | "dark" }) {
  const isDark = theme === "dark";

  return (
    <>
      <BlurView intensity={isDark ? 70 : 90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={
          isDark
            ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
            : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

export default function ThemeTransitionOverlay() {
  const { resolvedTheme, mounted } = useTheme();
  const current = (resolvedTheme ?? "light") as "light" | "dark";

  const prevRef = useRef<"light" | "dark">(current);
  const [overlayTheme, setOverlayTheme] = useState<"light" | "dark">(current);
  const [visible, setVisible] = useState(false);

  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!mounted) return;

    const prev = prevRef.current;
    if (prev === current) return;

    // Show old theme overlay on top
    setOverlayTheme(prev);
    setVisible(true);

    // Overlay fully visible immediately
    opacity.value = 1;

    // Now fade it out, revealing the new theme underneath
    opacity.value = withTiming(0, { duration: DURATION }, (finished) => {
      if (finished) runOnJS(setVisible)(false);
    });

    prevRef.current = current;
  }, [current, mounted, opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, anim]}>
      <GlassBackdrop theme={overlayTheme} />
    </Animated.View>
  );
}