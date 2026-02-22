// src/modules/cost/AddCostModal.tsx
import React, { useMemo, useState } from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useAddCost } from "./hooks/useCostApi";

type Member = { _id: string; name: string; email: string };

type CostItemForm = {
    name: string;
    amount: string;
    category: string;
    paidBy: string;
    sharedBy: string[];
    date: string; // YYYY-MM-DD
    notes: string;
};

type Props = { open: boolean; onClose: () => void };

const CATEGORY_OPTIONS = [
    { key: "groceries", label: "Groceries" },
    { key: "rent", label: "Rent" },
    { key: "utilities", label: "Utilities" },
    { key: "transport", label: "Transport" },
    { key: "eating_out", label: "Eating out" },
    { key: "shopping", label: "Shopping" },
    { key: "health", label: "Health" },
    { key: "entertainment", label: "Entertainment" },
    { key: "other", label: "Other" },
];

function ymdToday() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function initials(name?: string) {
    const s = (name ?? "").trim();
    if (!s) return "?";
    const parts = s.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function ymdFromDate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function dateFromYmd(ymd: string) {
    const [y, m, d] = ymd.split("-").map((x) => Number(x));
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
}

/**
 * Compact dropdown, consistent on iOS/Android.
 */
function CategorySelect({
    value,
    onChange,
    disabled,
    isDark,
    borderColor,
    bgColor,
    textColor,
    mutedColor,
}: {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
    isDark: boolean;
    borderColor: string;
    bgColor: string;
    textColor: string;
    mutedColor: string;
}) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value || CATEGORY_OPTIONS[0]?.key);
    const current = CATEGORY_OPTIONS.find((c) => c.key === value)?.label ?? "";

    // keep draft in sync when opening
    React.useEffect(() => {
        if (open) setDraft(value || CATEGORY_OPTIONS[0]?.key);
    }, [open, value]);

    return (
        <>
            <Pressable
                disabled={disabled}
                onPress={() => setOpen(true)}
                style={({ pressed }) => [
                    styles.selectField,
                    {
                        opacity: pressed ? 0.9 : 1,
                        borderColor,
                        backgroundColor: bgColor,
                    },
                ]}
            >
                <Text style={{ color: current ? textColor : mutedColor, fontSize: 14, fontWeight: "500" }}>
                    {current || "Select category"}
                </Text>
                <Ionicons name="chevron-down" size={16} color={mutedColor} />
            </Pressable>

            {/* Category modal */}
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <View style={StyleSheet.absoluteFill}>
                    <BlurView
                        intensity={isDark ? 70 : 90}
                        tint={isDark ? "dark" : "light"}
                        style={StyleSheet.absoluteFill}
                    />

                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)",
                            }}
                        />
                    </Pressable>

                    <View style={[styles.modalOverlay, { backgroundColor: "transparent" }]}>
                        <BlurView
                            intensity={isDark ? 28 : 45}
                            tint={isDark ? "dark" : "light"}
                            style={[styles.categorySheet, { borderColor }]}
                        >
                            <LinearGradient
                                colors={
                                    isDark
                                        ? ["rgba(2,6,23,0.55)", "rgba(15,23,42,0.35)", "rgba(2,6,23,0.25)"]
                                        : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.60)", "rgba(255,255,255,0.50)"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />

                            <View style={[styles.selectHeader, { borderBottomColor: borderColor }]}>
                                <Text style={{ color: textColor, fontSize: 15, fontWeight: "600" }}>Category</Text>
                                <Text style={{ color: mutedColor, marginTop: 2, fontSize: 12, fontWeight: "400" }}>
                                    Choose one option
                                </Text>
                            </View>

                            {Platform.OS === "ios" ? (
                                <View style={{ paddingHorizontal: 8, paddingVertical: 10 }}>
                                    <Picker
                                        selectedValue={draft}
                                        onValueChange={(v) => setDraft(String(v))}
                                        itemStyle={{ color: textColor, fontSize: 16 }}
                                    >
                                        {CATEGORY_OPTIONS.map((c) => (
                                            <Picker.Item key={c.key} label={c.label} value={c.key} />
                                        ))}
                                    </Picker>
                                </View>
                            ) : (
                                <ScrollView contentContainerStyle={{ padding: 10 }}>
                                    {CATEGORY_OPTIONS.map((c) => {
                                        const active = c.key === value;
                                        return (
                                            <Pressable
                                                key={c.key}
                                                onPress={() => {
                                                    onChange(c.key);
                                                    setOpen(false);
                                                }}
                                                style={({ pressed }) => [
                                                    styles.selectRow,
                                                    {
                                                        opacity: pressed ? 0.9 : 1,
                                                        borderColor: active ? "rgba(79,70,229,0.35)" : borderColor,
                                                        backgroundColor: active ? "rgba(79,70,229,0.10)" : "transparent",
                                                    },
                                                ]}
                                            >
                                                <Text style={{ color: textColor, fontSize: 14, fontWeight: active ? "600" : "500" }}>
                                                    {c.label}
                                                </Text>
                                                {active ? <Ionicons name="checkmark" size={18} color="#4F46E5" /> : null}
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            )}

                            <View style={[styles.selectFooter, { borderTopColor: borderColor }]}>
                                <Pressable
                                    onPress={() => {
                                        if (Platform.OS === "ios") onChange(draft);
                                        setOpen(false);
                                    }}
                                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                                >
                                    <Text style={{ color: textColor, fontSize: 14, fontWeight: "600" }}>Done</Text>
                                </Pressable>
                            </View>
                        </BlurView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

function DateField({
    valueYmd,
    onChangeYmd,
    disabled,
    isDark,
    borderColor,
    bgColor,
    textColor,
    mutedColor,
}: {
    valueYmd: string;
    onChangeYmd: (v: string) => void;
    disabled: boolean;
    isDark: boolean;
    borderColor: string;
    bgColor: string;
    textColor: string;
    mutedColor: string;
}) {
    const [show, setShow] = React.useState(false);
    const valueDate = React.useMemo(() => dateFromYmd(valueYmd), [valueYmd]);

    function onChange(_: DateTimePickerEvent, selected?: Date) {
        if (!selected) {
            setShow(false);
            return;
        }
        onChangeYmd(ymdFromDate(selected));
        if (Platform.OS === "android") setShow(false);
    }

    return (
        <>
            <Pressable
                disabled={disabled}
                onPress={() => setShow(true)}
                style={({ pressed }) => [
                    styles.selectField,
                    {
                        opacity: pressed ? 0.9 : 1,
                        borderColor,
                        backgroundColor: bgColor,
                    },
                ]}
            >
                <Text style={{ color: textColor, fontSize: 14, fontWeight: "500" }}>
                    {valueYmd || "Select date"}
                </Text>
                <Ionicons name="calendar-outline" size={16} color={mutedColor} />
            </Pressable>

            {show ? (
                Platform.OS === "ios" ? (
                    <Modal transparent animationType="fade" onRequestClose={() => setShow(false)}>
                        <View style={StyleSheet.absoluteFill}>
                            {/* Fullscreen blur behind the sheet */}
                            <BlurView
                                intensity={isDark ? 70 : 90}
                                tint={isDark ? "dark" : "light"}
                                style={StyleSheet.absoluteFill}
                            />

                            {/* Dim overlay + tap outside to close */}
                            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShow(false)}>
                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)",
                                    }}
                                />
                            </Pressable>

                            {/* Sheet */}
                            <View style={[styles.modalOverlay, { backgroundColor: "transparent" }]}>
                                <BlurView
                                    intensity={isDark ? 28 : 45}
                                    tint={isDark ? "dark" : "light"}
                                    style={[styles.dateSheet, { borderColor }]}
                                >
                                    <LinearGradient
                                        colors={
                                            isDark
                                                ? ["rgba(2,6,23,0.55)", "rgba(15,23,42,0.35)", "rgba(2,6,23,0.25)"]
                                                : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.60)", "rgba(255,255,255,0.50)"]
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />

                                    <View style={[styles.selectHeader, { borderBottomColor: borderColor }]}>
                                        <Text style={{ color: textColor, fontSize: 15, fontWeight: "600" }}>Select date</Text>
                                        <Text style={{ color: mutedColor, marginTop: 2, fontSize: 12, fontWeight: "400" }}>
                                            Pick a day
                                        </Text>
                                    </View>

                                    <View style={{ padding: 12 }}>
                                        <DateTimePicker
                                            value={valueDate}
                                            mode="date"
                                            display="spinner"
                                            onChange={onChange}
                                            themeVariant={isDark ? "dark" : "light"}
                                        />
                                    </View>

                                    <View style={[styles.selectFooter, { borderTopColor: borderColor }]}>
                                        <Pressable onPress={() => setShow(false)} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
                                            <Text style={{ color: textColor, fontSize: 14, fontWeight: "600" }}>Done</Text>
                                        </Pressable>
                                    </View>
                                </BlurView>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker value={valueDate} mode="date" display="default" onChange={onChange} />
                )
            ) : null}
        </>
    );
}

