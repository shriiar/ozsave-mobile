// src/modules/income/AddIncomeModal.tsx
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/context/ThemeContext";
import { useAddIncome } from "@/src/modules/income/hooks/useIncomeApi";
import type { AddIncomePayload, IncomeSource, IncomeStatus } from "@/src/modules/income/api";

type Props = { open: boolean; onClose: () => void };

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

type FormState = {
  name: string;
  amount: string;
  date: string; // YYYY-MM-DD
  source: IncomeSource;
  status: IncomeStatus;
  tagsText: string;
  notes: string;
};

function SourceSelect({
  value,
  onChange,
  disabled,
  isDark,
  borderColor,
  bgColor,
  textColor,
  mutedColor,
}: {
  value: IncomeSource;
  onChange: (v: IncomeSource) => void;
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
        selectedValue={value}
        onValueChange={(v) => onChange(String(v) as IncomeSource)}
        dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
        style={{ color: textColor }}
        itemStyle={{ color: textColor, fontSize: 16 }}
      >
        <Picker.Item label="Manual" value="manual" />
        <Picker.Item label="Estimate" value="estimate" />
      </Picker>
    </View>
  );
}

function StatusSelect({
  value,
  onChange,
  disabled,
  isDark,
  borderColor,
  bgColor,
  textColor,
  mutedColor,
}: {
  value: IncomeStatus;
  onChange: (v: IncomeStatus) => void;
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
        selectedValue={value}
        onValueChange={(v) => onChange(String(v) as IncomeStatus)}
        dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
        style={{ color: textColor }}
        itemStyle={{ color: textColor, fontSize: 16 }}
      >
        <Picker.Item label="Confirmed" value="confirmed" />
        <Picker.Item label="Pending" value="pending" />
        <Picker.Item label="Ignored" value="ignored" />
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
  const [show, setShow] = useState(false);
  const valueDate = useMemo(() => dateFromYmd(valueYmd), [valueYmd]);

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
                      // @ts-ignore
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

export default function AddIncomeModal({ open, onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const insets = useSafeAreaInsets();

  const add = useAddIncome();
  const saving = add.isPending;

  const makeInitial = (): FormState => ({
    name: "",
    amount: "",
    date: ymdToday(),
    source: "manual",
    status: "confirmed",
    tagsText: "",
    notes: "",
  });

  const [form, setForm] = useState<FormState>(makeInitial());
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(makeInitial());
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

    return { modalBgGrad, glowA, border, headerBorder, text, muted, inputBg, inputBorder, primary, danger, shadow };
  }, [isDark]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function buildPayload(): AddIncomePayload {
    const trimmedName = form.name.trim();
    const amountNum = Number(form.amount);

    if (!trimmedName) throw new Error("Income name is required.");
    if (trimmedName.length < 3 || trimmedName.length > 30) {
      throw new Error("Income name must be between 3 and 30 characters.");
    }
    if (!form.amount || !Number.isFinite(amountNum) || amountNum <= 0) {
      throw new Error("Amount must be a number greater than 0.");
    }

    let dateIso: string | undefined;
    if (form.date) {
      const d = new Date(form.date);
      if (Number.isNaN(d.getTime())) throw new Error("Date is invalid.");
      dateIso = d.toISOString();
    }

    const tags: string[] | undefined =
      form.tagsText.trim().length === 0
        ? undefined
        : form.tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 20);

    return {
      name: trimmedName,
      amount: amountNum,
      date: dateIso,
      source: form.source,
      status: form.status,
      tags,
      notes: form.notes.trim() || undefined,
    };
  }

  function handleSave() {
    setError(null);

    let payload: AddIncomePayload;
    try {
      payload = buildPayload();
    } catch (e: any) {
      setError(e?.message || "Invalid form data");
      return;
    }

    add.mutate(payload, {
      onSuccess: () => onClose(),
      onError: (err: any) => {
        setError(err?.response?.data?.message || err?.message || "Failed to save income");
      },
    });
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => !saving && onClose()}>
      {/* Backdrop */}
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
                      <Ionicons name="cash-outline" size={18} color={T.text} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.h1, { color: T.text }]}>Add income</Text>
                      <Text style={[styles.h2, { color: T.muted }]}>
                        Record an income entry. Only confirmed incomes count in analytics.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Body */}
                <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                  <View style={[styles.block, { borderColor: T.border }]}>
                    <Text style={[styles.label, { color: T.muted }]}>Name</Text>
                    <TextInput
                      value={form.name}
                      onChangeText={(v) => update("name", v)}
                      placeholder="Eg. Woolworths pay, Uber Eats, freelance"
                      placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                      style={[styles.input, { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder }]}
                    />

                    <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Amount (AUD)</Text>
                    <TextInput
                      value={form.amount}
                      onChangeText={(v) => update("amount", v)}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                      style={[styles.input, { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder }]}
                    />

                    <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Date</Text>
                    <DateField
                      valueYmd={form.date}
                      onChangeYmd={(v) => update("date", v)}
                      disabled={saving}
                      isDark={isDark}
                      borderColor={T.inputBorder}
                      bgColor={T.inputBg}
                      textColor={T.text}
                      mutedColor={T.muted}
                    />

                    <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Source</Text>
                    <SourceSelect
                      value={form.source}
                      onChange={(v) => update("source", v)}
                      disabled={saving}
                      isDark={isDark}
                      borderColor={T.inputBorder}
                      bgColor={T.inputBg}
                      textColor={T.text}
                      mutedColor={T.muted}
                    />

                    <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Tags (optional)</Text>
                    <TextInput
                      value={form.tagsText}
                      onChangeText={(v) => update("tagsText", v)}
                      placeholder="Eg. salary, tfn, casual, bonus (comma separated)"
                      placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                      style={[styles.input, { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder }]}
                    />
                    <Text style={{ marginTop: 6, color: T.muted, fontSize: 11, fontWeight: "500" }}>
                      Up to 20 tags.
                    </Text>

                    <Text style={[styles.label, { color: T.muted, marginTop: 12 }]}>Notes (optional)</Text>
                    <TextInput
                      value={form.notes}
                      onChangeText={(v) => update("notes", v)}
                      placeholder="Eg. Week 23 pay after tax, includes Sunday penalty."
                      placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                      multiline
                      style={[
                        styles.input,
                        styles.textarea,
                        { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder },
                      ]}
                    />
                  </View>

                  {error ? (
                    <View style={[styles.errorBox, { borderColor: "rgba(239,68,68,0.30)", backgroundColor: "rgba(239,68,68,0.10)" }]}>
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
                    disabled={saving}
                    style={({ pressed }) => [
                      styles.footerBtnPrimary,
                      { backgroundColor: T.primary, opacity: pressed ? 0.92 : 1 },
                    ]}
                  >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>}
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
  kav: { flex: 1 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  modalWrap: {
    width: "100%",
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },

  modal: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    // borderWidth: StyleSheet.hairlineWidth,
  },


  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    // borderBottomWidth: StyleSheet.hairlineWidth,
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
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },

  h1: { fontSize: 16, fontWeight: "600" },
  h2: { marginTop: 2, fontSize: 12, fontWeight: "400", lineHeight: 16 },

  body: { padding: 16, paddingBottom: 18 },

  block: { borderRadius: 16, 
    // borderWidth: StyleSheet.hairlineWidth, 
    padding: 14 },

  label: { fontSize: 12, fontWeight: "500" },

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

  footer: { padding: 14, 
    // borderTopWidth: StyleSheet.hairlineWidth,
     flexDirection: "row", gap: 10 },
  footerBtn: {
    flex: 1,
    borderRadius: 14,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnPrimary: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center" },

  // selects
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

  pickerWrap: {
    marginTop: 8,
    // borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: "hidden",
  },

  errorBox: { marginTop: 14, borderRadius: 16, 
    // borderWidth: StyleSheet.hairlineWidth, 
    padding: 12 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 },

  selectHeader: { padding: 14, 
    // borderBottomWidth: StyleSheet.hairlineWidth 
  },
  selectFooter: { padding: 12, 
    // borderTopWidth: StyleSheet.hairlineWidth, 
    alignItems: "flex-end" },

  dateSheet: {
    borderRadius: 16,
    overflow: "hidden",
    // borderWidth: StyleSheet.hairlineWidth,
    maxHeight: "70%",
    width: "100%",
  },
});