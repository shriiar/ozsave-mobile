import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/context/ThemeContext";
import { DashboardApi, GeminiSummaryResponse } from "../../api";

type Props = {
  open: boolean;
  onClose: () => void;
};


type Status = "idle" | "loading" | "success" | "error";

const MOCK_SUMMARY_DATA: GeminiSummaryResponse = {
  weekly: {
    summary:
      "bla bla asdasd So far this week (now complete), your actual income is $0.00 AUD, but you expect to earn $1,287.00 AUD. Your total costs reached $2,711.81 AUD, heavily driven by utilities ($2,260.16 AUD) and rent ($381.18 AUD). This spending is significantly higher than your typical weekly costs, which averaged around $337.55 AUD in the last four weeks.",
    suggestions: [
      "Review recent utility and rent transactions for accuracy, as these costs are exceptionally high this week.",
      "Prioritize tracking actual income to better reflect your financial position, given your high estimated income.",
    ],
    warning:
      "Your projected net for the week is significantly negative at -$1,424.81 AUD, and actual income recorded is zero. This large deficit is a major concern.",
  },
  fortnightly: {
    summary:
      "So far this fortnight (now complete), you have recorded $1,609.61 AUD in actual income and expect an additional $2,714.62 AUD. Your total costs amounted to $3,094.28 AUD, primarily driven by utilities ($2,260.16 AUD) and rent ($381.18 AUD). While your projected net is positive at $1,229.95 AUD, your costs are higher than two of the last three fortnights, though similar to the fortnight ending March 8th ($3,427.07 AUD), which also saw high utility spending.",
    suggestions: [
      "Monitor your spending in utilities closely, as it's consistently a top cost category across periods.",
      "Ensure all expected income is accurately recorded to maintain a clear picture of your net position.",
    ],
    warning:
      "Despite a positive projected net, your actual income recorded is significantly less than your total costs, leading to a manual net deficit of -$1,484.67 AUD. Relying heavily on estimated income could lead to unexpected shortfalls.",
  },
  monthly: {
    summary:
      "So far this month (5 of 30 days elapsed), your actual income is $0.00 AUD, with an estimated income of $1,045.00 AUD. Your total costs are very low at $17.16 AUD, mainly from utilities and eating out, resulting in a projected net of $1,027.84 AUD. You also have $470.10 AUD in upcoming bills.",
    suggestions: [
      "Given only 5 days have passed, actively track all income and expenses to ensure an accurate budget for the remainder of April.",
      "Prepare for upcoming bills totaling $470.10 AUD, ensuring sufficient funds are available as more costs are likely to emerge.",
    ],
    warning:
      "With only 5 days into the month, your actual income is zero while projected expenses are yet to fully materialise. Ensure estimated income materialises to cover both current and upcoming expenses, especially given your high income variability.",
  },
  historicalComparison: {
    "2026-01": "For January 2026, the data is incomplete with no income or costs recorded.",
    "2026-02": "In February 2026, actual income was $4,677.86 AUD and estimated income was $3,727.53 AUD, with total costs of $3,649.17 AUD. Top spending categories included utilities ($2,250.00 AUD) and rent ($363.24 AUD).",
    "2026-03": "For March 2026, actual income reached $4,054.87 AUD and estimated income was $4,832.68 AUD. Total costs were $4,099.31 AUD, with utilities ($2,311.22 AUD), rent ($381.18 AUD), and 'other' ($350.00 AUD) being the primary spending areas.",
  },
  overallObservation:
    "Your financial data shows high variability in both income and costs, with utilities consistently being a major expenditure across months and fortnights. While estimated income often contributes significantly to your projected net, there's a recurring pattern of zero or low recorded actual income in some periods, contrasting with substantial actual income in others. This suggests income tracking might be inconsistent or income is very sporadic. High utility costs appear to be a structural element of your spending.",
};

const USE_MOCK_SUMMARY = false;

function AiWaveSkeleton({ isDark }: { isDark: boolean }) {
  const shimmerX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    shimmerX.setValue(0);

    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    );

    loop.start();
    return () => loop.stop();
  }, [shimmerX]);

  const loadingParagraph =
    "Summarizing your last 3 months of activity, reviewing cost patterns and spending spikes, checking cost, income, and billing pressure, comparing recent periods and warning signals, and generating suggestions with overall observations.";

  const shimmerTranslateX = shimmerX.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 420],
  });

  return (
    <View style={styles.waveWrap}>
      <View style={styles.loadingTextList}>
        <Text
          style={[
            styles.loadingParagraph,
            {
              color: isDark ? "rgba(241,245,249,0.38)" : "rgba(15,23,42,0.40)",
            },
          ]}
        >
          {loadingParagraph}
        </Text>

        <MaskedView
          pointerEvents="none"
          style={styles.loadingParagraphMaskWrap}
          maskElement={
            <Text style={[styles.loadingParagraph, styles.loadingParagraphMaskText]}>
              {loadingParagraph}
            </Text>
          }
        >
          <Animated.View
            style={[
              styles.loadingShimmerTrack,
              {
                transform: [{ translateX: shimmerTranslateX }],
              },
            ]}
          >
            <LinearGradient
              colors={
                isDark
                  ? [
                    "rgba(255,255,255,0)",
                    "rgba(255,255,255,0.18)",
                    "rgba(255,255,255,1)",
                    "rgba(255,255,255,0.18)",
                    "rgba(255,255,255,0)",
                  ]
                  : [
                    "rgba(15,23,42,0)",
                    "rgba(15,23,42,0.20)",
                    "rgba(15,23,42,1)",
                    "rgba(15,23,42,0.20)",
                    "rgba(15,23,42,0)",
                  ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loadingShimmerGradient}
            />
          </Animated.View>
        </MaskedView>
      </View>
    </View>
  );
}

