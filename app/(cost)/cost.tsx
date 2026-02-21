// app/cost.tsx
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import DashboardShell from "../../src/modules/shell/DashboardShell";
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";

import { useInfiniteCosts } from "../../src/modules/cost/hooks/useCostApi";
import type { CostRow } from "../../src/modules/cost/api";
import AddCostModal from "@/src/modules/cost/AddCostModal";

function money(n: number) {
    if (!Number.isFinite(n)) return "$0.00";
    return `$${n.toFixed(2)}`;
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return iso;
    }
}

function CostCard({
    item,
    isDark,
    onPressMenu,
}: {
    item: CostRow;
    isDark: boolean;
    onPressMenu: (id: string) => void;
}) {
    const T = useMemo(() => {
        const cardGrad = isDark
            ? ["rgba(15,23,42,0.55)", "rgba(2,6,23,0.35)"]
            : ["rgba(255,255,255,0.72)", "rgba(255,255,255,0.48)"];

        const ring = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
        const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
        const muted = isDark ? "rgba(148,163,184,0.95)" : "rgba(64, 69, 75, 0.95)";
        const chipBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

        const shadow = isDark
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.55,
                shadowRadius: 26,
                shadowOffset: { width: 0, height: 14 },
                elevation: 14,
            }
            : {
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 9,
            };

        return { cardGrad, ring, text, muted, chipBg, shadow };
    }, [isDark]);

    return (
        <View style={[styles.cardWrap, T.shadow]}>
            <BlurView
                intensity={isDark ? 18 : 26}
                tint={isDark ? "dark" : "light"}
                style={[styles.card, { borderColor: T.ring }]}
            >
                <LinearGradient
                    colors={T.cardGrad as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardTopRow}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={[styles.cardTitle, { color: T.text }]} numberOfLines={1}>
                            {item.name}
                        </Text>

                        <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                            <View>
                                <Text style={[styles.chipText, { color: T.muted }]}>{formatDate(item.date)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* <Pressable
            onPress={() => onPressMenu(item._id)}
            style={({ pressed }) => [
              styles.menuBtn,
              { backgroundColor: pressed ? "rgba(99,102,241,0.18)" : "rgba(0,0,0,0.04)" },
            ]}
            hitSlop={10}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={T.text} />
          </Pressable> */}
                </View>

                <View style={styles.cardBottomRow}>
                    <Text style={[styles.amount, { color: T.text }]}>{money(item.amount)}</Text>

                    <View style={[styles.chip, { backgroundColor: T.chipBg }]}>
                        <Text style={[styles.chipText, { color: T.muted }]}>
                            Your share: {money(item.userShare)}
                        </Text>
                    </View>
                </View>
            </BlurView>
        </View>
    );
}

export default function CostScreen() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { refreshing, refreshUser } = useAuth();

    const [limit] = useState(10);

    const [addOpen, setAddOpen] = useState(false);

    const q = useInfiniteCosts({ limit } as any);

    const rows: CostRow[] = useMemo(() => {
        const pages = q.data?.pages ?? [];
        return pages.flatMap((p: any) => p.data ?? []);
    }, [q.data]);

    const isInitialLoading = q.isLoading && rows.length === 0;

    async function onRefresh() {
        await refreshUser(); // optional, but matches your app pattern
        await q.refetch();
    }

    function onEndReached() {
        if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
    }

    return (
        <DashboardShell>
            <View style={[styles.screen, { paddingTop: 12 }]}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.h1, { color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" }]}>
                            Costs
                        </Text>
                        <Text style={[styles.h2, { color: isDark ? "rgba(148,163,184,0.95)" : "#64748B" }]}>
                            Track shared costs for this house.
                        </Text>
                    </View>

                    {/* TODO: open AddCostModal (you already have it) */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.addBtn,
                            { opacity: pressed ? 0.92 : 1 },
                        ]}
                        onPress={() => setAddOpen(true)}
                    >
                        <Text style={styles.addBtnText}>Add</Text>
                    </Pressable>
                </View>

                {isInitialLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator />
                        <Text style={{ marginTop: 10, opacity: 0.7 }}>Loading costs...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={rows}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        renderItem={({ item }) => (
                            <CostCard
                                item={item}
                                isDark={isDark}
                                onPressMenu={() => {
                                    // TODO: open bottom sheet / actions modal
                                }}
                            />
                        )}
                        refreshControl={<RefreshControl refreshing={refreshing || q.isRefetching} onRefresh={onRefresh} />}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.35}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={{ opacity: 0.7 }}>No costs yet.</Text>
                            </View>
                        }
                        ListFooterComponent={
                            q.isFetchingNextPage ? (
                                <View style={{ paddingVertical: 16 }}>
                                    <ActivityIndicator />
                                </View>
                            ) : null
                        }
                    />
                )}
                <AddCostModal open={addOpen} onClose={() => setAddOpen(false)} />
            </View>
        </DashboardShell>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        paddingHorizontal: 14,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingBottom: 10,
    },
    h1: { fontSize: 18, fontWeight: "800" },
    h2: { marginTop: 2, fontSize: 13, lineHeight: 18 },

    addBtn: {
        backgroundColor: "#4F46E5",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
    },
    addBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    empty: { paddingVertical: 28, alignItems: "center" },

    cardWrap: { marginBottom: 12, borderRadius: 18 },
    card: {
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
    },
    cardTopRow: { flexDirection: "row", alignItems: "flex-start" },
    cardTitle: { fontSize: 14, fontWeight: "800", letterSpacing: -0.1 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    chipText: { fontSize: 11, fontWeight: "700" },

    menuBtn: {
        height: 34,
        width: 34,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    cardBottomRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    amount: { fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
    amountMuted: { fontSize: 12, fontWeight: "700" },
});