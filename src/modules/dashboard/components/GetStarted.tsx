// src/modules/dashboard/GetStarted.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import CreateHouseModal from "./CreateHouseModal";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  useHouseInvitations,
  type InvitationHouse,
} from "../../user/hooks/useHouseInvitations";
import { RefreshControl } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

export default function GetStarted() {
  const [showCreate, setShowCreate] = useState(false);
  const { refreshUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const queryClient = useQueryClient();
  
  // from hook:
  const { refetch } = useHouseInvitations({ onAccepted: refreshUser });

  const [refreshing, setRefreshing] = useState(false);

  async function onPullRefresh() {
    setRefreshing(true);
    try {
      await refetch();
      await refreshUser(); // optional if you want user state updated too
    } finally {
      setRefreshing(false);
    }
  }

  const {
    invitations,
    isLoading,
    isError,
    acceptInvitation,
    declineInvitation,
    accepting,
    declining,
  } = useHouseInvitations({
    onAccepted: refreshUser,
  });

  const hasInvites = invitations.length > 0;

  const scrollRef = useRef<ScrollView | null>(null);
  const invitesYRef = useRef(0);

  const T = useMemo(() => {
    const shellBg = isDark ? "#020617" : "#F5F7FB";

    const textPrimary = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const textMuted = isDark ? "rgba(148,163,184,0.95)" : "#475569";

    const panelBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const panelShadow = isDark
      ? {
        shadowColor: "#000",
        shadowOpacity: 0.55,
        shadowRadius: 36,
        shadowOffset: { width: 0, height: 18 },
        elevation: 14,
      }
      : {
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 14 },
        elevation: 10,
      };

    const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
    const cardBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";

    const btnGhostBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const btnGhostText = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";

    const badgeIndigoBg = "rgba(79,70,229,0.10)";
    const badgeIndigoBorder = isDark ? "rgba(129,140,248,0.18)" : "rgba(79,70,229,0.15)";
    const badgeIndigoText = isDark ? "rgba(199,210,254,0.95)" : "#4338CA";

    const badgeSlateBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    const badgeSlateBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    const badgeSlateText = isDark ? "rgba(203,213,225,0.95)" : "#334155";

    // Glass gradients (best-effort RN)
    const panelGrad = isDark
      ? ["rgba(2,6,23,0.35)", "rgba(15,23,42,0.28)", "rgba(2,6,23,0.22)"]
      : ["rgba(255,255,255,0.72)", "rgba(255,255,255,0.58)", "rgba(255,255,255,0.46)"];

    const headerGlowA = isDark
      ? ["rgba(79,70,229,0.24)", "rgba(168,85,247,0.12)", "rgba(0,0,0,0)"]
      : ["rgba(79,70,229,0.25)", "rgba(168,85,247,0.10)", "rgba(0,0,0,0)"];

    const headerGlowB = isDark
      ? ["rgba(16,185,129,0.14)", "rgba(79,70,229,0.12)", "rgba(0,0,0,0)"]
      : ["rgba(16,185,129,0.12)", "rgba(79,70,229,0.10)", "rgba(0,0,0,0)"];

    return {
      isDark,
      shellBg,
      textPrimary,
      textMuted,

      panelBorder,
      panelShadow,
      panelGrad,
      cardBg,
      cardBorder,

      btnGhostBg,
      btnGhostText,

      badgeIndigoBg,
      badgeIndigoBorder,
      badgeIndigoText,

      badgeSlateBg,
      badgeSlateBorder,
      badgeSlateText,

      headerGlowA,
      headerGlowB,
    };
  }, [isDark]);

  const badgeStyle = (tone: "indigo" | "slate") => {
    if (tone === "indigo") {
      return {
        backgroundColor: T.badgeIndigoBg,
        borderColor: T.badgeIndigoBorder,
      };
    }
    return {
      backgroundColor: T.badgeSlateBg,
      borderColor: T.badgeSlateBorder,
    };
  };

  const badgeTextStyle = (tone: "indigo" | "slate") => {
    if (tone === "indigo") return { color: T.badgeIndigoText };
    return { color: T.badgeSlateText };
  };

  const scrollToInvites = () => {
    const y = invitesYRef.current ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };

  const onInvitesLayout = (e: LayoutChangeEvent) => {
    invitesYRef.current = e.nativeEvent.layout.y;
  };

  return (
    <View style={[styles.screen, { backgroundColor: T.shellBg }]}>
      <ScrollView
        ref={(r) => {
          scrollRef.current = r;
        }}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullRefresh}
            tintColor={T.isDark ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.8)"} // iOS spinner color
          />
        }
      >
        <View style={styles.shell}>
          {/* Header */}
          <View style={styles.panelWrap}>
            <BlurView
              intensity={T.isDark ? 22 : 28}
              tint={T.isDark ? "dark" : "light"}
              style={[styles.panel, { borderColor: T.panelBorder }, T.panelShadow]}
            >
              <LinearGradient
                colors={T.panelGrad as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* glows */}
              <LinearGradient
                colors={T.headerGlowA as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.glow, { top: -90, left: -90 }]}
              />
              <LinearGradient
                colors={T.headerGlowB as any}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[styles.glow, { bottom: -90, right: -90 }]}
              />

              <View style={styles.panelInner}>
                <Text style={[styles.h1, { color: T.textPrimary }]}>Welcome to OzSave</Text>
                <Text style={[styles.p, { color: T.textMuted }]}>
                  Create a house or accept an invite to start tracking costs and income together.
                </Text>
              </View>
            </BlurView>
          </View>

          {/* Invitations */}
          <View style={styles.panelWrap} onLayout={onInvitesLayout}>
            <BlurView
              intensity={T.isDark ? 22 : 28}
              tint={T.isDark ? "dark" : "light"}
              style={[styles.panel, { borderColor: T.panelBorder }, T.panelShadow]}
            >
              <LinearGradient
                colors={T.panelGrad as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.panelInner}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.h2, { color: T.textPrimary }]}>Your invitations</Text>
                    <Text style={[styles.p, { color: T.textMuted }]}>
                      Accept to join instantly. Reject removes it.
                    </Text>
                  </View>

                  <View style={[styles.badge, badgeStyle("indigo")]}>
                    <Text style={[styles.badgeText, badgeTextStyle("indigo")]}>
                      {isLoading ? "Loading..." : `${invitations.length} pending`}
                    </Text>
                  </View>
                </View>

                <View style={{ height: 14 }} />

                {isLoading ? (
                  <View style={{ gap: 10 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.card,
                          { backgroundColor: T.cardBg, borderColor: T.cardBorder },
                        ]}
                      >
                        <View style={styles.skeletonRow}>
                          <View style={{ flex: 1, gap: 8 }}>
                            <View
                              style={[
                                styles.skeletonBar,
                                { width: 150, backgroundColor: T.isDark ? "#334155" : "#CBD5E1" },
                              ]}
                            />
                            <View
                              style={[
                                styles.skeletonBar,
                                { width: 220, backgroundColor: T.isDark ? "#1F2937" : "#E2E8F0" },
                              ]}
                            />
                          </View>
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <View
                              style={[
                                styles.skeletonBtn,
                                { backgroundColor: T.isDark ? "#334155" : "#CBD5E1" },
                              ]}
                            />
                            <View
                              style={[
                                styles.skeletonBtn,
                                { backgroundColor: T.isDark ? "#334155" : "#CBD5E1" },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : isError ? (
                  <View style={[styles.card, { backgroundColor: T.cardBg, borderColor: T.cardBorder }]}>
                    <Text style={{ color: T.isDark ? "#FCA5A5" : "#DC2626", fontSize: 13 }}>
                      Failed to load invitations.
                    </Text>
                  </View>
                ) : !hasInvites ? (
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: T.cardBg, borderColor: T.cardBorder },
                      styles.rowBetween,
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={[styles.cardTitle, { color: T.textPrimary }]}>
                        No invitations found
                      </Text>
                      <Text style={[styles.p, { color: T.textMuted }]}>
                        Ask your house admin to invite you.
                      </Text>
                    </View>

                    <Pressable style={[styles.btnGhost, { backgroundColor: T.btnGhostBg }]} disabled>
                      <Text style={[styles.btnGhostText, { color: T.btnGhostText }]}>
                        Nothing to do
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {invitations.map((inv: InvitationHouse) => (
                      <View
                        key={inv._id}
                        style={[
                          styles.card,
                          { backgroundColor: T.cardBg, borderColor: T.cardBorder },
                        ]}
                      >
                        <View style={[styles.rowBetween, { gap: 12 }]}>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                              <View style={styles.houseIcon}>
                                <Text style={styles.houseIconText}>H</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text
                                  numberOfLines={1}
                                  style={[styles.houseName, { color: T.textPrimary }]}
                                >
                                  {inv.name || "Unnamed house"}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <Pressable
                              onPress={() => acceptInvitation(inv._id)}
                              disabled={accepting || declining}
                              style={({ pressed }) => [
                                styles.btnSuccess,
                                pressed && { transform: [{ translateY: 1 }] },
                                (accepting || declining) && { opacity: 0.6 },
                              ]}
                            >
                              <Text style={styles.btnPrimaryText}>
                                {accepting ? "Accepting..." : "Accept"}
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={() => declineInvitation(inv._id)}
                              disabled={declining || accepting}
                              style={({ pressed }) => [
                                styles.btnDanger,
                                pressed && { transform: [{ translateY: 1 }] },
                                (declining || accepting) && { opacity: 0.6 },
                              ]}
                            >
                              <Text style={styles.btnPrimaryText}>
                                {declining ? "Rejecting..." : "Reject"}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </BlurView>
          </View>

          {/* Create + Join */}
          <View style={styles.grid}>
            {/* Create */}
            <View style={styles.panelWrap}>
              <BlurView
                intensity={T.isDark ? 22 : 28}
                tint={T.isDark ? "dark" : "light"}
                style={[styles.panel, { borderColor: T.panelBorder }, T.panelShadow]}
              >
                <LinearGradient
                  colors={T.panelGrad as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.panelInner}>
                  <Text style={[styles.h2, { color: T.textPrimary }]}>Create a house</Text>
                  <Text style={[styles.p, { color: T.textMuted }]}>
                    Set up a new house and become its admin.
                  </Text>

                  <View style={{ height: 14 }} />

                  <View style={styles.rowBetween}>
                    <View style={[styles.badge, badgeStyle("slate")]}>
                      <Text style={[styles.badgeText, badgeTextStyle("slate")]}>Admin access</Text>
                    </View>

                    <Pressable
                      onPress={() => setShowCreate(true)}
                      style={({ pressed }) => [
                        styles.btnPrimary,
                        pressed && { transform: [{ translateY: 1 }] },
                      ]}
                    >
                      <Text style={styles.btnPrimaryText}>Create house</Text>
                    </Pressable>
                  </View>
                </View>
              </BlurView>
            </View>

            {/* Join */}
            <View style={styles.panelWrap}>
              <BlurView
                intensity={T.isDark ? 22 : 28}
                tint={T.isDark ? "dark" : "light"}
                style={[styles.panel, { borderColor: T.panelBorder }, T.panelShadow]}
              >
                <LinearGradient
                  colors={T.panelGrad as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.panelInner}>
                  <Text style={[styles.h2, { color: T.textPrimary }]}>Join a house</Text>

                  {!hasInvites ? (
                    <>
                      <Text style={[styles.p, { color: T.textMuted, marginTop: 4 }]}>
                        Ask a house admin to invite you. You’ll see it appear above.
                      </Text>

                      <View style={{ height: 14 }} />

                      <View style={styles.rowBetween}>
                        <View style={[styles.badge, badgeStyle("slate")]}>
                          <Text style={[styles.badgeText, badgeTextStyle("slate")]}>No invites</Text>
                        </View>

                        <Pressable
                          style={[styles.btnGhost, { backgroundColor: T.btnGhostBg, opacity: 0.6 }]}
                          disabled
                        >
                          <Text style={[styles.btnGhostText, { color: T.btnGhostText }]}>
                            No invitations
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.p, { color: T.textMuted, marginTop: 4 }]}>
                        You have pending invitations above. Accept one to join.
                      </Text>

                      <View style={{ height: 14 }} />

                      <View style={styles.rowBetween}>
                        <View style={[styles.badge, badgeStyle("indigo")]}>
                          <Text style={[styles.badgeText, badgeTextStyle("indigo")]}>
                            Action needed
                          </Text>
                        </View>

                        <Pressable
                          onPress={scrollToInvites}
                          style={({ pressed }) => [
                            styles.btnGhost,
                            { backgroundColor: T.btnGhostBg },
                            pressed && { opacity: 0.9 },
                          ]}
                        >
                          <Text style={[styles.btnGhostText, { color: T.btnGhostText }]}>
                            View invites
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              </BlurView>
            </View>
          </View>

          <View style={{ height: 8 }} />
        </View>
      </ScrollView>

      <CreateHouseModal open={showCreate} onClose={() => setShowCreate(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  page: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
  },

  shell: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    gap: 14,
  },

  panelWrap: {
    borderRadius: 24,
    overflow: "hidden",
  },

  panel: {
    borderRadius: 24,
    // borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },

  panelInner: {
    padding: 18,
  },

  glow: {
    position: "absolute",
    height: 260,
    width: 260,
    borderRadius: 260,
    opacity: 1,
  },

  h1: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  h2: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  p: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    // borderWidth: StyleSheet.hairlineWidth,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  card: {
    borderRadius: 18,
    // borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
  },

  houseIcon: {
    height: 36,
    width: 36,
    borderRadius: 12,
    backgroundColor: "rgba(79,70,229,0.10)",
    // borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(79,70,229,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  houseIconText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4338CA",
  },

  houseName: {
    fontSize: 14,
    fontWeight: "700",
  },

  btnPrimary: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#4F46E5",
  },

  btnSuccess: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#059669",
  },

  btnDanger: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#DC2626",
  },

  btnPrimaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },

  btnGhost: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  btnGhostText: {
    fontSize: 13,
    fontWeight: "800",
  },

  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  skeletonBar: {
    height: 12,
    borderRadius: 8,
  },

  skeletonBtn: {
    height: 36,
    width: 90,
    borderRadius: 14,
  },

  grid: {
    gap: 14,
  },
});