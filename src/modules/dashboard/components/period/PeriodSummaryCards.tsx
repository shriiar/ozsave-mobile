import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../../context/ThemeContext";

type Props = {
    rangeLabel: string;
    totalCost: number;
    manualIncome: number;
    estimatedIncome: number;
};

function money(n: number) {
    const v = Number(n ?? 0);
    if (!Number.isFinite(v)) return "$0";
    return `$${v}`;
}

function SummaryTile(props: {
    title: string;
    value: number;
    valueColor: string;
    ui: { text: string; sub: string; border: string; tileBg: string };
}) {
    return (
        <View style={[styles.tile, { borderColor: props.ui.border, backgroundColor: props.ui.tileBg }]}>
            <Text style={[styles.tileTitle, { color: props.ui.sub }]} numberOfLines={1}>
                {props.title}
            </Text>
            <Text style={[styles.tileValue, { color: props.valueColor }]} numberOfLines={1}>
                {money(props.value)}
            </Text>
        </View>
    );
}

export function PeriodSummaryCards(props: Props) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const ui = useMemo(() => {
        const text = isDark ? "rgba(226,232,240,0.92)" : "rgba(15,23,42,0.92)";
        const sub = isDark ? "rgba(148,163,184,0.82)" : "rgba(100,116,139,0.92)";
        const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

        const cardGrad = isDark
            ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
            : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

        const innerGrad = isDark
            ? ["rgba(15,23,42,0.35)", "rgba(2,6,23,0.20)"]
            : ["rgba(237,237,237,0.90)", "rgba(255,255,255,0.65)"];

        const tileBg = isDark ? "rgba(15,23,42,0.70)" : "rgba(237,237,237,0.95)";

        return { text, sub, border, cardGrad, innerGrad, tileBg };
    }, [isDark]);

    return (
        <View style={[styles.wrap, { borderColor: ui.border }]}>
            <BlurView intensity={isDark ? 26 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
                <LinearGradient colors={ui.cardGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

                <View style={[styles.inner, { borderColor: ui.border }]}>
                    <LinearGradient colors={ui.innerGrad as any} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

                    <View style={styles.grid}>
                        <SummaryTile title="Cost" value={props.totalCost} valueColor={"#ef4444"} ui={ui} />
                        <SummaryTile title="Manual" value={props.manualIncome} valueColor={"#10b981"} ui={ui} />
                        <SummaryTile title="Estimate" value={props.estimatedIncome} valueColor={"#f59e0b"} ui={ui} />
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
        borderWidth: StyleSheet.hairlineWidth,
    },
    card: {
        borderRadius: 18,
        overflow: "hidden",
    },
    inner: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 12,
        overflow: "hidden",
    },
    grid: {
        flexDirection: "row",
        gap: 10,
    },
    tile: {
        flex: 1,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
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