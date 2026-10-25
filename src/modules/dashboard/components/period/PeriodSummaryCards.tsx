import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "../../../../context/ThemeContext";
import { useGlassStyle } from "../../../../context/GlassStyleContext";
import { money0, DASHBOARD_ACCENT } from "./formatters";

type Props = {
    rangeLabel: string;
    totalCost: number;
    manualIncome: number;
    estimatedIncome: number;
    // Currently displayed dashboard period (YYYY-MM-DD), so tapping a tile
    // lands on a pre-filtered list instead of showing every row ever.
    periodFrom?: string;
    periodTo?: string;
};

function SummaryTile(props: {
    title: string;
    value: number;
    valueColor: string;
    ui: { text: string; sub: string; border: string; tileBg: string };
    glassStyle: "clear" | "regular";
    isDark: boolean;
    onPress: () => void;
}) {
    return (
        // Tapping jumps to the screen this number comes from — Cost tile to
        // the Cost tab, Actual/Estimate tiles to Income pre-filtered by type.
        <Pressable
            style={({ pressed }) => [{ flex: 1 }, { opacity: pressed ? 0.85 : 1 }]}
            onPress={props.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${props.title}: ${money0(props.value)}`}
        >
            <GlassView
                glassEffectStyle={props.glassStyle}
                isInteractive
                tintColor={props.ui.tileBg}
                colorScheme={props.isDark ? "dark" : "light"}
                style={styles.tile}
            >
                <Text style={[styles.tileTitle, { color: props.ui.sub }]} numberOfLines={1}>
                    {props.title}
                </Text>
                <Text style={[styles.tileValue, { color: props.valueColor }]} numberOfLines={1}>
                    {money0(props.value)}
                </Text>
            </GlassView>
        </Pressable>
    );
}

export function PeriodSummaryCards(props: Props) {
    const { resolvedTheme } = useTheme();
    const { glassStyle } = useGlassStyle();
    const isDark = resolvedTheme === "dark";
    const router = useRouter();

    const dateParams = useMemo(() => {
        const p: Record<string, string> = {};
        if (props.periodFrom) p.from = props.periodFrom;
        if (props.periodTo) p.to = props.periodTo;
        return p;
    }, [props.periodFrom, props.periodTo]);

    const ui = useMemo(() => {
        const text = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";
        const sub = isDark ? "rgba(148,163,184,0.82)" : "rgba(33, 35, 37, 0.92)";
        const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

        const cardGrad = isDark
            ? ["rgba(5,5,5,0.58)", "rgba(18,18,18,0.46)", "rgba(5,5,5,0.38)"]
            : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

        const innerGrad = isDark
            ? ["rgba(22,22,22,0.55)", "rgba(12,12,12,0.40)"]
            : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

        const tileBg = isDark ? "rgba(22,22,22,0.60)" : "rgba(237,237,237,0.95)";

        return { text, sub, border, cardGrad, innerGrad, tileBg };
    }, [isDark]);

    return (
        <View style={[styles.wrap, { borderColor: ui.border }]}>
            <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
                <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

                <View style={[styles.inner, { borderColor: ui.border }]}>
                    <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

                    <View style={styles.grid}>
                        <SummaryTile
                            title="Cost"
                            value={props.totalCost}
                            valueColor={DASHBOARD_ACCENT.cost}
                            ui={ui}
                            glassStyle={glassStyle}
                            isDark={isDark}
                            onPress={() => router.push({ pathname: "/cost", params: dateParams })}
                        />
                        <SummaryTile
                            title="Actual"
                            value={props.manualIncome}
                            valueColor={isDark ? "#34d399" : "#059669"}
                            ui={ui}
                            glassStyle={glassStyle}
                            isDark={isDark}
                            onPress={() => router.push({ pathname: "/income", params: { source: "manual", ...dateParams } })}
                        />
                        <SummaryTile
                            title="Estimate"
                            value={props.estimatedIncome}
                            valueColor={isDark ? "#fbbf24" : "#d97706"}
                            ui={ui}
                            glassStyle={glassStyle}
                            isDark={isDark}
                            onPress={() => router.push({ pathname: "/income", params: { source: "estimate", ...dateParams } })}
                        />
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
        padding: 12,
        overflow: "hidden",
    },
    grid: {
        flexDirection: "row",
        gap: 10,
    },
    tile: {
        width: "100%",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    tileTitle: {
        fontSize: 13,
        fontWeight: "700",
    },
    tileValue: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: "700",
    },
});