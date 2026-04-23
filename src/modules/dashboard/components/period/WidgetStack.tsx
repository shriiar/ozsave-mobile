import React, { useMemo, useState } from "react";
import { View, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
  children: React.ReactNode | React.ReactNode[];
  height?: number;
  initialIndex?: number;
  showDots?: boolean;
  dotsOffset?: number;
  style?: any;
};

const SPRING = { stiffness: 260, damping: 30, mass: 1 };

// visual settings
const STACK_GAP = 18;
const STACK_SCALE = 0.965;
const CARD_INSET = 20;

const EXPAND = {
  duration: 500,
  easing: Easing.out(Easing.cubic),
};

function clamp(v: number, min: number, max: number) {
  "worklet";
  return Math.min(max, Math.max(min, v));
}

function wrap(i: number, total: number) {
  "worklet";
  const m = i % total;
  return m < 0 ? m + total : m;
}

// signed circular distance from a -> b in range [-floor(total/2), +floor(total/2)]
function circularDelta(from: number, to: number, total: number) {
  "worklet";
  let d = to - from;
  const half = total / 2;
  if (d > half) d -= total;
  if (d < -half) d += total;
  return d;
}

type StackCardProps = {
  index: number;
  total: number;
  active: number;
  activeSV: SharedValue<number>;
  y: SharedValue<number>;
  h: SharedValue<number>;
  expand: SharedValue<number>;
  children: React.ReactNode;
};

function StackCard({ index, total, active, activeSV, y, h, expand, children }: StackCardProps) {
  const cardStyle = useAnimatedStyle(() => {
    const hh = h.value || 1;
    const t = Math.min(1, Math.abs(y.value) / hh);
    const d = circularDelta(activeSV.value, index, total);

    if (d < -1 || d > 1) {
      return { opacity: 0, transform: [{ translateY: 0 }, { scale: 1 }] };
    }

    const isActive = d === 0;
    const baseY = isActive ? 0 : d === 1 ? hh - STACK_GAP : -hh + STACK_GAP;

    const show = isActive
      ? 1
      : d === 1
        ? (y.value < 0 ? clamp(t * 1.2, 0, 1) : 0)
        : (y.value > 0 ? clamp(t * 1.2, 0, 1) : 0);

    const scale = isActive ? 1 - t * 0.04 : STACK_SCALE + t * (1 - STACK_SCALE);
    const inset = isActive ? CARD_INSET * (1 - expand.value) : CARD_INSET;
    const radius = isActive ? 18 + (24 - 18) * expand.value : 18;

    return {
      opacity: show,
      top: inset,
      left: inset,
      right: inset,
      bottom: inset,
      borderRadius: radius,
      transform: [{ translateY: baseY + y.value }, { scale }],
    };
  });

  const pointerEvents = index === active ? "auto" : "none";

  return (
    <Animated.View pointerEvents={pointerEvents as any} style={[styles.cardBase, cardStyle]}>
      {children}
    </Animated.View>
  );
}

export function WidgetStack({
  children,
  height = 420,
  initialIndex = 0,
  showDots = true,
  dotsOffset = 12,
  style,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const items = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);
  const total = items.length;
  if (!total) return null;

  // JS state only for dots + pointerEvents (UI uses activeSV)
  const [active, setActive] = useState(() => ((initialIndex % total) + total) % total);

  // UI-thread source of truth
  const activeSV = useSharedValue(active);

  // expansion animation after index commit
  // 1 = full bleed, 0 = inset
  const expand = useSharedValue(1);

  // keep JS dots in sync when UI changes index
  useAnimatedReaction(
    () => activeSV.value,
    (v, prev) => {
      if (v !== prev) runOnJS(setActive)(v);
    },
    []
  );

  // drag + height
  const y = useSharedValue(0);
  const h = useSharedValue(height);
  const animating = useSharedValue(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const newH = e.nativeEvent.layout.height;
    if (newH > 0) h.value = newH;
  };

  const startExpandUI = () => {
    "worklet";
    expand.value = 0;
    expand.value = withTiming(1, EXPAND);
  };

  const commitMoveUI = (dir: 1 | -1) => {
    "worklet";
    activeSV.value = wrap(activeSV.value + dir, total);
    startExpandUI(); // smooth “take full space” after swipe completes
  };

  const gesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-80, 80])
    .onUpdate((e) => {
      "worklet";
      if (animating.value) return;

      const hh = h.value || 1;
      const maxDrag = hh * 0.42;

      y.value = clamp(e.translationY, -maxDrag, maxDrag);
    })
    .onEnd((e) => {
      "worklet";
      if (animating.value) return;

      const hh = h.value || 1;

      const dy = y.value;
      const power = Math.abs(dy) + Math.abs(e.velocityY) * 0.12;
      const threshold = Math.min(120, hh * 0.22);

      const goNext = dy < -30 && power > threshold; // swipe up -> next
      const goPrev = dy > 30 && power > threshold;  // swipe down -> prev

      const snapDist = hh - STACK_GAP; // distance needed for next/prev to land at 0

      if (goNext) {
        animating.value = true;
        y.value = withSpring(-snapDist, { ...SPRING, overshootClamping: true }, (finished) => {
          if (!finished) return;

          commitMoveUI(1);
          y.value = 0;
          animating.value = false;
        });
        return;
      }

      if (goPrev) {
        animating.value = true;
        y.value = withSpring(snapDist, { ...SPRING, overshootClamping: true }, (finished) => {
          if (!finished) return;

          commitMoveUI(-1);
          y.value = 0;
          animating.value = false;
        });
        return;
      }

      y.value = withSpring(0, { ...SPRING, overshootClamping: true });
    });

  return (
    <View style={[styles.root, { height }, style]}>
      <View
        style={[
          styles.surface,
          // ✅ theme-aware widget background
          { backgroundColor: isDark ? "rgba(2,6,23,0.58)" : "rgba(237,237,237,1)" },
        ]}
        onLayout={onLayout}
      >
        {items.map((node, i) => (
          <StackCard
            key={i}
            index={i}
            total={total}
            active={active}
            activeSV={activeSV}
            y={y}
            h={h}
            expand={expand}
          >
            {node}
          </StackCard>
        ))}

        <GestureDetector gesture={gesture}>
          <Animated.View style={StyleSheet.absoluteFillObject} />
        </GestureDetector>
      </View>

      {showDots && total > 1 ? (
        <View style={[styles.dots, { right: -dotsOffset }]}>
          {items.map((_, i) => {
            const activeDot = i === active;
            return (
              <Pressable
                key={i}
                hitSlop={12}
                onPress={() => {
                  setActive(i);
                  activeSV.value = i;
                  y.value = 0;

                  expand.value = 0;
                  expand.value = withTiming(1, EXPAND);
                }}
                style={[
                  styles.dot,
                  activeDot ? styles.dotActive : styles.dotInactive,
                  {
                    backgroundColor: activeDot
                      ? (isDark ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.92)")
                      : (isDark ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.35)"),
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: "100%", position: "relative" },

  surface: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    // backgroundColor set dynamically
  },

  cardBase: {
    position: "absolute",
    top: CARD_INSET,
    left: CARD_INSET,
    right: CARD_INSET,
    bottom: CARD_INSET,
    borderRadius: 18,
    overflow: "hidden",
  },

  dots: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    gap: 8,
    zIndex: 20,
  },

  dot: { width: 8, height: 8, borderRadius: 999 },

  dotActive: {
    transform: [{ scale: 1.12 }],
  },
  dotInactive: {},
});