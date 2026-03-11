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
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useBilling, useUpdateBilling } from "./hooks/useBillingApi";

type Member = {
  _id: string;
  name: string;
  email: string;
};

type Props = {
  billingId: string | null;
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
  isActive: boolean;
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

const FREQUENCY_OPTIONS: { key: Frequency; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

function initials(name?: string) {
  const s = (name ?? "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

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
  const current =
    CATEGORY_OPTIONS.find((c) => c.key === value)?.label ?? "";

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
        <Text
          style={{
            color: current ? textColor : mutedColor,
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {current || "Select category"}
        </Text>
        <Ionicons name="chevron-down" size={16} color={mutedColor} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={StyleSheet.absoluteFill}>
          <BlurView
            intensity={isDark ? 70 : 90}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
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

          <View style={[styles.modalOverlay, { backgroundColor: "transparent" }]}>
            <BlurView
              intensity={isDark ? 28 : 45}
              tint={isDark ? "dark" : "light"}
              style={[styles.categorySheet, { borderColor }]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? [
                        "rgba(2,6,23,0.55)",
                        "rgba(15,23,42,0.35)",
                        "rgba(2,6,23,0.25)",
                      ]
                    : [
                        "rgba(255,255,255,0.78)",
                        "rgba(255,255,255,0.60)",
                        "rgba(255,255,255,0.50)",
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View
                style={[styles.selectHeader, { borderBottomColor: borderColor }]}
              >
                <Text
                  style={{ color: textColor, fontSize: 15, fontWeight: "600" }}
                >
                  Category
                </Text>
                <Text
                  style={{
                    color: mutedColor,
                    marginTop: 2,
                    fontSize: 12,
                    fontWeight: "400",
                  }}
                >
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
                      <Picker.Item
                        key={c.key}
                        label={c.label}
                        value={c.key}
                      />
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
                            borderColor: active
                              ? "rgba(79,70,229,0.35)"
                              : borderColor,
                            backgroundColor: active
                              ? "rgba(79,70,229,0.10)"
                              : "transparent",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: textColor,
                            fontSize: 14,
                            fontWeight: active ? "600" : "500",
                          }}
                        >
                          {c.label}
                        </Text>
                        {active ? (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#4F46E5"
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              <View
                style={[styles.selectFooter, { borderTopColor: borderColor }]}
              >
                <Pressable
                  onPress={() => {
                    if (Platform.OS === "ios") onChange(draft);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <Text
                    style={{ color: textColor, fontSize: 14, fontWeight: "600" }}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>
    </>
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
  mutedColor,
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Frequency>(value || "monthly");
  const current =
    FREQUENCY_OPTIONS.find((c) => c.key === value)?.label ?? "";

  React.useEffect(() => {
    if (open) setDraft(value || "monthly");
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
        <Text
          style={{
            color: current ? textColor : mutedColor,
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          {current || "Select frequency"}
        </Text>
        <Ionicons name="chevron-down" size={16} color={mutedColor} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={StyleSheet.absoluteFill}>
          <BlurView
            intensity={isDark ? 70 : 90}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
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

          <View style={[styles.modalOverlay, { backgroundColor: "transparent" }]}>
            <BlurView
              intensity={isDark ? 28 : 45}
              tint={isDark ? "dark" : "light"}
              style={[styles.categorySheet, { borderColor }]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? [
                        "rgba(2,6,23,0.55)",
                        "rgba(15,23,42,0.35)",
                        "rgba(2,6,23,0.25)",
                      ]
                    : [
                        "rgba(255,255,255,0.78)",
                        "rgba(255,255,255,0.60)",
                        "rgba(255,255,255,0.50)",
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View
                style={[styles.selectHeader, { borderBottomColor: borderColor }]}
              >
                <Text
                  style={{ color: textColor, fontSize: 15, fontWeight: "600" }}
                >
                  Frequency
                </Text>
                <Text
                  style={{
                    color: mutedColor,
                    marginTop: 2,
                    fontSize: 12,
                    fontWeight: "400",
                  }}
                >
                  Choose billing frequency
                </Text>
              </View>

              {Platform.OS === "ios" ? (
                <View style={{ paddingHorizontal: 8, paddingVertical: 10 }}>
                  <Picker
                    selectedValue={draft}
                    onValueChange={(v) => setDraft(v as Frequency)}
                    itemStyle={{ color: textColor, fontSize: 16 }}
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <Picker.Item
                        key={f.key}
                        label={f.label}
                        value={f.key}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ padding: 10 }}>
                  {FREQUENCY_OPTIONS.map((f) => {
                    const active = f.key === value;
                    return (
                      <Pressable
                        key={f.key}
                        onPress={() => {
                          onChange(f.key);
                          setOpen(false);
                        }}
                        style={({ pressed }) => [
                          styles.selectRow,
                          {
                            opacity: pressed ? 0.9 : 1,
                            borderColor: active
                              ? "rgba(79,70,229,0.35)"
                              : borderColor,
                            backgroundColor: active
                              ? "rgba(79,70,229,0.10)"
                              : "transparent",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: textColor,
                            fontSize: 14,
                            fontWeight: active ? "600" : "500",
                          }}
                        >
                          {f.label}
                        </Text>
                        {active ? (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#4F46E5"
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              <View
                style={[styles.selectFooter, { borderTopColor: borderColor }]}
              >
                <Pressable
                  onPress={() => {
                    if (Platform.OS === "ios") onChange(draft);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <Text
                    style={{ color: textColor, fontSize: 14, fontWeight: "600" }}
                  >
                    Done
                  </Text>
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
  const valueDate = React.useMemo(
    () => dateFromYmd(valueYmd || ymdToday()),
    [valueYmd]
  );

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

              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setShow(false)}
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

              <View style={[styles.modalOverlay, { backgroundColor: "transparent" }]}>
                <BlurView
                  intensity={isDark ? 28 : 45}
                  tint={isDark ? "dark" : "light"}
                  style={[styles.dateSheet, { borderColor }]}
                >
                  <LinearGradient
                    colors={
                      isDark
                        ? [
                            "rgba(2,6,23,0.55)",
                            "rgba(15,23,42,0.35)",
                            "rgba(2,6,23,0.25)",
                          ]
                        : [
                            "rgba(255,255,255,0.78)",
                            "rgba(255,255,255,0.60)",
                            "rgba(255,255,255,0.50)",
                          ]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View
                    style={[styles.selectHeader, { borderBottomColor: borderColor }]}
                  >
                    <Text
                      style={{ color: textColor, fontSize: 15, fontWeight: "600" }}
                    >
                      {title}
                    </Text>
                    <Text
                      style={{
                        color: mutedColor,
                        marginTop: 2,
                        fontSize: 12,
                        fontWeight: "400",
                      }}
                    >
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

                  <View
                    style={[styles.selectFooter, { borderTopColor: borderColor }]}
                  >
                    <Pressable
                      onPress={() => setShow(false)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                    >
                      <Text
                        style={{ color: textColor, fontSize: 14, fontWeight: "600" }}
                      >
                        Done
                      </Text>
                    </Pressable>
                  </View>
                </BlurView>
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

export default function EditBillingModal({
  billingId,
  open,
  onClose,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const members: Member[] = useMemo(() => {
    return ((user as any)?.house?.members ?? []) as Member[];
  }, [user]);

  const currentUserId = (user as any)?._id as string | undefined;

  const { data: billing, isLoading } = useBilling(billingId, open);
  const updateBilling = useUpdateBilling();
  const saving = updateBilling.isPending;

  const [form, setForm] = useState<BillingForm>({
    name: "",
    amount: "",
    category: "",
    frequency: "monthly",
    startDate: "",
    endDate: "",
    paidBy: currentUserId ?? "",
    sharedBy: currentUserId ? [currentUserId] : [],
    notes: "",
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !billing) return;

    const paidById =
      typeof billing.paidBy === "string"
        ? billing.paidBy
        : billing.paidBy?._id ?? "";

    const sharedIds = (billing.sharedBy ?? []).map((m: any) =>
      typeof m === "string" ? m : m?._id
    );

    setForm({
      name: billing.name ?? "",
      amount:
        billing.amount != null ? String(Number(billing.amount)) : "",
      category: (billing as any).category ?? "",
      frequency: (billing.frequency as Frequency) ?? "monthly",
      startDate: billing.startDate?.slice(0, 10) ?? "",
      endDate: billing.endDate?.slice(0, 10) ?? "",
      paidBy: paidById,
      sharedBy: sharedIds.filter(Boolean),
      notes: billing.notes ?? "",
      isActive: !!billing.isActive,
    });

    setError(null);
  }, [open, billing]);

  const T = useMemo(() => {
    const modalBgGrad = isDark
      ? ["rgba(2,6,23,0.58)", "rgba(15,23,42,0.46)", "rgba(2,6,23,0.38)"]
      : [
          "rgba(255,255,255,0.78)",
          "rgba(255,255,255,0.62)",
          "rgba(255,255,255,0.52)",
        ];

    const glowA = isDark
      ? ["rgba(79,70,229,0.20)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"]
      : ["rgba(79,70,229,0.22)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"];

    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const headerBorder = isDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.06)";

    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.82)" : "#64748B";

    const inputBg = isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(255,255,255,0.70)";
    const inputBorder = isDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.10)";

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
    if (!billingId) throw new Error("Missing billing id");
    if (!members.length) {
      throw new Error("No members in this house. You cannot edit a billing yet.");
    }

    const name = form.name.trim();
    if (!name || name.length < 3 || name.length > 20) {
      throw new Error("Name must be 3-20 characters.");
    }

    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
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

    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      throw new Error("End date cannot be before start date.");
    }

    return {
      id: billingId,
      payload: {
        name,
        amount,
        category: form.category,
        endDate: form.endDate
          ? new Date(form.endDate).toISOString()
          : undefined,
        paidBy: form.paidBy,
        sharedBy: form.sharedBy,
        notes: form.notes.trim() || undefined,
        isActive: form.isActive,
      },
    };
  }

  function handleSave() {
    setError(null);

    try {
      const input = buildPayload();

      updateBilling.mutate(input as any, {
        onSuccess: () => onClose(),
        onError: (err: any) => {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to update billing"
          );
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
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
            paddingHorizontal: 7,
          },
        ]}
      >
        <BlurView
          intensity={isDark ? 70 : 90}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.kav}
        >
          <View style={styles.center}>
            <View style={styles.modalWrap}>
              <BlurView
                intensity={isDark ? 28 : 45}
                tint={isDark ? "dark" : "light"}
                style={[styles.modal, { borderColor: T.border }, T.shadow]}
              >
                <LinearGradient
                  colors={T.modalBgGrad as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <LinearGradient
                  colors={T.glowA as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.glow, { top: -90, left: -90 }]}
                />

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
                      <Text style={[styles.h1, { color: T.text }]}>
                        Edit billing
                      </Text>
                      <Text style={[styles.h2, { color: T.muted }]}>
                        Update recurring billing details with the same UI style.
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => !saving && onClose()}
                    style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
                    hitSlop={10}
                    disabled={saving}
                  >
                    <View
                      style={[
                        styles.closeBtn,
                        { borderColor: T.border, backgroundColor: T.inputBg },
                      ]}
                    >
                      <Ionicons name="close" size={18} color={T.text} />
                    </View>
                  </Pressable>
                </View>

                {isLoading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={T.primary} />
                    <Text style={{ marginTop: 10, color: T.muted }}>
                      Loading billing...
                    </Text>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      contentContainerStyle={styles.body}
                      keyboardShouldPersistTaps="handled"
                    >
                      <View
                        style={[
                          styles.block,
                          { borderColor: T.border, backgroundColor: "transparent" },
                        ]}
                      >
                        <View style={styles.blockHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.blockTitle, { color: T.text }]}>
                              Billing details
                            </Text>
                            <Text style={[styles.blockSub, { color: T.muted }]}>
                              Name, amount, category and billing frequency.
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.label, { color: T.muted }]}>Name</Text>
                        <TextInput
                          value={form.name}
                          onChangeText={(v) => update("name", v)}
                          placeholder="Eg. Rent, Netflix"
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
                          onChangeText={(v) => update("amount", v)}
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
                          style={[styles.label, { color: T.muted, marginTop: 14 }]}
                        >
                          Category
                        </Text>
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

                        <Text
                          style={[styles.label, { color: T.muted, marginTop: 14 }]}
                        >
                          Frequency
                        </Text>
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

                        <Text
                          style={[styles.label, { color: T.muted, marginTop: 14 }]}
                        >
                          Notes (optional)
                        </Text>
                        <TextInput
                          value={form.notes}
                          onChangeText={(v) => update("notes", v)}
                          placeholder="Eg. Shared iCloud 2TB"
                          placeholderTextColor={
                            isDark
                              ? "rgba(148,163,184,0.55)"
                              : "rgba(100,116,139,0.65)"
                          }
                          multiline
                          style={[
                            styles.input,
                            styles.textarea,
                            {
                              color: T.text,
                              backgroundColor: T.inputBg,
                              borderColor: T.inputBorder,
                            },
                          ]}
                        />
                      </View>

                      <View
                        style={[
                          styles.block,
                          { borderColor: T.border, backgroundColor: "transparent" },
                        ]}
                      >
                        <View style={styles.blockHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.blockTitle, { color: T.text }]}>
                              Schedule
                            </Text>
                            <Text style={[styles.blockSub, { color: T.muted }]}>
                              Start date is read-only for editing. End date can be changed.
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.label, { color: T.muted }]}>
                          Start date
                        </Text>
                        <View
                          style={[
                            styles.input,
                            {
                              backgroundColor: T.inputBg,
                              borderColor: T.inputBorder,
                            },
                          ]}
                        >
                          <Text style={{ color: T.text, fontWeight: "500" }}>
                            {form.startDate || "N/A"}
                          </Text>
                        </View>

                        <Text
                          style={[styles.label, { color: T.muted, marginTop: 14 }]}
                        >
                          End date (optional)
                        </Text>
                        <DateField
                          valueYmd={form.endDate}
                          onChangeYmd={(v) => update("endDate", v)}
                          disabled={saving}
                          isDark={isDark}
                          borderColor={T.inputBorder}
                          bgColor={T.inputBg}
                          textColor={T.text}
                          mutedColor={T.muted}
                          title="Select end date"
                          subtitle="Leave empty if billing has no end"
                          minimumDate={
                            form.startDate ? dateFromYmd(form.startDate) : undefined
                          }
                        />

                        {form.endDate ? (
                          <Pressable
                            disabled={saving}
                            onPress={() => update("endDate", "")}
                            style={({ pressed }) => [
                              {
                                opacity: pressed ? 0.85 : 1,
                                marginTop: 10,
                                alignSelf: "flex-start",
                              },
                            ]}
                          >
                            <Text style={{ color: T.text, fontWeight: "600" }}>
                              Clear end date
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>

                      <View
                        style={[
                          styles.block,
                          { borderColor: T.border, backgroundColor: "transparent" },
                        ]}
                      >
                        <View style={styles.blockHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.blockTitle, { color: T.text }]}>
                              Paid by
                            </Text>
                            <Text style={[styles.blockSub, { color: T.muted }]}>
                              Choose the member who pays this billing.
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 10,
                            marginTop: 4,
                          }}
                        >
                          {members.map((m) => {
                            const active = form.paidBy === m._id;
                            return (
                              <Pressable
                                key={m._id}
                                disabled={saving}
                                onPress={() => update("paidBy", m._id)}
                                style={({ pressed }) => [
                                  { opacity: pressed ? 0.9 : 1 },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.memberChip,
                                    {
                                      borderColor: active
                                        ? "rgba(79,70,229,0.45)"
                                        : T.border,
                                      backgroundColor: active
                                        ? "rgba(79,70,229,0.10)"
                                        : T.inputBg,
                                    },
                                  ]}
                                >
                                  <View style={[styles.avatar, { borderColor: T.border }]}>
                                    <Text
                                      style={{
                                        color: T.text,
                                        fontWeight: "600",
                                        fontSize: 11,
                                      }}
                                    >
                                      {initials(m.name)}
                                    </Text>
                                  </View>

                                  <View style={{ minWidth: 140 }}>
                                    <Text
                                      numberOfLines={1}
                                      style={{
                                        color: T.text,
                                        fontWeight: "600",
                                        fontSize: 13,
                                      }}
                                    >
                                      {m.name}
                                    </Text>
                                    <Text
                                      numberOfLines={1}
                                      style={{
                                        color: T.muted,
                                        fontWeight: "400",
                                        fontSize: 12,
                                      }}
                                    >
                                      {m.email}
                                    </Text>
                                  </View>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>

                      <View
                        style={[
                          styles.block,
                          { borderColor: T.border, backgroundColor: "transparent" },
                        ]}
                      >
                        <View style={styles.blockHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.blockTitle, { color: T.text }]}>
                              Shared by
                            </Text>
                            <Text style={[styles.blockSub, { color: T.muted }]}>
                              Choose who shares this billing.
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 2,
                          }}
                        >
                          <Text style={[styles.label, { color: T.muted }]}>
                            Members
                          </Text>

                          <View style={{ flexDirection: "row", gap: 14 }}>
                            <Pressable
                              disabled={saving}
                              onPress={selectAllShared}
                              style={({ pressed }) => [
                                { opacity: pressed ? 0.85 : 1 },
                              ]}
                            >
                              <Text style={{ color: T.text, fontWeight: "600" }}>
                                All
                              </Text>
                            </Pressable>

                            {currentUserId ? (
                              <Pressable
                                disabled={saving}
                                onPress={selectJustMeShared}
                                style={({ pressed }) => [
                                  { opacity: pressed ? 0.85 : 1 },
                                ]}
                              >
                                <Text style={{ color: T.text, fontWeight: "600" }}>
                                  Just me
                                </Text>
                              </Pressable>
                            ) : null}
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 10,
                            marginTop: 10,
                          }}
                        >
                          {members.map((m) => {
                            const checked = form.sharedBy.includes(m._id);
                            return (
                              <Pressable
                                key={m._id}
                                disabled={saving}
                                onPress={() => toggleShared(m._id)}
                                style={({ pressed }) => [
                                  { opacity: pressed ? 0.9 : 1 },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.sharedChip,
                                    {
                                      borderColor: checked
                                        ? "rgba(16,185,129,0.45)"
                                        : T.border,
                                      backgroundColor: checked
                                        ? "rgba(16,185,129,0.10)"
                                        : T.inputBg,
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
                                  <Text
                                    style={{
                                      color: T.text,
                                      fontWeight: "600",
                                      fontSize: 13,
                                    }}
                                  >
                                    {m.name}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>

                        {form.sharedBy.length === 0 ? (
                          <Text
                            style={{
                              marginTop: 10,
                              color: T.danger,
                              fontWeight: "600",
                              fontSize: 12,
                            }}
                          >
                            Select at least 1 member.
                          </Text>
                        ) : null}
                      </View>

                      <View
                        style={[
                          styles.block,
                          { borderColor: T.border, backgroundColor: "transparent" },
                        ]}
                      >
                        <View style={styles.blockHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.blockTitle, { color: T.text }]}>
                              Status
                            </Text>
                            <Text style={[styles.blockSub, { color: T.muted }]}>
                              Enable or disable this billing.
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          disabled={saving}
                          onPress={() => update("isActive", !form.isActive)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                        >
                          <View
                            style={[
                              styles.sharedChip,
                              {
                                marginTop: 4,
                                alignSelf: "flex-start",
                                borderColor: form.isActive
                                  ? "rgba(16,185,129,0.45)"
                                  : T.border,
                                backgroundColor: form.isActive
                                  ? "rgba(16,185,129,0.10)"
                                  : T.inputBg,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.dot,
                                {
                                  backgroundColor: form.isActive
                                    ? "rgba(16,185,129,1)"
                                    : isDark
                                    ? "rgba(148,163,184,0.35)"
                                    : "rgba(100,116,139,0.35)",
                                },
                              ]}
                            />
                            <Text
                              style={{
                                color: T.text,
                                fontWeight: "600",
                                fontSize: 13,
                              }}
                            >
                              {form.isActive ? "Active" : "Inactive"}
                            </Text>
                          </View>
                        </Pressable>
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
                      style={[styles.footer, { borderTopColor: T.headerBorder }]}
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
                        disabled={saving}
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
                  </>
                )}
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
    borderWidth: StyleSheet.hairlineWidth,
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
  body: { padding: 16, paddingBottom: 18, gap: 14 },
  block: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  blockTitle: { fontSize: 14, fontWeight: "600" },
  blockSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
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
  errorBox: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});