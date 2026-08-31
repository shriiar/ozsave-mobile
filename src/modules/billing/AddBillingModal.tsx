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
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../context/ThemeContext";
import { useGlassStyle } from "../../context/GlassStyleContext";
import { useAuth } from "../../context/AuthContext";
import { useAddBilling } from "./hooks/useBillingApi";
import { typography } from "../../theme/typography";

type Member = {
  _id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

type Frequency = "weekly" | "monthly" | "yearly";

type BillingForm = {
  name: string;
  amount: string;
  category: string;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  paidBy: string;
  sharedBy: string[];
  notes: string;
};

const CATEGORY_OPTIONS = [
  { key: "groceries", label: "Groceries" },
  { key: "rent", label: "Rent" },
  { key: "utilities", label: "Utilities" },
  { key: "transport", label: "Public Transport" },
  { key: "private_transport", label: "Private Transport" },
  { key: "eating_out", label: "Eating out" },
  { key: "shopping", label: "Shopping" },
  { key: "health", label: "Health" },
  { key: "entertainment", label: "Entertainment" },
  { key: "education", label: "Education" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "personal_care", label: "Personal Care" },
  { key: "insurance", label: "Insurance" },
  { key: "travel", label: "Travel/Holidays" },
  { key: "other", label: "Other" },
];

const FREQUENCY_OPTIONS: { key: Frequency; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
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

function FrequencySelect({
  value,
  onChange,
  disabled,
  isDark,
  borderColor,
  bgColor,
  textColor,
}: {
  value: Frequency;
  onChange: (v: Frequency) => void;
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
        selectedValue={value || "monthly"}
        onValueChange={(v) => onChange(v as Frequency)}
        dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
        style={{ color: textColor }}
        itemStyle={{ color: textColor, fontSize: 16 }}
      >
        {FREQUENCY_OPTIONS.map((f) => (
          <Picker.Item key={f.key} label={f.label} value={f.key} />
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
  title = "Select date",
  subtitle = "Pick a day",
  minimumDate,
}: {
  valueYmd: string;
  onChangeYmd: (v: string) => void;
  disabled: boolean;
  isDark: boolean;
  borderColor: string;
  bgColor: string;
  textColor: string;
  mutedColor: string;
  title?: string;
  subtitle?: string;
  minimumDate?: Date;
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
          {
            opacity: pressed ? 0.9 : 1,
            borderColor,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Text style={[typography.footnote, { color: textColor }]}>
          {valueYmd || "Select date"}
        </Text>
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
                  <Text style={[typography.subheadlineEmphasized, { color: textColor }]}>{title}</Text>
                  <Text style={[typography.caption1, { color: mutedColor, marginTop: 2 }]}>
                    {subtitle}
                  </Text>
                </View>

                <View style={{ padding: 12 }}>
                  <DateTimePicker
                    value={valueDate}
                    mode="date"
                    display="spinner"
                    onChange={onChange}
                    themeVariant={isDark ? "dark" : "light"}
                    minimumDate={minimumDate}
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
          <DateTimePicker
            value={valueDate}
            mode="date"
            display="default"
            onChange={onChange}
            minimumDate={minimumDate}
          />
        )
      ) : null}
    </>
  );
}

export default function AddBillingModal({ open, onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const { glassStyle } = useGlassStyle();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();

  const members: Member[] = useMemo(() => {
    return ((user as any)?.house?.members ?? []) as Member[];
  }, [user]);

  const currentUserId = (user as any)?._id as string | undefined;

  const makeInitial = (): BillingForm => ({
    name: "",
    amount: "",
    category: "",
    frequency: "monthly",
    startDate: ymdToday(),
    endDate: "",
    paidBy: currentUserId ?? "",
    sharedBy: currentUserId ? [currentUserId] : [],
    notes: "",
  });

  const [form, setForm] = useState<BillingForm>(makeInitial());
  const [error, setError] = useState<string | null>(null);

  const add = useAddBilling();
  const saving = add.isPending;

  React.useEffect(() => {
    if (!open) return;
    setForm(makeInitial());
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

    return {
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

  function update<K extends keyof BillingForm>(key: K, value: BillingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleShared(memberId: string) {
    setForm((prev) => {
      const exists = prev.sharedBy.includes(memberId);
      const next = exists
        ? prev.sharedBy.filter((id) => id !== memberId)
        : [...prev.sharedBy, memberId];

      return { ...prev, sharedBy: next };
    });
  }

  function selectAllShared() {
    setForm((prev) => ({ ...prev, sharedBy: members.map((m) => m._id) }));
  }

  function selectJustMeShared() {
    if (!currentUserId) return;
    setForm((prev) => ({ ...prev, sharedBy: [currentUserId] }));
  }

  function buildPayload() {
    if (!members.length) throw new Error("No members in this house. You cannot add a billing yet.");

    const name = form.name.trim();
    if (!name || name.length < 3 || name.length > 20) {
      throw new Error("Name must be 3-20 characters.");
    }

    const amount = Number(form.amount);
    if (!form.amount || amount <= 0) {
      throw new Error("Amount must be greater than 0.");
    }

    if (!form.category.trim()) {
      throw new Error("Category is required.");
    }

    if (!form.paidBy) {
      throw new Error("Select who pays.");
    }

    if (!form.sharedBy.length) {
      throw new Error("Select at least one member.");
    }

    if (!form.startDate) {
      throw new Error("Start date required.");
    }

    if (form.endDate && form.endDate < form.startDate) {
      throw new Error("End date cannot be before start date.");
    }

    return {
      name,
      amount,
      category: form.category,
      frequency: form.frequency,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      paidBy: form.paidBy,
      sharedBy: form.sharedBy,
      notes: form.notes.trim() || undefined,
    };
  }

  function handleSave() {
    setError(null);

    try {
      const payload = buildPayload();

      add.mutate(payload as any, {
        onSuccess: () => onClose(),
        onError: (err: any) => {
          setError(err?.response?.data?.message || err?.message || "Failed to save billing");
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.kav}>
              <View style={[styles.modal, { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" }]}>

                <View style={[styles.header, { borderBottomColor: T.headerBorder }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={[styles.iconPill, { borderColor: T.border, backgroundColor: T.inputBg }]}> 
                      <Ionicons name="add" size={18} color={T.text} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[typography.headline, { color: T.text }]}>Add billing</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable
                      onPress={handleSave}
                      disabled={saving}
                      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
                    >
                      <GlassView
                        glassEffectStyle={glassStyle}
                        isInteractive={!saving}
                        tintColor="#FF9500"
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

                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                  <View> 
                    <View style={styles.blockHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.blockTitle, { color: T.text }]}>Billing details</Text>
                        <Text style={[styles.blockSub, { color: T.muted }]}>Name, amount, category and billing frequency.</Text>
                      </View>
                    </View>

                    <Text style={[styles.label, { color: T.muted }]}>Name</Text>
                    <TextInput
                      value={form.name}
                      onChangeText={(v) => update("name", v)}
                      placeholder="Eg. Rent, Netflix"
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

                    <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Category</Text>
                    <CategorySelect
                      value={form.category}
                      onChange={(v) => update("category", v)}
                      disabled={saving}
                      isDark={isDark}
                      borderColor={T.inputBorder}
                      bgColor={T.inputBg}
                      textColor={T.text}
                      mutedColor={T.muted}
                    />

                    <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>Frequency</Text>
                    <FrequencySelect
                      value={form.frequency}
                      onChange={(v) => update("frequency", v)}
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
                      onChangeText={(v) => update("notes", v)}
                      placeholder="Eg. Shared iCloud 2TB"
                      placeholderTextColor={isDark ? "rgba(148,163,184,0.55)" : "rgba(100,116,139,0.65)"}
                      multiline
                      style={[
                        styles.input,
                        styles.textarea,
                        { color: T.text, backgroundColor: T.inputBg, borderColor: T.inputBorder },
                      ]}
                    />
                  </View>

                  <View style={[styles.block, { borderColor: T.border, backgroundColor: "transparent" }]}> 
                    <View style={styles.blockHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.blockTitle, { color: T.text }]}>Schedule</Text>
                        <Text style={[styles.blockSub, { color: T.muted }]}>Start date and optional end date.</Text>
                      </View>
                    </View>

                    <Text style={[styles.label, { color: T.muted }]}>Start date</Text>
                    <DateField
                      valueYmd={form.startDate}
                      onChangeYmd={(v) => update("startDate", v)}
                      disabled={saving}
                      isDark={isDark}
                      borderColor={T.inputBorder}
                      bgColor={T.inputBg}
                      textColor={T.text}
                      mutedColor={T.muted}
                      title="Select start date"
                      subtitle="Choose when billing starts"
                    />

                    <Text style={[styles.label, { color: T.muted, marginTop: 14 }]}>End date (optional)</Text>
                    <DateField
                      valueYmd={form.endDate || form.startDate}
                      onChangeYmd={(v) => update("endDate", v)}
                      disabled={saving}
                      isDark={isDark}
                      borderColor={T.inputBorder}
                      bgColor={T.inputBg}
                      textColor={T.text}
                      mutedColor={T.muted}
                      title="Select end date"
                      subtitle="Leave empty if billing has no end"
                      minimumDate={dateFromYmd(form.startDate)}
                    />

                    {form.endDate ? (
                      <Pressable
                        disabled={saving}
                        onPress={() => update("endDate", "")}
                        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, marginTop: 10, alignSelf: "flex-start" }]}
                      >
                        <Text style={[typography.footnoteEmphasized, { color: T.text }]}>Clear end date</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <View style={[styles.block, { borderColor: T.border, backgroundColor: "transparent" }]}> 
                    <View style={styles.blockHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.blockTitle, { color: T.text }]}>Paid by</Text>
                        <Text style={[styles.blockSub, { color: T.muted }]}>Choose the member who pays this billing.</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                      {members.map((m) => {
                        const active = form.paidBy === m._id;
                        return (
                          <Pressable
                            key={m._id}
                            disabled={saving}
                            onPress={() => update("paidBy", m._id)}
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
                                <Text numberOfLines={1} style={[typography.footnoteEmphasized, { color: T.text }]}>{m.name}</Text>
                                <Text numberOfLines={1} style={[typography.caption1, { color: T.muted }]}>{m.email}</Text>
                              </View>
                            </GlassView>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View style={[styles.block, { borderColor: T.border, backgroundColor: "transparent" }]}> 
                    <View style={styles.blockHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.blockTitle, { color: T.text }]}>Shared by</Text>
                        <Text style={[styles.blockSub, { color: T.muted }]}>Choose who shares this billing.</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                      <Text style={[styles.label, { color: T.muted }]}>Members</Text>

                      <View style={{ flexDirection: "row", gap: 14 }}>
                        <Pressable disabled={saving} onPress={selectAllShared} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}> 
                          <Text style={[typography.footnoteEmphasized, { color: T.text }]}>All</Text>
                        </Pressable>

                        {currentUserId ? (
                          <Pressable disabled={saving} onPress={selectJustMeShared} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                            <Text style={[typography.footnoteEmphasized, { color: T.text }]}>Just me</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                      {members.map((m) => {
                        const checked = form.sharedBy.includes(m._id);
                        return (
                          <Pressable
                            key={m._id}
                            disabled={saving}
                            onPress={() => toggleShared(m._id)}
                            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                          >
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
                              <Text style={[typography.footnoteEmphasized, { color: T.text }]}>{m.name}</Text>
                            </GlassView>
                          </Pressable>
                        );
                      })}
                    </View>

                    {form.sharedBy.length === 0 ? (
                      <Text style={[typography.caption1, { marginTop: 10, color: T.danger, fontWeight: "600" }]}>
                        Select at least 1 member.
                      </Text>
                    ) : null}
                  </View>

                  {error ? (
                    <View style={[styles.errorBox, { borderColor: "rgba(239,68,68,0.30)", backgroundColor: "rgba(239,68,68,0.10)" }]}> 
                      <Text style={[typography.footnoteEmphasized, { color: T.danger }]}>Can’t save</Text>
                      <Text style={[typography.footnote, { color: T.danger, marginTop: 4 }]}>{error}</Text>
                    </View>
                  ) : null}
                </ScrollView>
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
    borderRadius: 18,
    // borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
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
  errorBox: { borderRadius: 16, 
    // borderWidth: StyleSheet.hairlineWidth, 
    padding: 12 },
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
  selectHeader: {
    padding: 14,
    // borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectFooter: {
    padding: 12,
    // borderTopWidth: StyleSheet.hairlineWidth,
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
  dateSheet: {
    borderRadius: 16,
    overflow: "hidden",
    // borderWidth: StyleSheet.hairlineWidth,
    maxHeight: "70%",
    width: "100%",
  },
});