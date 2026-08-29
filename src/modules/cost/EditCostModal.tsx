// src/modules/cost/EditCostModal.tsx
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
import { GlassView } from "expo-glass-effect";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "../../context/ThemeContext";
import { useGlassStyle } from "../../context/GlassStyleContext";
import { useAuth } from "../../context/AuthContext";
import { CostApi, FullCost } from "./api";
import { useUpdateCost } from "./hooks/useCostApi";
import { typography } from "../../theme/typography";

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
  return (
    <View style={[styles.pickerWrap, { borderColor, backgroundColor: bgColor }]}>
      <Picker
        enabled={!disabled}
        selectedValue={value || CATEGORY_OPTIONS[0]?.key}
        onValueChange={(v) => onChange(String(v))}
        dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
        style={{ color: textColor }}
        itemStyle={{ color: textColor, fontSize: 16 }}
      >
        {CATEGORY_OPTIONS.map((c) => (
          <Picker.Item key={c.key} label={c.label} value={c.key} />
        ))}
      </Picker>
    </View>
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
  const { glassStyle } = useGlassStyle();
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
        <Text style={[typography.footnote, { color: textColor }]}>{valueYmd || "Select date"}</Text>
        <Ionicons name="calendar-outline" size={16} color={mutedColor} />
      </Pressable>

      {show ? (
        Platform.OS === "ios" ? (
          <Modal transparent animationType="fade" onRequestClose={() => setShow(false)}>
            <View style={StyleSheet.absoluteFill}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setShow(false)}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)",
                  }}
                />
              </Pressable>

              <View style={[styles.modalOverlay, { backgroundColor: "transparent" }]}>
                <GlassView
                  glassEffectStyle={glassStyle}
                  colorScheme={isDark ? "dark" : "light"}
                  style={[styles.dateSheet, { borderColor }]}
                >
                  <View style={[styles.selectHeader, { borderBottomColor: borderColor }]}>
                    <Text style={[typography.subheadlineEmphasized, { color: textColor }]}>Select date</Text>
                    <Text style={[typography.caption1, { color: mutedColor, marginTop: 2 }]}>
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
                    <Pressable
                      onPress={() => setShow(false)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
                    >
                      <GlassView
                        glassEffectStyle={glassStyle}
                        isInteractive
                        colorScheme={isDark ? "dark" : "light"}
                        style={styles.doneBtn}
                      >
                        <Text style={[styles.doneBtnText, { color: isDark ? "rgba(255,255,255,0.88)" : "#1a1a1a" }]}>Done</Text>
                      </GlassView>
                    </Pressable>
                  </View>
                </GlassView>
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
  const { glassStyle } = useGlassStyle();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();

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

  // ✅ Same token system as AddCostModal
  const T = useMemo(() => {
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const headerBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";

    const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.045)";
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
  const { data: cost, isLoading } = useQuery({
    queryKey: ["cost", costId],
    enabled: open && !!costId,
    queryFn: async () => {
      if (!costId) throw new Error("Missing costId");
      return CostApi.getSingleCost(costId);
    },
    staleTime: 0,
    gcTime: 0,
  });

  const showLoading = isLoading || (!cost && !!costId);

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
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !saving && onClose()}
    >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kav}
        >
              <View style={[styles.modal, { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" }]}>

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
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable
                      onPress={handleSave}
                      disabled={saving || showLoading}
                      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
                    >
                      <GlassView
                        glassEffectStyle={glassStyle}
                        isInteractive={!saving && !showLoading}
                        tintColor={T.primary}
                        colorScheme={isDark ? "dark" : "light"}
                        style={styles.headerSaveBtn}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={[typography.subheadlineEmphasized, { color: "#fff" }]}>Save</Text>
                        )}
                      </GlassView>
                    </Pressable>

                    <Pressable
                      onPress={() => !saving && onClose()}
                      disabled={saving}
                      hitSlop={10}
                      style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
                    >
                      <GlassView
                        glassEffectStyle={glassStyle}
                        isInteractive={!saving}
                        colorScheme={isDark ? "dark" : "light"}
                        style={styles.closeBtn}
                      >
                        <Ionicons name="close" size={18} color={T.text} />
                      </GlassView>
                    </Pressable>
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
                  <View style={styles.contentWrap}>
                    <ScrollView
                      style={{ flex: 1 }}
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
                                <GlassView
                                  glassEffectStyle={glassStyle}
                                  isInteractive={!saving}
                                  tintColor={active ? "rgba(79,70,229,0.55)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.045)"}
                                  colorScheme={isDark ? "dark" : "light"}
                                  style={[
                                    styles.memberChip,
                                    { borderColor: active ? "rgba(79,70,229,0.45)" : T.border },
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
                                </GlassView>
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
                                <GlassView
                                  glassEffectStyle={glassStyle}
                                  isInteractive={!saving}
                                  tintColor={checked ? "rgba(16,185,129,0.55)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.045)"}
                                  colorScheme={isDark ? "dark" : "light"}
                                  style={[
                                    styles.sharedChip,
                                    { borderColor: checked ? "rgba(16,185,129,0.45)" : T.border },
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
                                </GlassView>
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
                  </View>
                )}
              </View>
        </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },

  modal: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
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
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },

  h1: { ...typography.headline },

  headerSaveBtn: {
    height: 36,
    minWidth: 64,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  body: { padding: 16, paddingBottom: 40, gap: 14 },

  block: {
    borderRadius: 16,
    // borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  blockHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  blockTitle: { ...typography.footnoteEmphasized },
  blockSub: { ...typography.caption1, marginTop: 2 },

  label: { ...typography.caption1 },

  input: {
    marginTop: 8,
    // borderWidth: StyleSheet.hairlineWidth,
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
    minHeight: 44,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 999,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },

  sharedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 30,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    // borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  dot: { height: 8, width: 8, borderRadius: 999 },

  // ---- Category/date select modal styles ----
  pickerWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  selectField: {
    marginTop: 8,
    // borderWidth: StyleSheet.hairlineWidth,
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

  dateSheet: {
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: "70%",
    width: "100%",
  },

  selectHeader: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectFooter: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  doneBtn: {
    minHeight: 40,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  doneBtnText: {
    ...typography.subheadlineEmphasized,
    letterSpacing: 0.2,
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
    // borderWidth: StyleSheet.hairlineWidth,
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
    // borderWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
  },

  errorBox: { borderRadius: 16, 
    // borderWidth: StyleSheet.hairlineWidth, 
    padding: 12 },
});