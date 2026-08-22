import React, { useMemo, useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

function parseYMD(s: string): Date | null {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
}

function toYMD(dt: Date): string {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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
    const isDark = resolvedTheme === "dark";

    const insets = useSafeAreaInsets();

    const [picking, setPicking] = useState<null | "from" | "to">(null);

    const fromDate = useMemo(() => parseYMD(draft.from), [draft.from]);
    const toDate = useMemo(() => parseYMD(draft.to), [draft.to]);

    function openPicker(which: "from" | "to") {
        setPicking(which);
    }

    function closePicker() {
        setPicking(null);
    }

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
        <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            {/* Panel */}
            <View
                style={[
                    styles.panelWrap,
                    {
                        paddingTop: insets.top + 12,
                        paddingBottom: 0,
                        paddingHorizontal: 0,
                    },
                ]}
            >
                <View style={styles.panelShadow}>
                    <GlassView
                        glassEffectStyle="regular"
                        colorScheme={isDark ? "dark" : "light"}
                        style={[styles.panel, { borderColor: T.ring }]}
                    >
                        <LinearGradient
                            colors={T.surfaceGrad as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />

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
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.label, { color: T.muted }]}>From</Text>
                                    <Pressable
                                        onPress={() => openPicker("from")}
                                        style={({ pressed }) => [
                                            styles.input,
                                            { backgroundColor: T.tile, borderColor: T.ring, opacity: pressed ? 0.9 : 1 },
                                        ]}
                                    >
                                        <Text style={[styles.inputText, { color: draft.from ? T.text : T.muted }]}>
                                            {draft.from || "Select date"}
                                        </Text>
                                    </Pressable>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.label, { color: T.muted }]}>To</Text>
                                    <Pressable
                                        onPress={() => openPicker("to")}
                                        style={({ pressed }) => [
                                            styles.input,
                                            { backgroundColor: T.tile, borderColor: T.ring, opacity: pressed ? 0.9 : 1 },
                                        ]}
                                    >
                                        <Text style={[styles.inputText, { color: draft.to ? T.text : T.muted }]}>
                                            {draft.to || "Select date"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {invalidRange ? (
                                <View
                                    style={[
                                        styles.errorBox,
                                        {
                                            backgroundColor: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.10)",
                                            borderColor: T.danger,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.errorText,
                                            { color: isDark ? "rgba(252,165,165,0.95)" : "rgba(185,28,28,0.95)" },
                                        ]}
                                    >
                                        Invalid date range: "From" must be before "To".
                                    </Text>
                                </View>
                            ) : null}

                            {/* Inline picker block */}
                            {picking ? (
                                <View style={[styles.pickerWrap, { borderColor: T.ring, backgroundColor: T.tile }]}>
                                    <View style={styles.pickerHeader}>
                                        <Text style={[styles.pickerTitle, { color: T.text }]}>
                                            {picking === "from" ? "Pick From date" : "Pick To date"}
                                        </Text>

                                        {/* iOS inline needs a close action, Android closes on selection */}
                                        {Platform.OS === "ios" ? (
                                            <Pressable onPress={closePicker} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                                                <Text style={[styles.pickerDone, { color: T.text }]}>Done</Text>
                                            </Pressable>
                                        ) : null}
                                    </View>

                                    <DateTimePicker
                                        value={(picking === "from" ? fromDate : toDate) ?? new Date()}
                                        mode="date"
                                        display={Platform.OS === "ios" ? "inline" : "default"}
                                        textColor={pickerTextColor as any}
                                        // @ts-ignore
                                        themeVariant={isDark ? "dark" : "light"}
                                        onChange={(_, selected) => {
                                            if (!selected) return;
                                            const next = toYMD(selected);

                                            if (picking === "from") setDraft({ ...draft, from: next });
                                            else setDraft({ ...draft, to: next });

                                            if (Platform.OS !== "ios") closePicker();
                                        }}
                                    />
                                </View>
                            ) : null}

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
                                            glassEffectStyle="clear"
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
                                    paddingBottom: Math.max(insets.bottom, 10) + 22,
                                },
                            ]}
                        >
                            <Pressable
                                onPress={() => {
                                    closePicker();
                                    onClear();
                                }}
                                style={({ pressed }) => [{ flex: 1 }, { opacity: pressed ? 0.85 : 1 }]}
                            >
                                <GlassView
                                    glassEffectStyle="clear"
                                    isInteractive
                                    colorScheme={isDark ? "dark" : "light"}
                                    style={[styles.btnGhost, { borderColor: T.ring }]}
                                >
                                    <Text style={[styles.btnGhostText, { color: T.text }]}>Clear</Text>
                                </GlassView>
                            </Pressable>

                            <Pressable
                                disabled={invalidRange}
                                onPress={() => {
                                    closePicker();
                                    onApply();
                                }}
                                style={({ pressed }) => [{ flex: 1 }, { opacity: invalidRange ? 0.4 : pressed ? 0.88 : 1 }]}
                            >
                                <GlassView
                                    glassEffectStyle="regular"
                                    isInteractive={!invalidRange}
                                    tintColor={T.primary}
                                    colorScheme={isDark ? "dark" : "light"}
                                    style={styles.btnPrimary}
                                >
                                    <Text style={styles.btnPrimaryText}>Apply</Text>
                                </GlassView>
                            </Pressable>
                        </View>
                    </GlassView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.40)",
    },

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
    title: { fontSize: 16, fontWeight: "700" },
    subtitle: { marginTop: 2, fontSize: 12.5, fontWeight: "700" },

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

    label: { fontSize: 12, fontWeight: "800", marginBottom: 6 },

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

    switchTitle: { fontSize: 13.5, fontWeight: "700" },
    switchSub: { marginTop: 2, fontSize: 12, fontWeight: "700" },

    input: {
        height: 44,
        borderRadius: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    inputText: { fontSize: 12.5, fontWeight: "800" },

    pickerWrap: {
        borderRadius: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        overflow: "hidden",
        paddingBottom: 8,
    },
    pickerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
    },
    pickerTitle: {
        fontSize: 12.5,
        fontWeight: "700",
    },
    pickerDone: {
        fontSize: 12.5,
        fontWeight: "700",
    },

    sortDirBtn: {
        width: 56,
        minHeight: 44,
        borderRadius: 16,
        // borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    sortDirText: { fontSize: 16, fontWeight: "700" },

    errorBox: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    errorText: { fontSize: 12.5, fontWeight: "800" },

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
    btnGhostText: { fontSize: 13, fontWeight: "700" },

    btnPrimary: {
        flex: 1,
        minHeight: 38,
        borderRadius: 16,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    btnPrimaryText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});