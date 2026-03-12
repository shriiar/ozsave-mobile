import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/src/context/ThemeContext";
import { IncomeApi, FullIncome, IncomeSource, IncomeStatus } from "./api";
import { useUpdateIncome } from "./hooks/useIncomeApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

type FormState = {
  name: string;
  amount: string; // string input
  date: string; // YYYY-MM-DD
  status: IncomeStatus;
  source: IncomeSource;
  tagsInput: string; // comma separated
  notes: string;
};

type Props = {
  open: boolean;
  incomeId: string | null;
  onClose: () => void;
};

const STATUS_OPTIONS: IncomeStatus[] = ["confirmed", "pending", "ignored"];
const SOURCE_OPTIONS: IncomeSource[] = ["manual", "import", "estimate"];

function ymdToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
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
        <Text style={{ color: textColor, fontSize: 14, fontWeight: "500" }}>
          {valueYmd || "Select date"}
        </Text>
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

export default function EditIncomeModal({ open, incomeId, onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const update = useUpdateIncome();
  const saving = update.isPending;

  const emptyForm: FormState = useMemo(
    () => ({
      name: "",
      amount: "",
      date: ymdToday(),
      status: "confirmed",
      source: "manual",
      tagsInput: "",
      notes: "",
    }),
    []
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(8)).current;

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

  const { data: income, isLoading, isFetching, isError } = useQuery({
    queryKey: ["income", incomeId],
    enabled: open && !!incomeId,
    queryFn: async () => {
      if (!incomeId) throw new Error("Missing incomeId");
      return IncomeApi.getSingleIncome(incomeId);
    },
    staleTime: 0,
    gcTime: 0,
  });

  // reset on open so you never show stale form
  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(emptyForm);
  }, [open, emptyForm]);

  // hydrate when income arrives
  React.useEffect(() => {
    if (!open || !income) return;

    const i: FullIncome = income;

    setForm({
      name: i.name ?? "",
      amount: i.amount != null && Number.isFinite(i.amount) ? Number(i.amount).toFixed(2) : "",
      date: i.date ? new Date(i.date).toISOString().slice(0, 10) : ymdToday(),
      status: (i.status as IncomeStatus) ?? "confirmed",
      source: (i.source as IncomeSource) ?? "manual",
      tagsInput: (i.tags ?? []).join(", "),
      notes: i.notes ?? "",
    });

    setError(null);
  }, [open, income]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function buildPayload() {
    if (!incomeId) throw new Error("Missing incomeId");

    const name = form.name.trim();
    const amount = Number(form.amount);

    if (!name) throw new Error("Name is required.");
    if (name.length < 3 || name.length > 30) throw new Error("Name must be between 3 and 30 characters.");
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be > 0.");

    let dateIso: string | undefined;
    if (form.date) {
      const d = new Date(form.date);
      if (Number.isNaN(d.getTime())) throw new Error("Date is invalid.");
      dateIso = d.toISOString();
    }

    return {
      id: incomeId,
      payload: {
        name,
        amount,
        date: dateIso,
        status: form.status,
        source: form.source,
        tags: parseTags(form.tagsInput),
        notes: form.notes.trim() || null,
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
          setError(err?.response?.data?.message || err?.message || "Failed to update income");
        },
      });
    } catch (e: any) {
      setError(e?.message || "Invalid form data");
    }
  }

  const showLoading = isLoading || isFetching || (open && !!incomeId && !income);
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
  }, [open, showLoading, income, formOpacity, formTranslateY]);

  const disabled = saving || showLoading;

  if (!open) return null;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => !saving && onClose()}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => !saving && onClose()}>
        <View style={{ flex: 1, backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)" }} />
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.kav}>
          <View style={styles.center}>
            <View style={styles.modalWrap}>
              <GlassView
                glassEffectStyle="regular"
                colorScheme={isDark ? "dark" : "light"}
                style={[styles.modal, { borderColor: T.border }, T.shadow]}
              >

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: T.headerBorder }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={[styles.iconPill, { borderColor: T.border, backgroundColor: T.inputBg }]}>
                      <Ionicons name="create-outline" size={18} color={T.text} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.h1, { color: T.text }]}>Edit income</Text>
                      <Text style={[styles.h2, { color: T.muted }]}>Changes update your analytics.</Text>
                    </View>
                  </View>
                </View>

                {/* Body */}
                <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                  {showLoading ? (
                    <View style={styles.loadingWrap}>
                      <ActivityIndicator color={T.primary} />
                      <Text style={{ marginTop: 10, color: T.muted }}>
                        {isError ? "Failed to load income..." : "Loading income..."}
                      </Text>
                    </View>
                  ) : (
                    <Animated.View
                      style={{
                        opacity: formOpacity,
                        transform: [{ translateY: formTranslateY }],
                      }}
                    >
                      <View>
                        <Text style={[styles.label, { color: T.muted }]}>Name</Text>
                        <TextInput
                          value={form.name}
                          onChangeText={(v) => updateField("name", v)}
                          placeholder="Eg. Salary, shift payment"
                          placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                          style={[styles.input, { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder }]}
                          editable={!disabled}
                        />

                        <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Amount (AUD)</Text>
                        <TextInput
                          value={form.amount}
                          onChangeText={(v) => updateField("amount", v)}
                          placeholder="0.00"
                          keyboardType="decimal-pad"
                          placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                          style={[styles.input, { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder }]}
                          editable={!disabled}
                        />

                        <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Date</Text>
                        <DateField
                          valueYmd={form.date}
                          onChangeYmd={(v) => updateField("date", v)}
                          disabled={disabled}
                          isDark={isDark}
                          borderColor={T.inputBorder}
                          bgColor={T.inputBg}
                          textColor={T.text}
                          mutedColor={T.muted}
                        />

                        <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Source</Text>
                        <View style={[styles.selectField, { borderColor: T.inputBorder, backgroundColor: T.inputBg, opacity: 0.7 }]}>
                          <Text style={{ color: T.text, fontSize: 14, fontWeight: "500" }}>
                            {SOURCE_OPTIONS.find((x) => x === form.source) ?? "manual"}
                          </Text>
                          <Ionicons name="lock-closed-outline" size={16} color={T.muted} />
                        </View>

                        <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Tags (optional)</Text>
                        <TextInput
                          value={form.tagsInput}
                          onChangeText={(v) => updateField("tagsInput", v)}
                          placeholder="Eg. woolies, overtime, bonus"
                          placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                          style={[styles.input, { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder }]}
                          editable={!disabled}
                        />
                        <Text style={{ marginTop: 6, color: T.muted, fontSize: 11 }}>
                          Comma separated, max 20 tags.
                        </Text>

                        <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Notes (optional)</Text>
                        <TextInput
                          value={form.notes}
                          onChangeText={(v) => updateField("notes", v)}
                          placeholder="Eg. Salary includes Sunday penalty."
                          placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                          multiline
                          style={[
                            styles.input,
                            styles.textarea,
                            { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder },
                          ]}
                          editable={!disabled}
                        />
                      </View>
                    </Animated.View>
                  )}

                  {error ? (
                    <View
                      style={[
                        styles.errorBox,
                        { borderColor: "rgba(239,68,68,0.30)", backgroundColor: "rgba(239,68,68,0.10)" },
                      ]}
                    >
                      <Text style={{ color: T.danger, fontWeight: "600" }}>Can’t save</Text>
                      <Text style={{ color: T.danger, marginTop: 4, fontWeight: "400" }}>{error}</Text>
                    </View>
                  ) : null}
                </ScrollView>

                {/* Footer */}
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
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <Text style={{ color: T.text, fontWeight: "600" }}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSave}
                    disabled={saving || showLoading}
                    style={({ pressed }) => [
                      styles.footerBtnPrimary,
                      { backgroundColor: T.primary, opacity: pressed ? 0.92 : 1 },
                    ]}
                  >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Save changes</Text>}
                  </Pressable>
                </View>
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

  pill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },

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

  // date picker sheet shared styles
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

  selectHeader: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
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

  loadingWrap: {
    flex: 1,
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  errorBox: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
});