// src/modules/cost/EditCostModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { CostApi, FullCost } from "./api";
import { useUpdateCost } from "./hooks/useCostApi";

type Member = { _id: string; name: string; email: string };

type FormState = {
  name: string;
  amount: string;
  category: string;
  paidBy: string;
  sharedBy: string[];
  date: string; // YYYY-MM-DD
  notes: string;
};

type Props = {
  open: boolean;
  costId: string | null;
  onClose: () => void;
};

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
 * Same dropdown UX as AddCostModal.
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
          { opacity: pressed ? 0.9 : 1, borderColor, backgroundColor: bgColor },
        ]}
      >
        <Text style={{ color: current ? textColor : mutedColor, fontSize: 14, fontWeight: "500" }}>
          {current || "Select category"}
        </Text>
        <Ionicons name="chevron-down" size={16} color={mutedColor} />
      </Pressable>

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
          { opacity: pressed ? 0.9 : 1, borderColor, backgroundColor: bgColor },
        ]}
      >
        <Text style={{ color: textColor, fontSize: 14, fontWeight: "500" }}>{valueYmd || "Select date"}</Text>
        <Ionicons name="calendar-outline" size={16} color={mutedColor} />
      </Pressable>

      {show ? (
        Platform.OS === "ios" ? (
          <Modal transparent animationType="fade" onRequestClose={() => setShow(false)}>
            <View style={StyleSheet.absoluteFill}>
              <BlurView
                intensity={isDark ? 70 : 90}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />

              <Pressable style={StyleSheet.absoluteFill} onPress={() => setShow(false)}>
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

export default function EditCostModal({ open, costId, onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();

  const insets = useSafeAreaInsets();

  const members: Member[] = useMemo(() => ((user as any)?.house?.members ?? []) as Member[], [user]);
  const currentUserId = (user as any)?._id as string | undefined;

  const update = useUpdateCost();
  const saving = update.isPending;

  const emptyForm: FormState = useMemo(
    () => ({
      name: "",
      amount: "",
      category: "",
      paidBy: currentUserId ?? "",
      sharedBy: currentUserId ? [currentUserId] : [],
      date: ymdToday(),
      notes: "",
    }),
    [currentUserId]
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(8)).current;

  // ✅ Same token system as AddCostModal
  const T = useMemo(() => {
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

    return { border, headerBorder, text, muted, inputBg, inputBorder, primary, danger, shadow };
  }, [isDark]);


  // ✅ Fetch cost only when modal is open and id exists
  const { data: cost, isLoading, isFetching } = useQuery({
    queryKey: ["cost", costId],
    enabled: open && !!costId,
    queryFn: async () => {
      if (!costId) throw new Error("Missing costId");
      return CostApi.getSingleCost(costId);
    },
    staleTime: 0,
    gcTime: 0,
  });

  const showLoading = isLoading || (!cost && !!costId) || isFetching;

  useEffect(() => {
    if (!open) {
      formOpacity.setValue(0);
      formTranslateY.setValue(8);
      return;
    }

    if (showLoading) {
      formOpacity.setValue(0);
      formTranslateY.setValue(8);
      return;
    }

    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, showLoading, cost, formOpacity, formTranslateY]);

  // ✅ When opening, reset UI immediately so you don't show stale form.
  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(emptyForm);
  }, [open, emptyForm]);

  // ✅ When cost arrives, populate form once.
  React.useEffect(() => {
    if (!open || !cost) return;

    const c: FullCost = cost;

    setForm({
      name: c.name ?? "",
      amount: c.amount != null ? Number(c.amount).toFixed(2) : "",
      category: c.category ?? "",
      paidBy: c.paidBy?._id ?? (currentUserId ?? ""),
      sharedBy: (c.sharedBy ?? []).map((m) => m._id),
      date: c.date ? new Date(c.date).toISOString().slice(0, 10) : ymdToday(),
      notes: c.notes ?? "",
    });

    setError(null);
  }, [open, cost, currentUserId]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleShared(memberId: string) {
    setForm((prev) => {
      const exists = prev.sharedBy.includes(memberId);
      return { ...prev, sharedBy: exists ? prev.sharedBy.filter((id) => id !== memberId) : [...prev.sharedBy, memberId] };
    });
  }

  function buildPayload() {
    if (!costId) throw new Error("Missing costId");
    if (!form.name.trim()) throw new Error("Name is required.");
    if (!form.amount || Number(form.amount) <= 0) throw new Error("Amount must be greater than 0.");
    if (!form.category.trim()) throw new Error("Category is required.");
    if (!form.paidBy) throw new Error("Paid by is required.");
    if (!form.sharedBy.length) throw new Error("At least one shared by member is required.");

    return {
      id: costId,
      payload: {
        name: form.name.trim(),
        amount: Number(form.amount),
        category: form.category.trim(),
        paidBy: form.paidBy,
        sharedBy: form.sharedBy,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        notes: form.notes?.trim() || undefined,
      },
    };
  }

  function handleSave() {
    setError(null);
    try {
      const input = buildPayload();

      update.mutate(input as any, {
        onSuccess: () => onClose(),
        onError: (err: any) => {
          setError(err?.response?.data?.message || err?.message || "Failed to update cost");
        },
      });
    } catch (e: any) {
      setError(e?.message || "Invalid form data");
    }
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => !saving && onClose()}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => !saving && onClose()}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark
              ? "rgba(0,0,0,0.35)"
              : "rgba(0,0,0,0.18)",
          }}
        />
      </Pressable>

      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            paddingTop: insets.top,
            paddingBottom: 0,
            paddingHorizontal: 0,
          },
        ]}
      >


        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kav}
        >
          <View style={styles.center}>
            <View style={styles.modalWrap}>
              <GlassView
                glassEffectStyle="regular"
                colorScheme={isDark ? "dark" : "light"}
                style={[styles.modal, { borderColor: T.border }, T.shadow]}
              >

                <View
                  style={[styles.header, { borderBottomColor: T.headerBorder }]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <View
                      style={[
                        styles.iconPill,
                        { borderColor: T.border, backgroundColor: T.inputBg },
                      ]}
                    >
                      <Ionicons name="create-outline" size={18} color={T.text} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.h1, { color: T.text }]}>Edit cost</Text>
                      <Text style={[styles.h2, { color: T.muted }]}>
                        Changes will recalculate balances for this house.
                      </Text>
                    </View>
                  </View>
                </View>

                {showLoading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={T.primary} />
                    <Text style={{ marginTop: 10, color: T.muted }}>
                      Loading cost...
                    </Text>
                  </View>
                ) : (
                  <Animated.View
                    style={[
                      styles.contentWrap,
                      {
                        opacity: formOpacity,
                        transform: [{ translateY: formTranslateY }],
                      },
                    ]}
                  >
                    <ScrollView
                      contentContainerStyle={styles.body}
                      keyboardShouldPersistTaps="handled"
                    >
                      <View>
                        <Text style={[styles.label, { color: T.muted }]}>Name</Text>
                        <TextInput
                          value={form.name}
                          onChangeText={(v) => updateField("name", v)}
                          placeholder="Eg. Groceries"
                          placeholderTextColor={
                            isDark
                              ? "rgba(148,163,184,0.55)"
                              : "rgba(100,116,139,0.65)"
                          }
                          style={[
                            styles.input,
                            {
                              color: T.text,
                              backgroundColor: T.inputBg,
                              borderColor: T.inputBorder,
                            },
                          ]}
                        />

                        <Text
                          style={[styles.label, { color: T.muted, marginTop: 12 }]}
                        >
                          Amount (AUD)
                        </Text>
                        <TextInput
                          value={form.amount}
                          onChangeText={(v) => updateField("amount", v)}
                          placeholder="0.00"
                          keyboardType="decimal-pad"
                          placeholderTextColor={
                            isDark
                              ? "rgba(148,163,184,0.55)"
                              : "rgba(100,116,139,0.65)"
                          }
                          style={[
                            styles.input,
                            {
                              color: T.text,
                              backgroundColor: T.inputBg,
                              borderColor: T.inputBorder,
                            },
                          ]}
                        />

                        <Text
                          style={[styles.label, { color: T.muted, marginTop: 12 }]}
                        >
                          Paid by
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                          {members.map((m) => {
                            const active = form.paidBy === m._id;
                            return (
                              <Pressable
                                key={m._id}
                                disabled={saving}
                                onPress={() => updateField("paidBy", m._id)}
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
                                    <Text style={{ color: T.text, fontWeight: "600", fontSize: 11 }}>{initials(m.name)}</Text>
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
                          valueYmd={form.date}
                          onChangeYmd={(v) => updateField("date", v)}
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
                            <Pressable disabled={saving} onPress={() => updateField("sharedBy", members.map((m) => m._id))} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                              <Text style={{ color: T.text, fontWeight: "600" }}>All</Text>
                            </Pressable>

                            {currentUserId ? (
                              <Pressable disabled={saving} onPress={() => updateField("sharedBy", [currentUserId])} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                                <Text style={{ color: T.text, fontWeight: "600" }}>Just me</Text>
                              </Pressable>
                            ) : null}
                          </View>
                        </View>

                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                          {members.map((m) => {
                            const checked = form.sharedBy.includes(m._id);
                            return (
                              <Pressable key={m._id} disabled={saving} onPress={() => toggleShared(m._id)} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
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

                        {form.sharedBy.length === 0 ? (
                          <Text style={{ marginTop: 10, color: T.danger, fontWeight: "600", fontSize: 12 }}>
                            Select at least 1 member.
                          </Text>
                        ) : null}

                        <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Category</Text>
                        <CategorySelect
                          value={form.category}
                          onChange={(v) => updateField("category", v)}
                          disabled={saving}
                          isDark={isDark}
                          borderColor={T.inputBorder}
                          bgColor={T.inputBg}
                          textColor={T.text}
                          mutedColor={T.muted}
                        />

                        <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Notes (optional)</Text>
                        <TextInput
                          value={form.notes}
                          onChangeText={(v) => updateField("notes", v)}
                          placeholder="Eg. Coles run, split equally."
                          placeholderTextColor={
                            isDark
                              ? "rgba(148,163,184,0.55)"
                              : "rgba(100,116,139,0.65)"
                          }
                          multiline
                          style={[
                            styles.input,
                            styles.textarea,
                            { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder },
                          ]}
                        />
                      </View>

                      {error ? (
                        <View
                          style={[
                            styles.errorBox,
                            {
                              borderColor: "rgba(239,68,68,0.30)",
                              backgroundColor: "rgba(239,68,68,0.10)",
                            },
                          ]}
                        >
                          <Text style={{ color: T.danger, fontWeight: "600" }}>
                            Can’t save
                          </Text>
                          <Text
                            style={{
                              color: T.danger,
                              marginTop: 4,
                              fontWeight: "400",
                            }}
                          >
                            {error}
                          </Text>
                        </View>
                      ) : null}
                    </ScrollView>

                    <View
                      style={[
                        styles.footer,
                        {
                          borderTopColor: T.headerBorder,
                          paddingBottom: Math.max(insets.bottom, 10) + 10,
                        },
                      ]}
                    >
                      <Pressable
                        onPress={() => !saving && onClose()}
                        disabled={saving}
                        style={({ pressed }) => [
                          styles.footerBtn,
                          {
                            borderColor: T.border,
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.05)",
                            opacity: pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <Text style={{ color: T.text, fontWeight: "600" }}>
                          Cancel
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={handleSave}
                        disabled={saving || showLoading}
                        style={({ pressed }) => [
                          styles.footerBtnPrimary,
                          {
                            backgroundColor: T.primary,
                            opacity: pressed ? 0.92 : 1,
                          },
                        ]}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={{ color: "#fff", fontWeight: "600" }}>
                            Save changes
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </Animated.View>
                )}
              </GlassView>
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

  center: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-end",
    padding: 0,
  },

  modalWrap: {
    width: "100%",
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },

  modal: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
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

  body: { padding: 16, paddingBottom: 28, gap: 14 },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },

  categorySheet: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: "70%",
    width: "100%",
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

  // ---- Loading stabilizer ----
  loadingBody: {
    flex: 1,
    padding: 16,
    paddingBottom: 18,
    justifyContent: "center",
  },
  loadingWrap: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 520,
  },
  contentWrap: {
    flex: 1,
  },
  fakeBlock: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
  },

  errorBox: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
});