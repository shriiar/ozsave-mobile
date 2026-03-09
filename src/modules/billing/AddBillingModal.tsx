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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useAddBilling } from "./hooks/useBillingApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  "groceries",
  "rent",
  "utilities",
  "transport",
  "eating_out",
  "shopping",
  "health",
  "entertainment",
  "other",
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

export default function AddBillingModal({ open, onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { user } = useAuth();
  const add = useAddBilling();

  const insets = useSafeAreaInsets();

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

  const saving = add.isPending;

  React.useEffect(() => {
    if (!open) return;
    setForm(makeInitial());
    setError(null);
  }, [open]);

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

  function buildPayload() {
    if (!members.length)
      throw new Error("No members in this house.");

    const name = form.name.trim();
    if (!name || name.length < 3 || name.length > 20)
      throw new Error("Name must be 3-20 characters.");

    const amount = Number(form.amount);
    if (!amount || amount <= 0)
      throw new Error("Amount must be greater than 0.");

    if (!form.category)
      throw new Error("Category is required.");

    if (!form.paidBy)
      throw new Error("Select who pays.");

    if (!form.sharedBy.length)
      throw new Error("Select at least one member.");

    if (!form.startDate)
      throw new Error("Start date required.");

    if (form.endDate && form.endDate < form.startDate)
      throw new Error("End date cannot be before start date.");

    return {
      name,
      amount,
      category: form.category,
      frequency: form.frequency,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate
        ? new Date(form.endDate).toISOString()
        : undefined,
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
        onError: (err: any) =>
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to save billing"
          ),
      });
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <Modal visible={open} transparent animationType="fade">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => !saving && onClose()}
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <BlurView
          intensity={isDark ? 70 : 90}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.center}>
            <View style={styles.modal}>
              <ScrollView
                contentContainerStyle={{ padding: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.title}>Add billing</Text>

                <TextInput
                  placeholder="Name"
                  value={form.name}
                  onChangeText={(v) => update("name", v)}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Amount"
                  value={form.amount}
                  keyboardType="decimal-pad"
                  onChangeText={(v) => update("amount", v)}
                  style={styles.input}
                />

                <Text style={styles.label}>Frequency</Text>

                {(["weekly", "monthly", "yearly"] as Frequency[]).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => update("frequency", f)}
                    style={styles.chip}
                  >
                    <Text>{f}</Text>
                  </Pressable>
                ))}

                <Text style={styles.label}>Paid by</Text>

                {members.map((m) => {
                  const active = form.paidBy === m._id;

                  return (
                    <Pressable
                      key={m._id}
                      onPress={() => update("paidBy", m._id)}
                      style={styles.member}
                    >
                      <Text>{initials(m.name)}</Text>
                      <Text>{m.name}</Text>
                      {active && <Text>✓</Text>}
                    </Pressable>
                  );
                })}

                <Text style={styles.label}>Shared by</Text>

                {members.map((m) => {
                  const checked = form.sharedBy.includes(m._id);

                  return (
                    <Pressable
                      key={m._id}
                      onPress={() => toggleShared(m._id)}
                      style={styles.member}
                    >
                      <Text>{m.name}</Text>
                      {checked && <Text>✓</Text>}
                    </Pressable>
                  );
                })}

                <TextInput
                  placeholder="Notes"
                  value={form.notes}
                  onChangeText={(v) => update("notes", v)}
                  style={styles.input}
                />

                {error && (
                  <Text style={{ color: "red", marginTop: 10 }}>
                    {error}
                  </Text>
                )}

                <Pressable
                  onPress={handleSave}
                  style={styles.save}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff" }}>
                      Save billing
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  label: {
    marginTop: 16,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
  },

  chip: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 6,
  },

  member: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 6,
  },

  save: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
});