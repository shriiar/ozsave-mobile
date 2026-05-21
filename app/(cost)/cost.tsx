// app/cost.tsx
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import DashboardShell from "../../src/modules/shell/DashboardShell";

import CostFilterModal, { CostFiltersDraft } from "@/src/modules/cost/CostFilterModal";
import AddCostModal from "@/src/modules/cost/AddCostModal";
import EditCostModal from "@/src/modules/cost/EditCostModal";
import DeleteCostModal from "@/src/modules/cost/DeleteCostModal";
import type { CostRow } from "../../src/modules/cost/api";
import { useInfiniteCosts } from "../../src/modules/cost/hooks/useCostApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    onPress,
    onDelete,
    onSwipeStart,
    onSwipeOpen,
    onSwipeClose,
}: {
    item: CostRow;
    isDark: boolean;
    onPress: (id: string) => void;
    onDelete: (id: string, name: string) => void;
    onSwipeStart: (id: string) => void;
    onSwipeOpen: (id: string, closeFn: () => void) => void;
    onSwipeClose: (id: string) => void;
}) {
    const swipeRef = useRef<Swipeable>(null);
    const closeSelf = () => swipeRef.current?.close();

    const T = useMemo(() => {
        const cardGrad = isDark
            ? ["rgba(15,23,42,0.55)", "rgba(2,6,23,0.35)"]
            : ["rgba(255,255,255,0.72)", "rgba(255,255,255,0.48)"];

        const ring = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
        const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
        const muted = isDark ? "rgba(148,163,184,0.95)" : "rgba(42,45,49,0.95)";
        const chipBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(24,24,24,0.04)";

        // const shadow = isDark
        //     ? {
        //         shadowColor: "#000",
        //         shadowOpacity: 0.55,
        //         shadowRadius: 26,
        //         shadowOffset: { width: 0, height: 14 },
        //         elevation: 14,
        //     }
        //     : {
        //         shadowColor: "#000",
        //         shadowOpacity: 0.12,
        //         shadowRadius: 18,
        //         shadowOffset: { width: 0, height: 10 },
        //         elevation: 9,
        //     };

        return { cardGrad, ring, text, muted, chipBg };
    }, [isDark]);

    function renderRightActions(
        progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>
    ) {
        const opacity = progress.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0, 0.65, 1],
            extrapolate: "clamp",
        });

        const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
            extrapolate: "clamp",
        });

        const translateX = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
            extrapolate: "clamp",
        });

        return (
            <View style={styles.swipeActionsWrap}>
                <Animated.View style={[styles.deleteAction, { opacity, transform: [{ translateX }, { scale }] }]}>
                    <Pressable
                        onPress={() => {
                            // close swipe first so it doesn't look broken under modal
                            swipeRef.current?.close();
                            onDelete(item._id, item.name);
                        }}
                        style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.86 : 1 }]}
                        hitSlop={10}
                    >
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                    </Pressable>
                </Animated.View>
            </View>
        );
    }

    return (
        <Swipeable
            ref={swipeRef}
            renderRightActions={renderRightActions}
            rightThreshold={28}
            overshootRight={false}
            friction={1.8}
            activeOffsetX={[-12, 12]}
            failOffsetY={[-10, 10]}
            dragOffsetFromRightEdge={24}
            onSwipeableOpenStartDrag={() => onSwipeStart(item._id)}
            onSwipeableOpen={() => onSwipeOpen(item._id, closeSelf)}
            onSwipeableClose={() => onSwipeClose(item._id)}
        >
            <Pressable
                onPress={() => {
                    swipeRef.current?.close();
                    onPress(item._id);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
            >
                <View style={styles.cardWrap}>
                    <GlassView
                        glassEffectStyle="clear"
                        colorScheme={isDark ? "dark" : "light"}
                        style={[styles.card, { borderColor: T.ring }]}
                    >
                        {/* base glass gradient */}
                        <LinearGradient
                            colors={T.cardGrad as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* subtle right bubble like your reference */}
                        <View
                            pointerEvents="none"
                            style={[
                                styles.rightBubble,
                                { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
                            ]}
                        />

                        <View style={styles.row}>
                            {/* Avatar */}
                            <View
                                style={[
                                    styles.avatar,
                                    {
                                        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                                        borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="receipt-outline"
                                    size={18}
                                    color={isDark ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.85)"}
                                />
                            </View>

                            {/* Middle content */}
                            <View style={styles.mid}>
                                <Text style={[styles.TextHero, { color: T.text }]} numberOfLines={1}>
                                    {item.name}
                                </Text>

                                <Text style={[styles.subText, { color: T.muted }]} numberOfLines={1}>
                                    {formatDate(item.date)}
                                </Text>

                                <View style={styles.miniStatsRow}>
                                    <View style={[styles.miniPill, { backgroundColor: T.chipBg }]}>
                                        <Text style={[styles.miniPillText, { color: T.muted }]} numberOfLines={1}>
                                            Your share: {money(item.userShare)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Right badge */}
                            <View
                                style={[
                                    styles.rightBadge,
                                    { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)" },
                                ]}
                            >
                                <Text style={[styles.badgeTop, { color: T.text }]}>Total</Text>
                                <Text style={[styles.badgeBottom, { color: T.muted }]}>{money(item.amount)}</Text>
                            </View>
                        </View>
                    </GlassView>
                </View>
            </Pressable>
        </Swipeable>
    );
}

export default function CostScreen() {

    const { user } = useAuth();
    const members = useMemo(() => ((user as any)?.house?.members ?? []), [user]);

    const [filtersOpen, setFiltersOpen] = useState(false);

    const insets = useSafeAreaInsets();
    const TOPBAR_H = 52;
    const bottomSpace = TOPBAR_H + insets.bottom + 16;
    const [headerHeight, setHeaderHeight] = useState(insets.top + 92);
    const headerGap = 8;

    const swipeRefs = useRef<Record<string, () => void>>({});
    // draft filters (UI)
    const [draft, setDraft] = useState<CostFiltersDraft>({
        paidBy: "all",
        onlyMine: false,
        from: "",
        to: "",
        sortBy: "date",
        sortOrder: -1,
    });

    // applied filters (used for query)
    const [applied, setApplied] = useState<CostFiltersDraft>({
        paidBy: "all",
        onlyMine: false,
        from: "",
        to: "",
        sortBy: "date",
        sortOrder: -1,
    });

    const emptyFilters: CostFiltersDraft = {
        paidBy: "all",
        onlyMine: false,
        from: "",
        to: "",
        sortBy: "date",
        sortOrder: -1,
    };

    function isSameFilters(a: CostFiltersDraft, b: CostFiltersDraft) {
        return (
            a.paidBy === b.paidBy &&
            a.onlyMine === b.onlyMine &&
            a.from === b.from &&
            a.to === b.to &&
            a.sortBy === b.sortBy &&
            a.sortOrder === b.sortOrder
        );
    }

    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { refreshing, refreshUser } = useAuth();

    const spinner = isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.85)";
    const androidBg = isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.95)";

    const [limit] = useState(10);
    const [addOpen, setAddOpen] = useState(false);

    // edit modal
    const [editingCostId, setEditingCostId] = useState<string | null>(null);

    // delete modal
    const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

    // keep only one swipe open
    const openSwipe = useRef<{ id: string; close: () => void } | null>(null);

    function closeOpenSwipe() {
        openSwipe.current?.close?.();
        openSwipe.current = null;
    }

    function closeAllSwipes() {
        Object.values(swipeRefs.current).forEach((close) => close());
        swipeRefs.current = {};
    }

    function onSwipeStart(nextId: string) {
        if (openSwipe.current && openSwipe.current.id !== nextId) closeOpenSwipe();
    }

    function onSwipeOpen(id: string, closeFn: () => void) {
        Object.entries(swipeRefs.current).forEach(([key, close]) => {
            if (key !== id) close();
        });

        swipeRefs.current[id] = closeFn;
    }

    function onSwipeClose(id: string) {
        delete swipeRefs.current[id];
    }

    function openEdit(id: string) {
        closeOpenSwipe();
        setEditingCostId(id);
    }

    function closeEdit() {
        setEditingCostId(null);
    }

    function openDelete(id: string, name: string) {
        closeOpenSwipe();
        setDeleting({ id, name });
    }

    function closeDelete() {
        setDeleting(null);
    }
    const q = useInfiniteCosts({
        limit,
        paidBy: applied.paidBy === "all" ? undefined : applied.paidBy,
        isOnlyUserCost: applied.onlyMine ? true : undefined,
        from: applied.from || undefined,
        to: applied.to || undefined,
        sortBy: applied.sortBy,
        sortOrder: applied.sortOrder,
    } as any);

    const shownErrorRef = useRef<string | null>(null);

    useEffect(() => {
        const rawError = q.error as any;
        const message =
            rawError?.response?.data?.message ||
            rawError?.message ||
            null;

        if (!message) {
            shownErrorRef.current = null;
            return;
        }

        if (shownErrorRef.current === message) return;

        shownErrorRef.current = message;

        Toast.show({
            type: "error",
            text1: "Something went wrong",
            text2: message,
            position: "top",
            autoHide: false,
            onPress: () => Toast.hide(),
        });
    }, [q.error]);

    const rows: CostRow[] = useMemo(() => {
        const pages = q.data?.pages ?? [];
        const all = pages.flatMap((p: any) => p.data ?? []);

        const map = new Map<string, CostRow>();
        for (const r of all) map.set(String(r._id), r); // later wins
        return Array.from(map.values());
    }, [q.data]);

    const isInitialLoading = q.isLoading && rows.length === 0;

    async function onRefresh() {
        await refreshUser();
        await q.refreshTop();
    }

    function onEndReached() {
        if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
    }

    function ListFooter() {
        // Nothing to load
        if (!q.hasNextPage) return <View style={{ height: 10 }} />;

        // Show spinner while fetching next page
        if (q.isFetchingNextPage) {
            return (
                <View style={{ paddingTop: 12, paddingBottom: bottomSpace }}>
                    <ActivityIndicator color={spinner} />
                </View>
            );
        }

        // Not currently loading, but reserve a little space
        return <View style={{ height: 12 }} />;
    }

    return (
        <DashboardShell>
            <View style={styles.screen}>
                <GlassView
                    glassEffectStyle="regular"
                    colorScheme={isDark ? "dark" : "light"}
                    onLayout={(e) => {
                        const next = Math.ceil(e.nativeEvent.layout.height);
                        if (next > 0 && next !== headerHeight) setHeaderHeight(next);
                    }}
                    style={[
                        styles.topHeaderGlass,
                        {
                            paddingTop: insets.top + 20,
                            borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        },
                    ]}
                >
                    <View style={[styles.headerRow, { marginBottom: 10 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.h1, { color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" }]}>
                                Costs
                            </Text>
                            <Text style={[styles.h2, { color: isDark ? "rgba(148,163,184,0.95)" : "#64748B" }]}>
                                Track shared costs for this house.
                            </Text>
                        </View>

                        <Pressable
                            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
                            onPress={() => setFiltersOpen(true)}
                        >
                            <GlassView
                                glassEffectStyle="clear"
                                colorScheme={isDark ? "dark" : "light"}
                                style={[
                                    styles.filterBtn,
                                    { borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)" }
                                ]}
                            >
                                <Ionicons
                                    name="options-outline"
                                    size={16}
                                    color={isDark ? "rgba(255,255,255,0.92)" : "#0F172A"}
                                />
                                <Text
                                    style={[
                                        styles.filterBtnText,
                                        { color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" },
                                    ]}
                                >
                                    Filters
                                </Text>
                            </GlassView>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
                            onPress={() => setAddOpen(true)}
                        >
                            <GlassView
                                glassEffectStyle="clear"
                                colorScheme={isDark ? "dark" : "light"}
                                style={[
                                    styles.addBtn,
                                    { borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)" }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.addBtnText,
                                        { color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" },
                                    ]}
                                >
                                    Add
                                </Text>
                            </GlassView>
                        </Pressable>
                    </View>
                </GlassView>

                {isInitialLoading ? (
                    <View
                        style={{
                            flex: 1,
                            paddingTop: headerHeight + headerGap,
                            paddingBottom: bottomSpace,
                        }}
                    >
                        <View style={styles.center}>
                            <ActivityIndicator />
                            <Text style={{ marginTop: 10, opacity: 0.7 }}>Loading costs...</Text>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        style={{ flex: 1 }}
                        data={rows}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingTop: headerHeight + headerGap,
                            paddingBottom: bottomSpace,
                            flexGrow: 1,
                        }}
                        alwaysBounceVertical
                        bounces
                        onScrollBeginDrag={closeAllSwipes}
                        onMomentumScrollBegin={closeAllSwipes}
                        renderItem={({ item }) => (
                            <CostCard
                                item={item}
                                isDark={isDark}
                                onPress={openEdit}
                                onDelete={openDelete}
                                onSwipeStart={onSwipeStart}
                                onSwipeOpen={onSwipeOpen}
                                onSwipeClose={onSwipeClose}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing || q.isRefetching}
                                onRefresh={onRefresh}
                                tintColor={spinner}
                                colors={[spinner]}
                                progressBackgroundColor={androidBg}
                                progressViewOffset={headerHeight + headerGap}
                            />
                        }
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.6}
                        ListFooterComponent={<ListFooter />}
                    />
                )}

                <CostFilterModal
                    open={filtersOpen}
                    members={members}
                    draft={draft}
                    setDraft={setDraft}
                    onClose={() => setFiltersOpen(false)}
                    onClear={() => {
                        const cleared: CostFiltersDraft = { ...emptyFilters };
                        const shouldRefetch = !isSameFilters(applied, cleared);

                        setDraft(cleared);
                        setApplied(cleared);
                        setFiltersOpen(false);

                        if (shouldRefetch) {
                            q.refreshTop();
                        }
                    }}
                    onApply={() => {
                        const shouldRefetch = !isSameFilters(applied, draft);
                        setApplied(draft);
                        setFiltersOpen(false);

                        if (shouldRefetch) {
                            q.refreshTop();
                        }
                    }}
                />

                <AddCostModal open={addOpen} onClose={() => setAddOpen(false)} />

                <EditCostModal open={!!editingCostId} costId={editingCostId} onClose={closeEdit} />

                <DeleteCostModal
                    open={!!deleting}
                    costId={deleting?.id ?? null}
                    costName={deleting?.name ?? ""}
                    onClose={closeDelete}
                    onDeleted={() => {
                        // simplest and correct for infinite cursor list
                        q.refetch();
                    }}
                />
            </View>
        </DashboardShell>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, paddingHorizontal: 14 },
    topHeaderGlass: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 18,
        paddingBottom: 0,
        borderRadius: 18,
        // borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingBottom: 10,
    },
    h1: { fontSize: 18, fontWeight: "700" },
    h2: { marginTop: 2, fontSize: 13, lineHeight: 18 },

    addBtn: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        overflow: "hidden",
        // borderWidth: StyleSheet.hairlineWidth,
    },
    addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    empty: { paddingVertical: 28, alignItems: "center" },

    cardWrap: { marginBottom: 12, borderRadius: 18 },

    card: {
        borderRadius: 18,
        overflow: "hidden",
        // borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
        position: "relative",
    },

    cardTopRow: { flexDirection: "row", alignItems: "flex-start" },
    cardTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.1 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    chipText: { fontSize: 12, fontWeight: "700" },

    cardBottomRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    amount: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },

    swipeActionsWrap: {
        width: 86,
        marginBottom: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteAction: {
        justifyContent: "center",
        alignItems: "center",
    },
    deleteBtn: {
        height: 56,
        width: 56,
        borderRadius: 18,
        backgroundColor: "rgba(239,68,68,0.95)",
        alignItems: "center",
        justifyContent: "center",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    avatar: {
        height: 44,
        width: 44,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        // borderWidth: StyleSheet.hairlineWidth,
    },

    mid: {
        flex: 1,
        minWidth: 0,
    },

    TextHero: {
        fontSize: 16,
        fontWeight: "700",
    },

    subText: {
        marginTop: 3,
        fontSize: 12.5,
        fontWeight: "700",
    },

    miniStatsRow: {
        marginTop: 10,
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },

    miniPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },

    miniPillText: {
        fontSize: 12,
        fontWeight: "800",
    },

    rightBadge: {
        width: 88,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "flex-end",
        justifyContent: "center",
    },

    badgeTop: {
        fontSize: 11,
        fontWeight: "900",
        opacity: 0.9,
    },

    badgeBottom: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: "800",
    },

    rightBubble: {
        position: "absolute",
        right: -24,
        top: -18,
        width: 170,
        height: 170,
        borderRadius: 999,
        transform: [{ rotate: "18deg" }],
    },

    filterBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        overflow: "hidden",
        // borderWidth: StyleSheet.hairlineWidth,
    },
    filterBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});