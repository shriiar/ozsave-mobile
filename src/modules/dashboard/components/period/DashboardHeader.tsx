import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent, Animated, PanResponder } from "react-native";
import { GlassView } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../../context/ThemeContext";
import { useGlassStyle } from "../../../../context/GlassStyleContext";
import { typography } from "../../../../theme/typography";

export type RangeKey = "7d" | "14d" | "30d";

const RANGE_TABS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "14d", label: "14D" },
  { key: "30d", label: "30D" },
];

const SEGMENT_PADDING = 3;

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
  const { glassStyle } = useGlassStyle();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const textPrimary = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
  const textMuted = isDark ? "rgba(148,163,184,0.95)" : "#64748B";
  const hairline = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.10)";

  // --- Slide-to-select segmented control -----------------------------------
  // A single PanResponder drives both taps and drags across the whole strip,
  // like Apple's native UISegmentedControl: touching down anywhere selects
  // that segment immediately, and dragging updates the selection live as
  // your finger crosses into the next segment. The highlight thumb only
  // animates `transform`, never `opacity` — an opacity-animated ancestor of
  // a GlassView permanently breaks its native glass rendering on iOS 26.1+.
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const segmentWidth = trackWidth / RANGE_TABS.length;

  const activeIndex = Math.max(0, RANGE_TABS.findIndex((t) => t.key === props.range));
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const onRangeChangeRef = useRef(props.onRangeChange);
  onRangeChangeRef.current = props.onRangeChange;

  const thumbX = useRef(new Animated.Value(0)).current;
  const isDraggingRef = useRef(false);
  const lastIndexRef = useRef(activeIndex);
  const [segmentPressed, setSegmentPressed] = useState(false);

  function indexFromX(x: number) {
    const w = trackWidthRef.current;
    if (!w) return activeIndexRef.current;
    const segW = w / RANGE_TABS.length;
    return Math.min(RANGE_TABS.length - 1, Math.max(0, Math.floor(x / segW)));
  }

  function snapTo(index: number, animated: boolean) {
    const segW = trackWidthRef.current / RANGE_TABS.length;
    const target = index * segW;
    if (animated) {
      Animated.spring(thumbX, { toValue: target, useNativeDriver: true, damping: 18, mass: 0.7, stiffness: 220 }).start();
    } else {
      thumbX.setValue(target);
    }
  }

  function commit() {
    isDraggingRef.current = false;
    setSegmentPressed(false);
    snapTo(lastIndexRef.current, true);
    // Only fire the actual range change (which triggers a data refetch) once
    // the gesture ends — not on every segment the finger passes through
    // while dragging, to avoid firing a request per crossed segment.
    if (lastIndexRef.current !== activeIndexRef.current) {
      onRangeChangeRef.current(RANGE_TABS[lastIndexRef.current].key);
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => trackWidthRef.current > 0,
      onMoveShouldSetPanResponder: () => trackWidthRef.current > 0,
      onPanResponderGrant: (evt) => {
        isDraggingRef.current = true;
        setSegmentPressed(true);
        const x = evt.nativeEvent.locationX - SEGMENT_PADDING;
        const segW = trackWidthRef.current / RANGE_TABS.length;
        thumbX.setValue(Math.min(trackWidthRef.current - segW, Math.max(0, x - segW / 2)));
        lastIndexRef.current = indexFromX(x);
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX - SEGMENT_PADDING;
        const segW = trackWidthRef.current / RANGE_TABS.length;
        thumbX.setValue(Math.min(trackWidthRef.current - segW, Math.max(0, x - segW / 2)));
        lastIndexRef.current = indexFromX(x);
      },
      onPanResponderRelease: commit,
      onPanResponderTerminate: commit,
    })
  ).current;

  // Keep the thumb in sync when the range changes from outside a drag
  // (initial mount, or programmatic changes elsewhere).
  useEffect(() => {
    if (isDraggingRef.current) return;
    lastIndexRef.current = activeIndex;
    snapTo(activeIndex, trackWidth > 0);
  }, [activeIndex, trackWidth]);

  const thumbWidth = useMemo(() => (trackWidth > 0 ? trackWidth / RANGE_TABS.length : 0), [trackWidth]);

  return (
    <GlassView
      glassEffectStyle={glassStyle}
      colorScheme={isDark ? "dark" : "light"}
      onLayout={props.onLayout}
      style={[styles.header, { paddingTop: insets.top + 10 }]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          {!!props.subtitle && (
            <Text style={[typography.subheadlineEmphasized, { color: textPrimary }]} numberOfLines={1}>
              {props.subtitle}
            </Text>
          )}
        </View>

        {/* Prev/Next — two separate rounded glass buttons, each with its own
            native isInteractive press feedback, matching every other button
            in the app (Save/Close/Add/Filters). */}
        <View style={styles.stepper}>
          <Pressable onPress={props.onPrev} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
            <GlassView
              glassEffectStyle={glassStyle}
              isInteractive
              tintColor="#FF9500"
              colorScheme={isDark ? "dark" : "light"}
              style={styles.stepperBtn}
            >
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </GlassView>
          </Pressable>

          <Pressable
            onPress={props.onNext}
            disabled={!props.canGoForward}
            style={({ pressed }) => [{ opacity: !props.canGoForward ? 0.3 : pressed ? 0.75 : 1 }]}
          >
            <GlassView
              glassEffectStyle={glassStyle}
              isInteractive
              tintColor="#FF9500"
              colorScheme={isDark ? "dark" : "light"}
              style={styles.stepperBtn}
            >
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </GlassView>
          </Pressable>
        </View>
      </View>

      {/* Range segmented control — one glass capsule with a highlight thumb
          you can tap OR drag your finger across to slide the selection,
          like Apple's native segmented control. */}
      <View
        style={[styles.segmentedWrap, { opacity: segmentPressed ? 0.75 : 1 }]}
        onLayout={(e) => {
          const w = Math.max(0, e.nativeEvent.layout.width - SEGMENT_PADDING * 2);
          trackWidthRef.current = w;
          setTrackWidth(w);
        }}
        {...panResponder.panHandlers}
      >
        <GlassView
          glassEffectStyle={glassStyle}
          isInteractive
          colorScheme={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFillObject}
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: hairline },
          ]}
        />

        {thumbWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.segmentThumb,
              {
                position: "absolute",
                left: SEGMENT_PADDING,
                top: SEGMENT_PADDING,
                bottom: SEGMENT_PADDING,
                width: thumbWidth,
                backgroundColor: "#FF9500",
                transform: [{ translateX: thumbX }],
              },
            ]}
          />
        )}

        <View style={styles.segmentLabelsRow} pointerEvents="none">
          {RANGE_TABS.map((opt) => {
            const active = opt.key === props.range;
            return (
              <View key={opt.key} style={styles.segmentTouch}>
                <Text
                  style={[
                    active ? typography.footnoteEmphasized : typography.footnote,
                    styles.segmentText,
                    { color: active ? "#fff" : textMuted },
                  ]}
                >
                  {opt.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
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
    paddingBottom: 10,
    borderRadius: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  stepper: {
    flexDirection: "row",
    gap: 8,
  },
  stepperBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  segmentedWrap: {
    flexDirection: "row",
    height: 30,
    borderRadius: 10,
    overflow: "hidden",
  },
  segmentLabelsRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    padding: SEGMENT_PADDING,
  },
  segmentTouch: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentThumb: {
    borderRadius: 7,
  },
  segmentText: {
    letterSpacing: 0.2,
  },
});
