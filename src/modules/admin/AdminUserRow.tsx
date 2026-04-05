import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  invited?: boolean;
  onInvite?: () => void;
  onRemoveInvite?: () => void;
};

function initials(name?: string) {
  return (
    String(name ?? "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function AdminUserRow({
  user,
  invited = false,
  onInvite,
  onRemoveInvite,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    return {
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
      text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
      muted: isDark ? "rgba(148,163,184,0.82)" : "#64748B",
      rowBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.65)",
      indigoBg: isDark ? "rgba(79,70,229,0.18)" : "rgba(79,70,229,0.10)",
      greenBg: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.10)",
      greenText: isDark ? "rgba(167,243,208,0.95)" : "#047857",
      redBg: isDark ? "rgba(239,68,68,0.16)" : "rgba(239,68,68,0.10)",
      redText: isDark ? "rgba(252,165,165,0.95)" : "#B91C1C",
      primary: "#4F46E5",
    };
  }, [isDark]);

  return (
    <View style={[styles.row, { borderColor: T.border, backgroundColor: T.rowBg }]}>
      <View style={[styles.avatar, { backgroundColor: T.indigoBg, borderColor: T.border }]}>
        <Text style={[styles.avatarText, { color: T.text }]}>{initials(user.name)}</Text>
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: T.text }]}>
          {user.name}
        </Text>
        <Text numberOfLines={1} style={[styles.email, { color: T.muted }]}>
          {user.email}
        </Text>
      </View>

      {invited ? (
        <Pressable
          onPress={onRemoveInvite}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: T.redBg,
              borderColor: T.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="trash-outline" size={16} color={T.redText} />
        </Pressable>
      ) : (
        <Pressable
          onPress={onInvite}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: T.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: "#fff" }]}>Invite</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    height: 42,
    width: 42,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "800" },
  info: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  name: { fontSize: 13, fontWeight: "800" },
  email: { marginTop: 3, fontSize: 12, fontWeight: "500" },
  actions: {
    alignItems: "flex-end",
    gap: 8,
    flexShrink: 0,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "800" },
  btn: {
    minWidth: 74,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 12, fontWeight: "800" },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});