export default function AddCostModal({ open, onClose }: Props) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { user } = useAuth();

    const members: Member[] = useMemo(() => {
        return ((user as any)?.house?.members ?? []) as Member[];
    }, [user]);

    const currentUserId = (user as any)?._id as string | undefined;

    const makeEmptyItem = (): CostItemForm => ({
        name: "",
        amount: "",
        category: "",
        paidBy: currentUserId ?? "",
        sharedBy: currentUserId ? [currentUserId] : [],
        date: ymdToday(),
        notes: "",
    });

    const [categorized, setCategorized] = useState(false);
    const [items, setItems] = useState<CostItemForm[]>([makeEmptyItem()]);
    const [error, setError] = useState<string | null>(null);

    const add = useAddCost();
    const saving = add.isPending;

    React.useEffect(() => {
        if (!open) return;
        setCategorized(false);
        setItems([makeEmptyItem()]);
        setError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // ✅ Copy the CreateHouse "glass" system
    const T = useMemo(() => {
        const modalBgGrad = isDark
            ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
            : ["rgba(255,255,255,0.78)", "rgba(255,255,255,0.62)", "rgba(255,255,255,0.52)"];

        const glowA = isDark
            ? ["rgba(79,70,229,0.20)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"]
            : ["rgba(79,70,229,0.22)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"];

        const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
        const headerBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

        const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
        const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";

        const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.70)";
        const inputBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

        const primary = "#4F46E5";
        const danger = isDark ? "#FCA5A5" : "#B91C1C";

        const shadow = isDark
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.6,
                shadowRadius: 36,
                shadowOffset: { width: 0, height: 18 },
                elevation: 16,
            }
            : {
                shadowColor: "#000",
                shadowOpacity: 0.14,
                shadowRadius: 28,
                shadowOffset: { width: 0, height: 14 },
                elevation: 12,
            };

        return {
            modalBgGrad,
            glowA,
            border,
            headerBorder,
            text,
            muted,
            inputBg,
            inputBorder,
            primary,
            danger,
            shadow,
        };
    }, [isDark]);

    function updateItem(index: number, patch: Partial<CostItemForm>) {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    }

    function addItem() {
        setItems((prev) => [...prev, makeEmptyItem()]);
    }

    function removeItem(index: number) {
        setItems((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((_, i) => i !== index);
        });
    }

    function toggleSharedMember(index: number, memberId: string) {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;
                const exists = item.sharedBy.includes(memberId);
                const next = exists ? item.sharedBy.filter((id) => id !== memberId) : [...item.sharedBy, memberId];
                return { ...item, sharedBy: next };
            })
        );
    }

    function selectAllShared(index: number) {
        setItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, sharedBy: members.map((m) => m._id) } : item))
        );
    }

    function selectJustMeShared(index: number) {
        if (!currentUserId) return;
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, sharedBy: [currentUserId] } : item)));
    }

    function buildPayload() {
        if (!members.length) throw new Error("No members in this house. You cannot add a cost yet.");

        for (const item of items) {
            if (!item.name.trim()) throw new Error("Each item must have a name.");
            if (!item.amount || Number(item.amount) <= 0) throw new Error("Each item must have an amount greater than 0.");
            if (!item.category.trim()) throw new Error("Each item must have a category.");
            if (!item.paidBy) throw new Error("Each item must have a 'Paid by' user.");
            if (!item.sharedBy.length) throw new Error("Each item must have at least 1 shared member.");
        }

        return {
            categorized,
            costs: items.map((i) => ({
                name: i.name.trim(),
                amount: Number(i.amount),
                category: i.category.trim(),
                paidBy: i.paidBy,
                sharedBy: i.sharedBy,
                date: i.date ? new Date(i.date).toISOString() : undefined,
                notes: i.notes?.trim() || undefined,
            })),
        };
    }

    function handleSave() {
        setError(null);
        try {
            const payload = buildPayload();
            add.mutate(payload as any, {
                onSuccess: () => onClose(),
                onError: (err: any) => {
                    setError(err?.response?.data?.message || err?.message || "Failed to save cost");
                },
            });
        } catch (e: any) {
            setError(e?.message || "Invalid form data");
        }
    }

    return (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => !saving && onClose()}>
            <View style={styles.root}>
                <BlurView
                    intensity={isDark ? 70 : 90}
                    tint={isDark ? "dark" : "light"}
                    style={StyleSheet.absoluteFill}
                />
                <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && onClose()}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)",
                        }}
                    />
                </Pressable>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.kav}>
                    <View style={styles.center}>
                        <View style={styles.modalWrap}>
                            <BlurView
                                intensity={isDark ? 28 : 45}
                                tint={isDark ? "dark" : "light"}
                                style={[styles.modal, { borderColor: T.border }, T.shadow]}
                            >
                                {/* background gradient */}
                                <LinearGradient
                                    colors={T.modalBgGrad as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />

                                {/* glow */}
                                <LinearGradient
                                    colors={T.glowA as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[styles.glow, { top: -90, left: -90 }]}
                                />

                                {/* Header */}
                                <View style={[styles.header, { borderBottomColor: T.headerBorder }]}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                                        <View style={[styles.iconPill, { borderColor: T.border, backgroundColor: T.inputBg }]}>
                                            <Ionicons name="add" size={18} color={T.text} />
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.h1, { color: T.text }]}>Add cost</Text>
                                            <Text style={[styles.h2, { color: T.muted }]}>
                                                Add a single cost, or split into multiple categorized items.
                                            </Text>
                                        </View>
                                    </View>

                                    <Pressable
                                        onPress={() => !saving && onClose()}
                                        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
                                        hitSlop={10}
                                        disabled={saving}
                                    >
                                        <View style={[styles.closeBtn, { borderColor: T.border, backgroundColor: T.inputBg }]}>
                                            <Ionicons name="close" size={18} color={T.text} />
                                        </View>
                                    </Pressable>
                                </View>

                                {/* Categorized toggle */}
                                <View style={styles.toggleRow}>
                                    <Pressable
                                        disabled={saving}
                                        onPress={() => {
                                            setCategorized((prev) => {
                                                const next = !prev;
                                                setItems((prevItems) => {
                                                    if (!next) return [prevItems[0] ?? makeEmptyItem()];
                                                    return prevItems.length ? prevItems : [makeEmptyItem()];
                                                });
                                                return next;
                                            });
                                        }}
                                        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                                    >
                                        <View style={[styles.toggleBtn, { borderColor: T.border, backgroundColor: T.inputBg }]}>
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    { borderColor: T.border, backgroundColor: categorized ? T.primary : "transparent" },
                                                ]}
                                            />
                                            <Text style={[styles.toggleText, { color: T.text }]}>Categorized</Text>
                                            <Text style={[styles.toggleHint, { color: T.muted }]}>
                                                {categorized ? "Multiple items" : "Single item"}
                                            </Text>
                                        </View>
                                    </Pressable>
                                </View>

                                {/* Body */}
                                <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                                    {items.map((item, index) => (
                                        <View key={index} style={[styles.block, { borderColor: T.border, backgroundColor: "transparent" }]}>
                                            <View style={styles.blockHeader}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.blockTitle, { color: T.text }]}>
                                                        {categorized ? `Item ${index + 1}` : "Cost details"}
                                                    </Text>
                                                    <Text style={[styles.blockSub, { color: T.muted }]}>
                                                        {categorized ? "This item will be tracked separately." : "One combined cost entry."}
                                                    </Text>
                                                </View>

                                                {categorized && items.length > 1 ? (
                                                    <Pressable
                                                        disabled={saving}
                                                        onPress={() => removeItem(index)}
                                                        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                                                    >
                                                        <Text style={{ color: T.danger, fontWeight: "600" }}>Remove</Text>
                                                    </Pressable>
                                                ) : null}
                                            </View>

                                            <Text style={[styles.label, { color: T.muted }]}>Name</Text>
                                            <TextInput
                                                value={item.name}
                                                onChangeText={(v) => updateItem(index, { name: v })}
                                                placeholder="Eg. Groceries"
                                                placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                                                style={[
                                                    styles.input,
                                                    { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder },
                                                ]}
                                            />

                                            <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Amount (AUD)</Text>
                                            <TextInput
                                                value={item.amount}
                                                onChangeText={(v) => updateItem(index, { amount: v })}
                                                placeholder="0.00"
                                                keyboardType="decimal-pad"
                                                placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                                                style={[
                                                    styles.input,
                                                    { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder },
                                                ]}
                                            />

                                            <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Paid by</Text>
                                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                                                {members.map((m) => {
                                                    const active = item.paidBy === m._id;
                                                    return (
                                                        <Pressable
                                                            key={m._id}
                                                            disabled={saving}
                                                            onPress={() => updateItem(index, { paidBy: m._id })}
                                                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                                                        >
                                                            <View
                                                                style={[
                                                                    styles.memberChip,
                                                                    {
                                                                        borderColor: active ? "rgba(79,70,229,0.45)" : T.border,
                                                                        backgroundColor: active ? "rgba(79,70,229,0.10)" : T.inputBg,
                                                                    },
                                                                ]}
                                                            >
                                                                <View style={[styles.avatar, { borderColor: T.border }]}>
                                                                    <Text style={{ color: T.text, fontWeight: "600", fontSize: 11 }}>
                                                                        {initials(m.name)}
                                                                    </Text>
                                                                </View>

                                                                <View style={{ minWidth: 140 }}>
                                                                    <Text numberOfLines={1} style={{ color: T.text, fontWeight: "600", fontSize: 13 }}>
                                                                        {m.name}
                                                                    </Text>
                                                                    <Text numberOfLines={1} style={{ color: T.muted, fontWeight: "400", fontSize: 12 }}>
                                                                        {m.email}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>

                                            <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Date</Text>
                                            <DateField
                                                valueYmd={item.date}
                                                onChangeYmd={(v) => updateItem(index, { date: v })}
                                                disabled={saving}
                                                isDark={isDark}
                                                borderColor={T.inputBorder}
                                                bgColor={T.inputBg}
                                                textColor={T.text}
                                                mutedColor={T.muted}
                                            />

                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                                                <Text style={[styles.label, { color: T.muted }]}>Shared by</Text>

                                                <View style={{ flexDirection: "row", gap: 14 }}>
                                                    <Pressable disabled={saving} onPress={() => selectAllShared(index)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                                                        <Text style={{ color: T.text, fontWeight: "600" }}>All</Text>
                                                    </Pressable>

                                                    {currentUserId ? (
                                                        <Pressable disabled={saving} onPress={() => selectJustMeShared(index)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                                                            <Text style={{ color: T.text, fontWeight: "600" }}>Just me</Text>
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                                                {members.map((m) => {
                                                    const checked = item.sharedBy.includes(m._id);
                                                    return (
                                                        <Pressable
                                                            key={m._id}
                                                            disabled={saving}
                                                            onPress={() => toggleSharedMember(index, m._id)}
                                                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                                                        >
                                                            <View
                                                                style={[
                                                                    styles.sharedChip,
                                                                    {
                                                                        borderColor: checked ? "rgba(16,185,129,0.45)" : T.border,
                                                                        backgroundColor: checked ? "rgba(16,185,129,0.10)" : T.inputBg,
                                                                    },
                                                                ]}
                                                            >
                                                                <View
                                                                    style={[
                                                                        styles.dot,
                                                                        {
                                                                            backgroundColor: checked
                                                                                ? "rgba(16,185,129,1)"
                                                                                : isDark
                                                                                    ? "rgba(148,163,184,0.35)"
                                                                                    : "rgba(100,116,139,0.35)",
                                                                        },
                                                                    ]}
                                                                />
                                                                <Text style={{ color: T.text, fontWeight: "600", fontSize: 13 }}>{m.name}</Text>
                                                            </View>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>

                                            {item.sharedBy.length === 0 ? (
                                                <Text style={{ marginTop: 10, color: T.danger, fontWeight: "600", fontSize: 12 }}>
                                                    Select at least 1 member.
                                                </Text>
                                            ) : null}

                                            <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Category</Text>
                                            <CategorySelect
                                                value={item.category}
                                                onChange={(v) => updateItem(index, { category: v })}
                                                disabled={saving}
                                                isDark={isDark}
                                                borderColor={T.inputBorder}
                                                bgColor={T.inputBg}
                                                textColor={T.text}
                                                mutedColor={T.muted}
                                            />

                                            <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Notes (optional)</Text>
                                            <TextInput
                                                value={item.notes}
                                                onChangeText={(v) => updateItem(index, { notes: v })}
                                                placeholder="Eg. Coles run, split equally."
                                                placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                                                multiline
                                                style={[
                                                    styles.input,
                                                    styles.textarea,
                                                    { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder },
                                                ]}
                                            />
                                        </View>
                                    ))}

                                    {categorized ? (
                                        <Pressable disabled={saving} onPress={addItem} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
                                            <View style={[styles.addItemBtn, { borderColor: T.inputBorder, backgroundColor: T.inputBg }]}>
                                                <Ionicons name="add-circle-outline" size={18} color={T.text} />
                                                <Text style={{ color: T.text, fontWeight: "600" }}>Add another item</Text>
                                            </View>
                                        </Pressable>
                                    ) : null}

                                    {error ? (
                                        <View style={[styles.errorBox, { borderColor: "rgba(239,68,68,0.30)", backgroundColor: "rgba(239,68,68,0.10)" }]}>
                                            <Text style={{ color: T.danger, fontWeight: "600" }}>Can’t save</Text>
                                            <Text style={{ color: T.danger, marginTop: 4, fontWeight: "400" }}>{error}</Text>
                                        </View>
                                    ) : null}
                                </ScrollView>

                                {/* Footer */}
                                <View style={[styles.footer, { borderTopColor: T.headerBorder }]}>
                                    <Pressable
                                        onPress={() => !saving && onClose()}
                                        disabled={saving}
                                        style={({ pressed }) => [
                                            styles.footerBtn,
                                            {
                                                borderColor: T.border,
                                                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                                                opacity: pressed ? 0.9 : 1,
                                            },
                                        ]}
                                    >
                                        <Text style={{ color: T.text, fontWeight: "600" }}>Cancel</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleSave}
                                        disabled={saving}
                                        style={({ pressed }) => [
                                            styles.footerBtnPrimary,
                                            { backgroundColor: T.primary, opacity: pressed ? 0.92 : 1 },
                                        ]}
                                    >
                                        {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>}
                                    </Pressable>
                                </View>
                            </BlurView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    kav: { flex: 1 },

    // ❌ DO NOT use this as a solid background behind BlurView anymore.
    // Keep it only if you want it for something else, but you should NOT render it.
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent",
    },

    categorySheet: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
        maxHeight: "40%",
        width: "100%",
    },

    // Full height modal (sheet style)
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 7,
    },

    modalWrap: {
        width: "100%",
        overflow: "hidden",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    modal: {
        borderWidth: StyleSheet.hairlineWidth,
        overflow: "hidden",
        maxHeight: "86%",

        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },

    glow: {
        position: "absolute",
        height: 280,
        width: 280,
        borderRadius: 280,
        opacity: 1,
    },

    header: {
        padding: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 10,
    },
    iconPill: {
        height: 36,
        width: 36,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
    },
    closeBtn: {
        height: 36,
        width: 36,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
    },

    h1: { fontSize: 16, fontWeight: "600" },
    h2: { marginTop: 2, fontSize: 12, fontWeight: "400", lineHeight: 16 },

    toggleRow: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
    toggleBtn: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    checkbox: { height: 14, width: 14, borderRadius: 5, borderWidth: StyleSheet.hairlineWidth },
    toggleText: { fontWeight: "600" },
    toggleHint: { marginLeft: "auto", fontSize: 12, fontWeight: "500" },

    body: { padding: 16, paddingBottom: 18, gap: 14 },

    block: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 14,
    },
    blockHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    blockTitle: { fontSize: 14, fontWeight: "600" },
    blockSub: { marginTop: 2, fontSize: 12, fontWeight: "400", lineHeight: 16 },

    label: { fontSize: 12, fontWeight: "500" },

    input: {
        marginTop: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
        fontSize: 14,
        fontWeight: "500",
    },
    textarea: { minHeight: 92, textAlignVertical: "top" },

    memberChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
    },
    avatar: {
        height: 30,
        width: 30,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        justifyContent: "center",
    },

    sharedChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
    },
    dot: { height: 8, width: 8, borderRadius: 999 },

    addItemBtn: {
        marginTop: 4,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },

    errorBox: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 12 },

    footer: {
        padding: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        gap: 10,
    },
    footerBtn: {
        flex: 1,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    footerBtnPrimary: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    // ---- Category/date select modal styles ----
    selectField: {
        marginTop: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    // This overlay must NOT be a full opaque wall if you want the blur to show through nicely.
    // Keep it slightly lighter.
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        padding: 18,
    },

    selectSheet: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
        maxHeight: "70%",
    },
    selectHeader: {
        padding: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    selectRow: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectFooter: {
        padding: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        alignItems: "flex-end",
    },
    dateSheet: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: StyleSheet.hairlineWidth,
        maxHeight: "70%",
        width: "100%",
    },
});