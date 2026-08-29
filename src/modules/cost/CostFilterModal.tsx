import React, { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { useGlassStyle } from "@/src/context/GlassStyleContext";
import { Picker } from "@react-native-picker/picker";
import { DateRangePicker } from "@/src/components/DateRangePicker";
import { typography } from "@/src/theme/typography";

export type SortBy = "date" | "amount" | "name";
export type SortOrder = 1 | -1;

export type CostFiltersDraft = {
    paidBy: string; // "all" or memberId
    onlyMine: boolean;
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
    sortBy: SortBy;
    sortOrder: SortOrder;
};

type HouseMember = { _id: string; name: string; email: string };

type Props = {
    open: boolean;
    members: HouseMember[];
    draft: CostFiltersDraft;
    setDraft: (next: CostFiltersDraft) => void;
    onApply: () => void;
    onClear: () => void;
    onClose: () => void;
};

function isInvalidRange(from: string, to: string) {
    return !!from && !!to && from > to;
}

export default function CostFilterModal({
    open,
    members,
    draft,
    setDraft,
    onApply,
    onClear,
    onClose,
}: Props) {
    const { resolvedTheme } = useTheme();
    const { glassStyle } = useGlassStyle();
    const isDark = resolvedTheme === "dark";

    const T = useMemo(() => {
        const surfaceGrad = isDark
            ? ["rgba(15,23,42,0.14)", "rgba(2,6,23,0.08)"]
            : ["rgba(255,255,255,0.16)", "rgba(255,255,255,0.08)"];

        const glassFallback = isDark ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.88)";
        const ring = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
        const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
        const muted = isDark ? "rgba(148,163,184,0.95)" : "#64748B";
        const tile = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
        const danger = "rgba(239,68,68,0.95)";
        const primary = "#4F46E5";
        return { surfaceGrad, glassFallback, ring, text, muted, tile, danger, primary };
    }, [isDark]);

    const invalidRange = isInvalidRange(draft.from, draft.to);

    const uniqueMembers = useMemo(() => {
        const map = new Map<string, HouseMember>();
        for (const m of members || []) map.set(m._id, m);
        return Array.from(map.values());
    }, [members]);

    const pickerTextColor = isDark ? "#FFFFFF" : "#0F172A";

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

    return (
        <Modal
            visible={open}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            {/* Panel */}
            <View style={[styles.panelWrap, { paddingTop: 12, backgroundColor: isDark ? "#0a0a0a" : "#ffffff" }]}>
                <View style={styles.panelShadow}>
                    <View style={[styles.panel, { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.title, { color: T.text }]}>Filters</Text>
                            </View>
                        </View>

                        {/* Body (scrollable so date picker is reachable) */}
                        <ScrollView
                            style={styles.bodyScroll}
                            contentContainerStyle={styles.bodyContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Paid by */}
                            <View>
                                <Text style={[styles.label, { color: T.muted }]}>Paid by</Text>
                                <View style={[styles.tile, { backgroundColor: T.tile, borderColor: T.ring }]}>
                                    <Picker
                                        selectedValue={draft.paidBy}
                                        onValueChange={(v) => setDraft({ ...draft, paidBy: String(v) })}
                                        dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
                                        style={{
                                            color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
                                        }}
                                        itemStyle={{
                                            color: isDark ? "#FFFFFF" : "#0F172A",
                                            fontSize: 16,
                                        }}
                                    >
                                        <Picker.Item label="All" value="all" />
                                        {uniqueMembers.map((m) => (
                                            <Picker.Item key={m._id} label={m.name} value={m._id} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Only mine */}
                            <View style={[styles.rowBetween, styles.tile, { backgroundColor: T.tile, borderColor: T.ring }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.switchTitle, { color: T.text }]}>Only mine</Text>
                                    <Text style={[styles.switchSub, { color: T.muted }]}>Show costs that affect you only.</Text>
                                </View>
                                <Switch
                                    value={draft.onlyMine}
                                    onValueChange={(v) => setDraft({ ...draft, onlyMine: v })}
                                />
                            </View>

                            {/* Date range */}
                            <View>
                                <View style={styles.dateRangeHeader}>
                                    <Text style={[styles.label, { color: T.muted, marginBottom: 0 }]}>Date range</Text>
                                    {draft.from ? (
                                        <Pressable
                                            onPress={() => setDraft({ ...draft, from: "", to: "" })}
                                            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                                        >
                                            <Text style={[styles.clearRangeText, { color: T.text }]}>Clear</Text>
                                        </Pressable>
                                    ) : null}
                                </View>

                                <Text style={[styles.rangeSummary, { color: draft.from ? T.text : T.muted }]}>
                                    {draft.from
                                        ? draft.to && draft.to !== draft.from
                                            ? `${draft.from} → ${draft.to}`
                                            : draft.from
                                        : "Tap a start day, then an end day"}
                                </Text>

                                <DateRangePicker
                                    from={draft.from}
                                    to={draft.to}
                                    onChange={(next) => setDraft({ ...draft, ...next })}
                                    isDark={isDark}
                                    text={T.text}
                                    muted={T.muted}
                                    tile={T.tile}
                                    ring={T.ring}
                                    primary={T.primary}
                                />
                            </View>

                            {/* Sort */}
                            <View>
                                <Text style={[styles.label, { color: T.muted }]}>Sort</Text>
                                <View style={{ flexDirection: "row", gap: 10 }}>
                                    <View style={[styles.tile, { flex: 1, backgroundColor: T.tile, borderColor: T.ring }]}>
                                        <Picker
                                            selectedValue={draft.sortBy}
                                            onValueChange={(v) => setDraft({ ...draft, sortBy: v as any })}
                                            dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
                                            style={{
                                                color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
                                            }}
                                            itemStyle={{
                                                color: isDark ? "#FFFFFF" : "#0F172A",
                                                fontSize: 16,
                                            }}
                                        >
                                            <Picker.Item label="Date" value="date" />
                                            <Picker.Item label="Amount" value="amount" />
                                            <Picker.Item label="Name" value="name" />
                                        </Picker>
                                    </View>

                                    <Pressable
                                        onPress={() => setDraft({ ...draft, sortOrder: draft.sortOrder === -1 ? 1 : -1 })}
                                        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                                    >
                                        <GlassView
                                            glassEffectStyle={glassStyle}
                                            isInteractive
                                            colorScheme={isDark ? "dark" : "light"}
                                            style={[styles.sortDirBtn, { borderColor: T.ring }]}
                                        >
                                            <Text style={[styles.sortDirText, { color: T.text }]}>
                                                {draft.sortOrder === -1 ? "↓" : "↑"}
                                            </Text>
                                        </GlassView>
                                    </Pressable>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer (pinned) */}
                        <View
                            style={[
                                styles.footer,
                                {
                                    borderTopColor: T.ring,
                                    paddingTop: 14,
                                    paddingBottom: 40,
                                },
                            ]}
                        >
                            <Pressable
                                onPress={onClear}
                                style={({ pressed }) => [{ flex: 1 }, { opacity: pressed ? 0.85 : 1 }]}
                            >
                                <GlassView
                                    glassEffectStyle={glassStyle}
                                    isInteractive
                                    tintColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.045)"}
                                    colorScheme={isDark ? "dark" : "light"}
                                    style={[styles.btnGhost, { borderColor: T.ring }]}
                                >
                                    <Text style={[styles.btnGhostText, { color: T.text }]}>Clear</Text>
                                </GlassView>
                            </Pressable>

                            <Pressable
                                disabled={invalidRange}
                                onPress={onApply}
                                style={({ pressed }) => [{ flex: 1 }, { opacity: invalidRange ? 0.4 : pressed ? 0.88 : 1 }]}
                            >
                                <GlassView
                                    glassEffectStyle={glassStyle}
                                    isInteractive={!invalidRange}
                                    tintColor={T.primary}
                                    colorScheme={isDark ? "dark" : "light"}
                                    style={styles.btnPrimary}
                                >
                                    <Text style={styles.btnPrimaryText}>Apply</Text>
                                </GlassView>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    panelWrap: {
        ...StyleSheet.absoluteFillObject,
    },

    panelShadow: {
        flex: 1,
        borderRadius: 22,
        overflow: "hidden", // ✅ keep clean corners
        shadowColor: "#000",
        shadowOpacity: 0.22,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
    },

    panel: {
        flex: 1,
        // borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
    },

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingBottom: 10,
    },
    title: { ...typography.headline },
    subtitle: { ...typography.caption1, marginTop: 2 },

    iconBtn: {
        height: 34,
        width: 34,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    bodyScroll: {
        flex: 1,
        minHeight: 0,
    },
    bodyContent: {
        flexGrow: 1,
        gap: 12,
        paddingBottom: 12,
    },

    label: { ...typography.caption1, fontWeight: "700", marginBottom: 6 },

    tile: {
        borderRadius: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        overflow: "hidden",
    },

    rowBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
    },

    switchTitle: { ...typography.footnoteEmphasized },
    switchSub: { ...typography.caption1, marginTop: 2 },

    dateRangeHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    clearRangeText: { ...typography.footnoteEmphasized },
    rangeSummary: { ...typography.subheadlineEmphasized, marginBottom: 8 },

    sortDirBtn: {
        width: 56,
        minHeight: 44,
        borderRadius: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    sortDirText: { ...typography.bodyEmphasized },

    footer: {
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },

    btnGhost: {
        flex: 1,
        minHeight: 38,
        borderRadius: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    btnGhostText: { ...typography.footnoteEmphasized },

    btnPrimary: {
        flex: 1,
        minHeight: 38,
        borderRadius: 16,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    btnPrimaryText: { ...typography.footnoteEmphasized, color: "#fff" },
});