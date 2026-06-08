import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, TurboModuleRegistry } from "react-native";
import { registerThemeTransitionHandler } from "../lib/themeTransition";

const DURATION = 330;

// Use the non-throwing .get() to check availability before ever touching the module.
// TurboModuleRegistry.getEnforcing (used inside react-native-view-shot) throws an
// Invariant Violation that bypasses try/catch in Hermes when the native binary doesn't
// have RNViewShot (e.g. Expo Go). .get() returns null safely instead.
const VIEW_SHOT_AVAILABLE = !!TurboModuleRegistry.get("RNViewShot");

export default function ThemeTransitionOverlay() {
  const [snapUri, setSnapUri] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const animating = useRef(false);

  useEffect(() => {
    const captureScreen: ((opts: any) => Promise<string>) | null = VIEW_SHOT_AVAILABLE
      ? require("react-native-view-shot").captureScreen
      : null;

    return registerThemeTransitionHandler(({ apply }) => {
      if (!captureScreen || animating.current) {
        apply();
        return;
      }

      animating.current = true;

      captureScreen({ format: "jpg", quality: 0.92 })
        .then((uri: string) => {
          apply();
          opacity.setValue(1);
          setSnapUri(uri);

          setTimeout(() => {
            Animated.timing(opacity, {
              toValue: 0,
              duration: DURATION,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (finished) {
                setSnapUri(null);
                animating.current = false;
              }
            });
          }, 32);
        })
        .catch(() => {
          apply();
          animating.current = false;
        });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.overlay, { opacity }]}
    >
      {snapUri ? (
        <Image
          source={{ uri: snapUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          fadeDuration={0}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 9999 },
});