function RevealBlock({
  visible,
  children,
  delay = 0,
}: {
  visible: boolean;
  children: React.ReactNode;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      translateY.setValue(8);
      return;
    }

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [visible, delay, opacity, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function DashboardAiSummaryModal({ open, onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<GeminiSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const revealReady = status === "success" && !!data;

  const T = useMemo(() => {
    return {
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
      text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
      muted: isDark ? "rgba(189, 200, 214, 0.97)" : "#64748B",
      bg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)",
      chipBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      danger: isDark ? "#FCA5A5" : "#B91C1C",
      primary: "#4F46E5",
      warningBg: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
      observationBg: isDark ? "rgba(79,70,229,0.14)" : "rgba(79,70,229,0.08)",
    };
  }, [isDark]);

  async function loadSummary() {
    try {
      setStatus("loading");
      setError(null);

      if (USE_MOCK_SUMMARY) {
        await new Promise((resolve) => setTimeout(resolve, 7000));
        setData(MOCK_SUMMARY_DATA);
        setStatus("success");
        return;
      }

      const res = await DashboardApi.getGeminiSummary();
      setData(res);
      setStatus("success");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to generate summary");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!open) return;

    setData(null);
    setError(null);
    setStatus("idle");

    loadSummary();
  }, [open]);

  const sections = [
    { key: "weekly", title: "Weekly", value: data?.weekly },
    { key: "fortnightly", title: "Fortnightly", value: data?.fortnightly },
    { key: "monthly", title: "Monthly", value: data?.monthly },
  ].filter((x) => x.value);

  const historicalEntries = Object.entries(data?.historicalComparison ?? {});
  const REVEAL_BASE = 40;
  const REVEAL_STEP = 120;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)",
          }}
        />
      </Pressable>

      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            paddingTop: insets.top,
            paddingBottom: 0,
          },
        ]}
      >
        <View style={styles.center}>
          <View style={styles.wrap}>
            <GlassView
              glassEffectStyle="regular"
              colorScheme={isDark ? "dark" : "light"}
              style={[styles.modal, { borderColor: T.border }]}
            >
              <View style={[styles.header, { borderBottomColor: T.border }]}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconPill, { borderColor: T.border, backgroundColor: T.bg }]}>
                    <Ionicons name="sparkles-outline" size={18} color={T.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.h1, { color: T.text }]}>AI Summary</Text>
                    <Text style={[styles.h2, { color: T.muted }]}>
                      Financial snapshot generated from your dashboard
                    </Text>
                  </View>
                </View>

                <Pressable onPress={onClose} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
                  <View style={[styles.closeBtn, { borderColor: T.border, backgroundColor: T.bg }]}>
                    <Ionicons name="close" size={18} color={T.text} />
                  </View>
                </Pressable>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                  styles.body,
                  { paddingBottom: Math.max(insets.bottom, 12) + 12 },
                ]}
                showsVerticalScrollIndicator={false}
              >
                {(status === "idle" || status === "loading") && (
                  <AiWaveSkeleton isDark={isDark} />
                )}

                {status === "error" && (
                  <View
                    style={[
                      styles.errorBox,
                      {
                        borderColor: "rgba(239,68,68,0.30)",
                        backgroundColor: "rgba(239,68,68,0.10)",
                      },
                    ]}
                  >
                    <Text style={{ color: T.danger, fontWeight: "800", fontSize: 14 }}>
                      Failed to generate summary
                    </Text>
                    <Text style={{ color: T.danger, marginTop: 6, fontSize: 13 }}>
                      {error}
                    </Text>

                    <Pressable
                      onPress={loadSummary}
                      style={({ pressed }) => [
                        styles.retryBtn,
                        {
                          backgroundColor: T.primary,
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <Text style={{ color: "#fff", fontWeight: "800" }}>Retry</Text>
                    </Pressable>
                  </View>
                )}

                {status === "success" && data && (
                  <>
                    {!!data.overallObservation && (
                      <View
                        style={[
                          styles.sectionCard,
                          {
                            borderColor: T.border,
                            backgroundColor: T.observationBg,
                          },
                        ]}
                      >
                        <RevealBlock visible={revealReady} delay={REVEAL_BASE}>
                          <Text style={[styles.blockTitle, { color: T.text }]}>Overall observation</Text>
                        </RevealBlock>

                        <RevealBlock visible={revealReady} delay={REVEAL_BASE + REVEAL_STEP}>
                          <Text style={[styles.blockBody, { color: T.muted }]}>
                            {data.overallObservation}
                          </Text>
                        </RevealBlock>
                      </View>
                    )}

                    <View style={styles.sections}>
                      {sections.map((section, sectionIndex) => {
                        const start = REVEAL_BASE + REVEAL_STEP * (2 + sectionIndex * 5);

                        return (
                          <View
                            key={section.key}
                            style={[styles.sectionCard, { borderColor: T.border, backgroundColor: T.bg }]}
                          >
                            <RevealBlock visible={revealReady} delay={start}>
                              <View style={[styles.sectionChip, { backgroundColor: T.chipBg }]}>
                                <Text style={[styles.sectionChipText, { color: T.text }]}>{section.title}</Text>
                              </View>
                            </RevealBlock>

                            <RevealBlock visible={revealReady} delay={start + REVEAL_STEP}>
                              <Text style={[styles.blockTitle, { color: T.text }]}>Summary</Text>
                            </RevealBlock>

                            <RevealBlock visible={revealReady} delay={start + REVEAL_STEP * 2}>
                              <Text style={[styles.blockBody, { color: T.muted }]}>
                                {section.value?.summary}
                              </Text>
                            </RevealBlock>

                            {!!section.value?.warning && (
                              <RevealBlock visible={revealReady} delay={start + REVEAL_STEP * 3}>
                                <View
                                  style={[
                                    styles.warningBox,
                                    {
                                      backgroundColor: T.warningBg,
                                      borderColor: "rgba(239,68,68,0.20)",
                                    },
                                  ]}
                                >
                                  <Text style={[styles.warningTitle, { color: T.danger }]}>Warning</Text>
                                  <Text style={[styles.warningText, { color: T.danger }]}>
                                    {section.value.warning}
                                  </Text>
                                </View>
                              </RevealBlock>
                            )}

                            {!!section.value?.suggestions?.length && (
                              <>
                                <RevealBlock visible={revealReady} delay={start + REVEAL_STEP * 4}>
                                  <Text style={[styles.blockTitle, { color: T.text, marginTop: 14 }]}>
                                    Suggestions
                                  </Text>
                                </RevealBlock>

                                <View style={{ gap: 8, marginTop: 8 }}>
                                  {section.value.suggestions.map((item, idx) => (
                                    <RevealBlock
                                      key={`${section.key}-${idx}`}
                                      visible={revealReady}
                                      delay={start + REVEAL_STEP * 5 + idx * 90}
                                    >
                                      <View style={styles.suggestionRow}>
                                        <View style={[styles.dot, { backgroundColor: T.primary }]} />
                                        <Text style={[styles.suggestionText, { color: T.muted }]}>
                                          {item}
                                        </Text>
                                      </View>
                                    </RevealBlock>
                                  ))}
                                </View>
                              </>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {!!historicalEntries.length && (
                      <View style={[styles.sectionCard, { borderColor: T.border, backgroundColor: T.bg }]}>
                        <RevealBlock
                          visible={revealReady}
                          delay={REVEAL_BASE + REVEAL_STEP * (2 + sections.length * 5)}
                        >
                          <Text style={[styles.blockTitle, { color: T.text }]}>Historical comparison</Text>
                        </RevealBlock>

                        <View style={{ gap: 10, marginTop: 10 }}>
                          {historicalEntries.map(([periodKey, value], idx) => (
                            <RevealBlock
                              key={periodKey}
                              visible={revealReady}
                              delay={REVEAL_BASE + REVEAL_STEP * (3 + sections.length * 5) + idx * 110}
                            >
                              <View style={styles.historyRow}>
                                <View style={[styles.historyChip, { backgroundColor: T.chipBg }]}>
                                  <Text style={[styles.historyChipText, { color: T.text }]}>{periodKey}</Text>
                                </View>
                                <Text style={[styles.historyText, { color: T.muted }]}>{value}</Text>
                              </View>
                            </RevealBlock>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            </GlassView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "flex-end",
  },
  wrap: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  modal: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  headerLeft: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  h1: {
    fontSize: 16,
    fontWeight: "800",
  },
  h2: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    padding: 16,
    gap: 14,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  waveWrap: {
    paddingTop: 2,
    gap: 10,
  },
  sections: {
    gap: 12,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  sectionChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  sectionChipText: {
    fontSize: 11,
    fontWeight: "800",
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  blockBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
  },
  warningBox: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  warningText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginTop: 6,
  },
  historyRow: {
    gap: 8,
  },
  historyChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  historyChipText: {
    fontSize: 11,
    fontWeight: "800",
  },
  historyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  errorBox: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  retryBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  loadingTextList: {
    marginTop: 10,
    gap: 10,
  },

  loadingParagraph: {
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "600",
  },
  loadingParagraphMaskWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingParagraphMaskText: {
    color: "#000",
  },
  loadingShimmerTrack: {
    width: 220,
    height: "100%",
  },
  loadingShimmerGradient: {
    flex: 1,
  },
});