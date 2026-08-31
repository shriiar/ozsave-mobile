import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-gifted-charts";
import { useTheme } from "../../../../context/ThemeContext";

export type BarPoint = {
    dayKey: string; // YYYY-MM-DD
    dayLabel: string; // unused
    cost: number;
    manual: number;
    estimate: number;
};

type Meta = {
    dayKey: string;
    cost: number;
    manual: number;
    estimate: number;
    dayIdx: number;
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function formatAxisMoney(v: number) {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return "0";
    if (Math.abs(n) >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
    if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}k`;
    return `${Math.round(n)}`;
}

function formatDayShort(ymd: string) {
    const [yy, mm, dd] = (ymd || "").split("-");
    if (!yy || !mm || !dd) return ymd || "";
    return `${dd.padStart(2, "0")}/${mm.padStart(2, "0")}`;
}

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function weekdayShort(ymd: string) {
    const [yy, mm, dd] = (ymd || "").split("-").map(Number);
    if (!yy || !mm || !dd) return "";
    const date = new Date(yy, mm - 1, dd);
    return WEEKDAY_NAMES[date.getDay()];
}

function TooltipRow(props: { label: string; color: string; value: number; textColor: string }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ height: 9, width: 9, borderRadius: 5, backgroundColor: props.color }} />
                <Text style={{ color: props.textColor, fontWeight: "800", fontSize: 12 }}>{props.label}</Text>
            </View>
            <Text style={{ color: props.textColor, fontWeight: "900", fontSize: 12 }}>${Math.round(props.value)}</Text>
        </View>
    );
}

function LegendPill({ label, color, textColor }: { label: string; color: string; textColor: string }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: color }} />
            <Text style={{ color: textColor, fontWeight: "700", fontSize: 12 }}>{label}</Text>
        </View>
    );
}

export function DashboardBarChart({ data }: { data: BarPoint[] }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const ui = useMemo(() => {
        const axis = isDark ? "rgba(148,163,184,0.92)" : "rgba(15,23,42,0.92)";
        const grid = isDark ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.16)";
        const legend = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";

        const cardGrad = isDark
            ? ["rgba(5,5,5,0.58)", "rgba(18,18,18,0.46)", "rgba(5,5,5,0.38)"]
            : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

        const innerGrad = isDark
            ? ["rgba(22,22,22,0.55)", "rgba(12,12,12,0.40)"]
            : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

        const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

        return {
            axis,
            grid,
            legend,
            border,
            cardGrad,
            innerGrad,
            cost: "#ef4444",
            manual: "#10b981",
            estimate: "#f59e0b",
            tooltipBg: isDark ? "rgba(5,5,5,0.94)" : "rgba(255,255,255,0.98)",
        };
    }, [isDark]);

    const safe = Array.isArray(data) ? data : [];

    const maxY = useMemo(() => {
        let m = 0;
        for (const d of safe) {
            m = Math.max(m, Number(d.cost ?? 0), Number(d.manual ?? 0), Number(d.estimate ?? 0));
        }
        return m <= 0 ? 10 : m;
    }, [safe]);

    // ----- Layout constants (UNCHANGED) -----
    const BAR_W = 12;
    const INNER_SPACING = 2;
    const INITIAL_SPACING = 10;
    const GROUP_SPACING = 10;
    const Y_AXIS_LABEL_W = 48;

    const BARS_W = BAR_W * 3 + INNER_SPACING * 2;
    const END_SPACING = Math.max(75, Math.ceil(BARS_W / 2) + 16);

    // The chart scrolls horizontally, so there's no need to skip labels to
    // fit a fixed width — every day gets its own label regardless of range.
    const labelStep = 1;

    // --- Tooltip + scroll state ---
    const [scrollX, setScrollX] = useState(0);
    const [selected, setSelected] = useState<null | { dayIdx: number; meta: Meta }>(null);
    const [viewportW, setViewportW] = useState(0);

    const TOOLTIP_W = 220;
    const TOOLTIP_TOP = 6;
    const TOOLTIP_PAD = 8;

    const tooltipLeft = useMemo(() => {
        if (!selected) return 0;

        const groupStartX = INITIAL_SPACING + selected.dayIdx * (BARS_W + GROUP_SPACING);
        const anchorXInContent = groupStartX + BARS_W / 2;
        const anchorXInViewport = anchorXInContent - scrollX;
        const desiredLeft = anchorXInViewport - TOOLTIP_W / 2;

        const maxLeft = Math.max(0, viewportW - TOOLTIP_W);
        return clamp(desiredLeft, TOOLTIP_PAD, maxLeft - TOOLTIP_PAD);
    }, [selected, scrollX, viewportW, INITIAL_SPACING, BARS_W, GROUP_SPACING]);

    // measure container width (same behavior you had)
    const [chartW, setChartW] = useState(0);

    const chartContentW = useMemo(() => {
        const n = safe.length;
        const w = INITIAL_SPACING + n * BARS_W + Math.max(0, n - 1) * GROUP_SPACING + END_SPACING;
        return Math.max(chartW, w);
    }, [safe.length, chartW, INITIAL_SPACING, BARS_W, GROUP_SPACING, END_SPACING]);

    // Default to showing the most recent days (the right edge) instead of
    // making people manually swipe all the way over from the oldest day.
    // scrollToEnd (not a manually computed x) so it always matches the
    // ScrollView's real rendered content width, even if that ends up
    // slightly wider than our own chartContentW estimate.
    const scrollRef = useRef<ScrollView>(null);
    useEffect(() => {
        if (chartContentW <= chartW) return;
        const t = setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: false });
        }, 0);
        return () => clearTimeout(t);
    }, [safe.length, chartContentW, chartW]);

    // ---- Tap-to-dismiss logic (this is the important part) ----
    const barTapAtRef = useRef(0);
    const touchStartRef = useRef({ x: 0, y: 0, t: 0 });

    const onBarPress = useCallback((dayIdx: number, meta: Meta) => {
        barTapAtRef.current = Date.now();
        setSelected({ dayIdx, meta });
    }, []);

    const makeLabelComponent = useCallback(
        (show: boolean, dayKey: string) => {
            if (!show) return () => <View style={{ height: 40 }} />;

            return () => (
                <View
                    style={{
                        width: BARS_W,
                        alignItems: "center",
                        marginLeft: -((BARS_W - BAR_W) / 2),
                    }}
                >
                    <Text numberOfLines={1} style={{ color: ui.axis, fontSize: 11, fontWeight: "700" as any }}>
                        {formatDayShort(dayKey)}
                    </Text>
                    <Text numberOfLines={1} style={{ color: ui.axis, fontSize: 10, fontWeight: "800" as any, letterSpacing: 0.3, marginTop: 2 }}>
                        {weekdayShort(dayKey)}
                    </Text>
                </View>
            );
        },
        [BARS_W, BAR_W, ui.axis]
    );

    const chartData = useMemo(() => {
        const out: any[] = [];

        for (let i = 0; i < safe.length; i++) {
            const d = safe[i];

            const cost = Number(d.cost ?? 0);
            const manual = Number(d.manual ?? 0);
            const estimate = Number(d.estimate ?? 0);

            const meta: Meta = { dayKey: d.dayKey, cost, manual, estimate, dayIdx: i };
            const show = i % labelStep === 0;

            out.push({
                value: cost,
                frontColor: ui.cost,
                onPress: () => onBarPress(i, meta),
            });

            out.push({
                value: manual,
                frontColor: ui.manual,
                onPress: () => onBarPress(i, meta),
                labelComponent: makeLabelComponent(show, d.dayKey),
            });

            out.push({
                value: estimate,
                frontColor: ui.estimate,
                onPress: () => onBarPress(i, meta),
            });

            if (i !== safe.length - 1) {
                out.push({
                    value: 0,
                    barWidth: GROUP_SPACING,
                    frontColor: "transparent",
                    disablePress: true,
                });
            }
        }

        return out;
    }, [safe, ui.cost, ui.manual, ui.estimate, labelStep, GROUP_SPACING, onBarPress, makeLabelComponent]);

    return (
        <View style={[styles.wrap, { borderColor: ui.border }]}>
            <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
                <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

                <View style={[styles.inner, { borderColor: ui.border }]}>
                    <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

                    <View style={styles.legendRow}>
                        <LegendPill label="Cost" color={ui.cost} textColor={ui.legend} />
                        <LegendPill label="Actual" color={ui.manual} textColor={ui.legend} />
                        <LegendPill label="Estimate" color={ui.estimate} textColor={ui.legend} />
                    </View>

                    <View
                        style={styles.chartBox}
                        onLayout={(e) => {
                            setViewportW(e.nativeEvent.layout.width);
                            // chartBox paddingHorizontal 6 => minus 12
                            setChartW(Math.max(0, e.nativeEvent.layout.width - 12));
                        }}
                        // only intercept taps when tooltip is visible
                        onStartShouldSetResponderCapture={() => !!selected}
                        onResponderGrant={(e) => {
                            const { pageX, pageY } = e.nativeEvent;
                            touchStartRef.current = { x: pageX, y: pageY, t: Date.now() };
                        }}
                        onResponderRelease={(e) => {
                            if (!selected) return;

                            // if bar pressed very recently, don't close
                            if (Date.now() - barTapAtRef.current < 250) return;

                            const { pageX, pageY } = e.nativeEvent;
                            const dx = Math.abs(pageX - touchStartRef.current.x);
                            const dy = Math.abs(pageY - touchStartRef.current.y);
                            const dt = Date.now() - touchStartRef.current.t;

                            // close only on tap, not scroll drag
                            const isTap = dx < 8 && dy < 8 && dt < 300;
                            if (isTap) setSelected(null);
                        }}
                    >
                        {/* Tooltip overlay */}
                        {selected && (
                            <View
                                pointerEvents="none"
                                style={[
                                    styles.tooltip,
                                    {
                                        width: TOOLTIP_W,
                                        left: tooltipLeft,
                                        top: TOOLTIP_TOP,
                                        borderColor: ui.border,
                                        backgroundColor: ui.tooltipBg,
                                        position: "absolute",
                                        zIndex: 9999,
                                    },
                                ]}
                            >
                                <Text style={{ color: ui.legend, fontWeight: "900", fontSize: 12 }}>{formatDayShort(selected.meta.dayKey)}</Text>

                                <View style={{ height: 8 }} />
                                <TooltipRow label="Cost" color={ui.cost} value={selected.meta.cost} textColor={ui.legend} />
                                <TooltipRow label="Actual" color={ui.manual} value={selected.meta.manual} textColor={ui.legend} />
                                <TooltipRow label="Estimate" color={ui.estimate} value={selected.meta.estimate} textColor={ui.legend} />
                            </View>
                        )}

                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            nestedScrollEnabled
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ width: chartContentW }}
                            scrollEventThrottle={16}
                            onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
                        >
                            <View style={{ width: chartContentW }}>
                                <BarChart
                                    width={chartContentW}
                                    height={320}
                                    data={chartData}
                                    barWidth={BAR_W}
                                    spacing={INNER_SPACING}
                                    initialSpacing={INITIAL_SPACING}
                                    endSpacing={END_SPACING}
                                    roundedTop
                                    disableScroll
                                    yAxisThickness={0}
                                    xAxisThickness={1}
                                    xAxisColor={ui.grid}
                                    yAxisTextStyle={{ color: ui.axis, fontSize: 11, fontWeight: "600" as any }}
                                    rulesType="dashed"
                                    rulesColor={ui.grid}
                                    noOfSections={4}
                                    maxValue={maxY * 1.15}
                                    yAxisLabelWidth={Y_AXIS_LABEL_W}
                                    formatYLabel={(v) => formatAxisMoney(Number(v))}
                                    xAxisLabelsHeight={40}
                                    labelsDistanceFromXaxis={20}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        borderRadius: 18,
        overflow: "hidden",
        // borderWidth: StyleSheet.hairlineWidth,
    },
    card: {
        borderRadius: 18,
        overflow: "hidden",
    },
    inner: {
        borderRadius: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        paddingTop: 10,
        paddingBottom: 12,
        overflow: "visible",
    },
    legendRow: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 12,
        paddingBottom: 6,
        alignItems: "center",
        flexWrap: "wrap",
    },
    chartBox: {
        width: "100%",
        paddingHorizontal: 6,
        paddingTop: 6,
        paddingBottom: 10,
        position: "relative",
    },
    tooltip: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        // borderWidth: StyleSheet.hairlineWidth,
        maxWidth: 220,
    },
});