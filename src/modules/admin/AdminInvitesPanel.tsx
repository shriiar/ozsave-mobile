import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@/src/context/ThemeContext";
import { AdminSearchUser } from "./api";
import AdminUserRow from "./AdminUserRow";

type Props = {
  invitedUsers: AdminSearchUser[];
  loadingInvites: boolean;
  removeInvite: (userId: string) => Promise<any>;
};

export default function AdminInvitesPanel({
  invitedUsers,
  loadingInvites,
  removeInvite,
}: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const T = useMemo(() => {
    return {
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
      text: isDark ? "rgba(255,255,255,0.92)" : "#0F172A",
      muted: isDark ? "rgba(148,163,184,0.82)" : "#64748B",
      primary: "#4F46E5",
    };
  }, [isDark]);

  return (
    <GlassView
      glassEffectStyle="regular"
      colorScheme={isDark ? "dark" : "light"}
      style={[styles.panel, { borderColor: T.border }]}
    >
      <Text style={[styles.heading, { color: T.text }]}>Pending invites</Text>
      <Text style={[styles.subheading, { color: T.muted }]}>
        Users waiting to join your house.
      </Text>

      <View style={styles.body}>
        {loadingInvites ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={T.primary} />
            <Text style={[styles.loadingText, { color: T.muted }]}>
              Loading invites...
            </Text>
          </View>
        ) : invitedUsers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyTitle, { color: T.text }]}>
              No pending invitations
            </Text>
            <Text style={[styles.emptySub, { color: T.muted }]}>
              Invited users will appear here until they accept.
            </Text>
          </View>
        ) : (
          <View style={styles.rowsWrap}>
            {invitedUsers.map((item) => (
              <AdminUserRow
                key={item._id}
                user={item}
                invited
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
  body: {
    marginTop: 14,
  },
  rowsWrap: {
    gap: 10,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  emptyWrap: {
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
});