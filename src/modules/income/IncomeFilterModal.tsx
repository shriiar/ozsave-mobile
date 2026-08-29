import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { useGlassStyle } from "@/src/context/GlassStyleContext";
import { Picker } from "@react-native-picker/picker";
import { DateRangePicker } from "@/src/components/DateRangePicker";
import { typography } from "@/src/theme/typography";

import type { IncomeSource, IncomeType } from "@/src/modules/income/api";

export type SortBy = "date" | "amount" | "name";
export type SortOrder = 1 | -1;

export type IncomeFiltersDraft = {
  name: string;
  source: IncomeSource | "all";
  incomeType: IncomeType | "all";
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  sortBy: SortBy;
  sortOrder: SortOrder;
};

type Props = {
  open: boolean;
  draft: IncomeFiltersDraft;
  setDraft: (next: IncomeFiltersDraft) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
};

function isInvalidRange(from: string, to: string) {
  return !!from && !!to && from > to;
}

export default function IncomeFilterModal({
  open,
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
    const inputText = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const placeholder = isDark ? "rgba(148,163,184,0.75)" : "rgba(100,116,139,0.85)";
    return { surfaceGrad, ring, text, muted, tile, danger, primary, inputText, placeholder };
  }, [isDark]);

  const invalidRange = isInvalidRange(draft.from, draft.to);

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

            {/* Body */}
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name contains */}
              <View>
                <Text style={[styles.label, { color: T.muted }]}>Name contains</Text>
                <View style={[styles.inputWrap, { backgroundColor: T.tile, borderColor: T.ring }]}>
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.55)"}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={draft.name}
                    onChangeText={(t) => setDraft({ ...draft, name: t })}
                    placeholder="e.g. Salary, Uber, Cash job..."
                    placeholderTextColor={T.placeholder}
                    style={[styles.textInput, { color: T.inputText }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                  />
                  {draft.name ? (
                    <Pressable
                      onPress={() => setDraft({ ...draft, name: "" })}
                      hitSlop={10}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.45)"}
                      />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* Source */}
              <View>
                <Text style={[styles.label, { color: T.muted }]}>Source</Text>
                <View style={[styles.tile, { backgroundColor: T.tile, borderColor: T.ring }]}>
                  <Picker
                    selectedValue={draft.source}
                    onValueChange={(v) => setDraft({ ...draft, source: String(v) as any })}
                    dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
                    style={{ color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" }}
                    itemStyle={{ color: isDark ? "#FFFFFF" : "#0F172A", fontSize: 16 }}
                  >
                    <Picker.Item label="All" value="all" />
                    <Picker.Item label="Manual" value="manual" />
                    <Picker.Item label="Import" value="import" />
                    <Picker.Item label="Estimate" value="estimate" />
                  </Picker>
                </View>
              </View>

              {/* Income type */}
              <View>
                <Text style={[styles.label, { color: T.muted }]}>Income type</Text>
                <View style={[styles.tile, { backgroundColor: T.tile, borderColor: T.ring }]}>
                  <Picker
                    selectedValue={draft.incomeType}
                    onValueChange={(v) => setDraft({ ...draft, incomeType: String(v) as any })}
                    dropdownIconColor={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.7)"}
                    style={{ color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" }}
                    itemStyle={{ color: isDark ? "#FFFFFF" : "#0F172A", fontSize: 16 }}
                  >
                    <Picker.Item label="All" value="all" />
                    <Picker.Item label="TFN" value="tfn" />
                    <Picker.Item label="ABN" value="abn" />
                    <Picker.Item label="Cash" value="cash" />
                  </Picker>
                </View>
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
                      style={{ color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" }}
                      itemStyle={{ color: isDark ? "#FFFFFF" : "#0F172A", fontSize: 16 }}
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

            {/* Footer */}
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
    overflow: "hidden",
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

  inputWrap: {
    height: 44,
    borderRadius: 16,
    // borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  textInput: {
    flex: 1,
    ...typography.footnoteEmphasized,
    paddingVertical: 0,
  },

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