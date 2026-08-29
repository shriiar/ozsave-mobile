import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@/src/context/ThemeContext";
import { useGlassStyle } from "@/src/context/GlassStyleContext";
import { AdminSearchUser } from "./api";
import AdminUserRow from "./AdminUserRow";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  searchResults: AdminSearchUser[];
  searching: boolean;
  invite: (userId: string) => Promise<any>;
  removeInvite: (userId: string) => Promise<any>;
  onSearch: () => Promise<any> | void;
};

export default function AdminSearchPanel({
  search,
  setSearch,
  searchResults,
  searching,
  invite,
  removeInvite,
  onSearch,
}: Props) {
  const { resolvedTheme } = useTheme();
  const { glassStyle } = useGlassStyle();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    return {
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
      text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
      muted: isDark ? "rgba(148,163,184,0.82)" : "#64748B",
      inputBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.70)",
      primary: "#4F46E5",
      btnText: "#FFFFFF",
    };
  }, [isDark]);

  return (
    <GlassView
      glassEffectStyle={glassStyle}
      colorScheme={isDark ? "dark" : "light"}
      style={[styles.panel, { borderColor: T.border }]}
    >
      <Text style={[styles.heading, { color: T.text }]}>Search users</Text>
      <Text style={[styles.subheading, { color: T.muted }]}>
        Find users by name or email and invite them.
      </Text>

      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchWrap,
            { borderColor: T.border, backgroundColor: T.inputBg },
          ]}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email"
            placeholderTextColor={T.muted}
            style={[styles.input, { color: T.text }]}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>

        <Pressable
          onPress={onSearch}
          disabled={searching || search.trim().length < 2}
          style={({ pressed }) => [
            styles.searchBtn,
            {
              backgroundColor: T.primary,
              opacity:
                searching || search.trim().length < 2
                  ? 0.45
                  : pressed
                  ? 0.88
                  : 1,
            },
          ]}
        >
          <Text style={[styles.searchBtnText, { color: T.btnText }]}>
            {searching ? "..." : "Search"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {searching && searchResults.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={T.primary} />
            <Text style={[styles.loadingText, { color: T.muted }]}>
              Searching...
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: T.text }]}>
              {search.trim() ? "No results" : "Start searching"}
            </Text>
            <Text style={[styles.emptySub, { color: T.muted }]}>
              {search.trim()
                ? "Try another spelling or search by email."
                : "Type at least 2 to 3 characters, then tap Search."}
            </Text>
          </View>
        ) : (
          <View style={styles.rowsWrap}>
            {searchResults.map((item) => (
              <AdminUserRow
                key={item._id}
                user={item}
                invited={!!item.invited}
                onInvite={() => invite(item._id)}
                onRemoveInvite={() => removeInvite(item._id)}
              />
            ))}
          </View>
        )}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 16,
  },
  heading: { fontSize: 16, fontWeight: "800" },
  subheading: { marginTop: 4, fontSize: 13, lineHeight: 18 },

  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    alignItems: "center",
  },

  searchWrap: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },

  input: { fontSize: 14, fontWeight: "500" },

  searchBtn: {
    minWidth: 92,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  searchBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },

  body: { marginTop: 12 },
  rowsWrap: { gap: 10 },
  loadingWrap: { paddingVertical: 24, alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 13 },
  emptyWrap: { paddingVertical: 28 },
  emptyTitle: { fontSize: 14, fontWeight: "800" },
  emptySub: { marginTop: 4, fontSize: 13, lineHeight: 18 },
});