// LiquidRevealLoader.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  interpolateColor,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";

type Props = {
  loading: boolean;
  text: string;
  size?: number;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export default function LiquidRevealLoader({
  loading,
  text,
  size = 140,
}: Props) {
  const scale = useSharedValue(1);
  const outerRotate = useSharedValue(0);
  const midRotate = useSharedValue(0);
  const innerRotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const innerScale = useSharedValue(1);
  const colorShift = useSharedValue(0);
  const breath = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(8);

  useEffect(() => {
    if (loading) {
      scale.value = withTiming(1, { duration: 180 });

      outerRotate.value = withRepeat(
        withSequence(
          withTiming(8, { duration: 5200, easing: Easing.inOut(Easing.ease) }),
          withTiming(-8, { duration: 5200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      midRotate.value = withRepeat(
        withSequence(
          withTiming(18, { duration: 3600, easing: Easing.inOut(Easing.ease) }),
          withTiming(-18, { duration: 3600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      innerRotate.value = withRepeat(
        withSequence(
          withTiming(-22, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(22, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      innerScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.98, { duration: 2200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      breath.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      colorShift.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
          withTiming(2, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      opacity.value = withTiming(1, { duration: 220 });
      textOpacity.value = withTiming(0, { duration: 180 });
      textTranslateY.value = withTiming(8, { duration: 180 });
    } else {
      breath.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
      colorShift.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 650, easing: Easing.out(Easing.cubic) });
      textOpacity.value = withDelay(
        180,
        withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
      textTranslateY.value = withDelay(
        180,
        withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [breath, colorShift, innerRotate, innerScale, loading, midRotate, opacity, outerRotate, scale, textOpacity, textTranslateY]);

  const cubeWrapStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const auraStyle = useAnimatedStyle(() => {
    const auraOpacity = 0.72 + breath.value * 0.08;

    return {
      opacity: auraOpacity,
      transform: [{ rotate: `${outerRotate.value}deg` }],
    };
  });

  const orbStyle = useAnimatedStyle(() => {
    const orbOpacity = 0.9 + breath.value * 0.06;

    return {
      opacity: orbOpacity,
      transform: [{ rotate: `${midRotate.value}deg` }],
    };
  });

  const innerOrbStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.82 + breath.value * 0.08,
      transform: [
        { scale: innerScale.value },
        { rotate: `${innerRotate.value}deg` },
      ],
    };
  });

  const colorBreathStyle = useAnimatedStyle(() => {
    const opacityValue = 0.16 + breath.value * 0.12 + colorShift.value * 0.04;

    return {
      opacity: opacityValue,
      transform: [{ rotate: `${midRotate.value * 0.78 + 24}deg` }],
    };
  });

  const textWrapStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const innerFaceStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorShift.value,
      [0, 1, 2],
      [
        "rgba(255,255,255,0.06)",
        "rgba(122,230,255,0.10)",
        "rgba(196,181,253,0.10)",
      ]
    );

    const borderColor = interpolateColor(
      colorShift.value,
      [0, 1, 2],
      [
        "rgba(255,255,255,0.08)",
        "rgba(122,230,255,0.14)",
        "rgba(196,181,253,0.14)",
      ]
    );

    return {
      backgroundColor,
      borderColor,
      opacity: 0.58 + breath.value * 0.08,
      transform: [{ scale: 0.98 + breath.value * 0.04 }],
    };
  });

  const auraSize = size * 0.9;
  const orbSize = size * 0.62;
  const innerSize = size * 0.3;
  const coreSize = size * 0.16;

  return (
    <View style={[styles.root, { minHeight: size + 60 }]}>
      {loading ? (
        <AnimatedView
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(500)}
          style={[styles.loaderWrap, cubeWrapStyle, { width: size, height: size }]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.faceLayer,
              styles.auraLayer,
              auraStyle,
              {
                width: auraSize,
                height: auraSize,
                borderRadius: auraSize / 2,
              },
            ]}
          >
            <Canvas style={{ width: "100%", height: "100%" }}>
              <Group>
                <Circle cx={auraSize / 2} cy={auraSize / 2} r={auraSize * 0.34}>
                  <SweepGradient
                    c={vec(auraSize / 2, auraSize / 2)}
                    colors={[
                      "rgba(64,191,255,0.00)",
                      "rgba(72,215,255,0.22)",
                      "rgba(118,119,255,0.18)",
                      "rgba(214,111,255,0.22)",
                      "rgba(72,215,255,0.22)",
                      "rgba(64,191,255,0.00)",
                    ]}
                  />
                  <BlurMask blur={34} style="solid" />
                </Circle>
              </Group>
            </Canvas>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.faceLayer,
              orbStyle,
              {
                width: orbSize,
                height: orbSize,
                borderRadius: orbSize / 2,
              },
            ]}
          >
            <Canvas style={{ width: "100%", height: "100%" }}>
              <Group>
                <Circle cx={orbSize / 2} cy={orbSize / 2} r={orbSize * 0.34}>
                  <SweepGradient
                    c={vec(orbSize / 2, orbSize / 2)}
                    colors={[
                      "rgba(255,255,255,0.00)",
                      "rgba(122,236,255,0.28)",
                      "rgba(96,170,255,0.14)",
                      "rgba(213,150,255,0.24)",
                      "rgba(122,236,255,0.28)",
                      "rgba(255,255,255,0.00)",
                    ]}
                  />
                  <BlurMask blur={20} style="solid" />
                </Circle>
              </Group>
            </Canvas>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.faceLayer,
              colorBreathStyle,
              {
                width: orbSize * 0.92,
                height: orbSize * 0.92,
                borderRadius: (orbSize * 0.92) / 2,
              },
            ]}
          >
            <Canvas style={{ width: "100%", height: "100%" }}>
              <Group>
                <Circle cx={(orbSize * 0.92) / 2} cy={(orbSize * 0.92) / 2} r={orbSize * 0.3}>
                  <SweepGradient
                    c={vec((orbSize * 0.92) / 2, (orbSize * 0.92) / 2)}
                    colors={[
                      "rgba(255,255,255,0.00)",
                      "rgba(88,244,255,0.18)",
                      "rgba(72,160,255,0.12)",
                      "rgba(228,116,255,0.22)",
                      "rgba(88,244,255,0.18)",
                      "rgba(255,255,255,0.00)",
                    ]}
                  />
                  <BlurMask blur={18} style="solid" />
                </Circle>
              </Group>
            </Canvas>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.faceLayer,
              innerOrbStyle,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
          >
            <Canvas style={{ width: "100%", height: "100%" }}>
              <Group>
                <Circle cx={innerSize / 2} cy={innerSize / 2} r={innerSize * 0.34}>
                  <SweepGradient
                    c={vec(innerSize / 2, innerSize / 2)}
                    colors={[
                      "rgba(255,255,255,0.00)",
                      "rgba(255,255,255,0.14)",
                      "rgba(145,219,255,0.16)",
                      "rgba(206,186,255,0.15)",
                      "rgba(255,255,255,0.14)",
                      "rgba(255,255,255,0.00)",
                    ]}
                  />
                  <BlurMask blur={13} style="solid" />
                </Circle>
              </Group>
            </Canvas>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.faceLayer,
              styles.coreLayer,
              {
                width: coreSize,
                height: coreSize,
                borderRadius: coreSize / 2,
              },
            ]}
          >
            <Canvas style={{ width: "100%", height: "100%" }}>
              <Group>
                <Circle cx={coreSize / 2} cy={coreSize / 2} r={coreSize * 0.32}>
                  <SweepGradient
                    c={vec(coreSize / 2, coreSize / 2)}
                    colors={[
                      "rgba(255,255,255,0.10)",
                      "rgba(255,255,255,0.40)",
                      "rgba(183,230,255,0.26)",
                      "rgba(255,255,255,0.40)",
                      "rgba(255,255,255,0.10)",
                    ]}
                  />
                  <BlurMask blur={10} style="solid" />
                </Circle>
              </Group>
            </Canvas>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.innerGlass,
              innerFaceStyle,
              {
                width: size * 0.28,
                height: size * 0.28,
                borderRadius: size * 0.14,
              },
            ]}
          />
        </AnimatedView>
      ) : null}

      {!loading ? (
        <AnimatedView
          entering={FadeIn.duration(450)}
          style={[styles.textWrap, textWrapStyle]}
        >
          <Text style={styles.resultText}>{text}</Text>
        </AnimatedView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  faceLayer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  auraLayer: {
    opacity: 0.78,
  },
  coreLayer: {
    opacity: 0.96,
  },
  innerGlass: {
    position: "absolute",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  textWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
  },
});