import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import DashboardShell from "../../src/modules/shell/DashboardShell";

import type { BillingRow } from "../../src/modules/billing/api";
import { useInfiniteBillings } from "../../src/modules/billing/hooks/useBillingApi";

import AddBillingModal from "@/src/modules/billing/AddBillingModal";
// import EditBillingModal from "@/src/modules/billing/EditBillingModal";
// import DeleteBillingModal from "@/src/modules/billing/DeleteBillingModal";

function money(n: number) {
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function capitalize(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function BillingCard({
  item,
  isDark,
  onPress,
  onDelete,
  onSwipeStart,
  onSwipeOpen,
  onSwipeClose,
}: {
  item: BillingRow;
  isDark: boolean;
  onPress: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onSwipeStart: (id: string) => void;
  onSwipeOpen: (id: string, closeFn: () => void) => void;
  onSwipeClose: (id: string) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const closeSelf = () => swipeRef.current?.close();

  const T = useMemo(() => {
    const cardGrad = isDark
      ? ["rgba(15,23,42,0.55)", "rgba(2,6,23,0.35)"]
      : ["rgba(255,255,255,0.72)", "rgba(255,255,255,0.48)"];

    const ring = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const text = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
    const muted = isDark ? "rgba(148,163,184,0.95)" : "rgba(42,45,49,0.95)";
    const chipBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(24,24,24,0.04)";

    return { cardGrad, ring, text, muted, chipBg };
  }, [isDark]);

  function renderRightActions(
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) {
    const opacity = progress.interpolate({
      inputRange: [0, 0.25, 1],
      outputRange: [0, 0.65, 1],
      extrapolate: "clamp",
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
      extrapolate: "clamp",
    });

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActionsWrap}>
        <Animated.View
          style={[styles.deleteAction, { opacity, transform: [{ translateX }, { scale }] }]}
        >
          <Pressable
            onPress={() => {
              swipeRef.current?.close();
              onDelete(item._id, item.name);
            }}
            style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.86 : 1 }]}
            hitSlop={10}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={28}
      overshootRight={false}
      friction={1.8}
      activeOffsetX={[-12, 12]}
      failOffsetY={[-10, 10]}
      dragOffsetFromRightEdge={24}
      onSwipeableOpenStartDrag={() => onSwipeStart(item._id)}
      onSwipeableOpen={() => onSwipeOpen(item._id, closeSelf)}
      onSwipeableClose={() => onSwipeClose(item._id)}
    >
      <Pressable
        onPress={() => {
          swipeRef.current?.close();
          onPress(item._id);
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      >
        <View style={styles.cardWrap}>
          <BlurView
            intensity={isDark ? 18 : 26}
            tint={isDark ? "dark" : "light"}
            style={[styles.card, { borderColor: T.ring }]}
          >
            <LinearGradient
              colors={T.cardGrad as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View
              pointerEvents="none"
              style={[
                styles.rightBubble,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                },
              ]}
            />

            <View style={styles.row}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                    borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
                  },
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={18}
                  color={isDark ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.85)"}
                />
              </View>

              <View style={styles.mid}>
                <Text style={[styles.TextHero, { color: T.text }]} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={[styles.subText, { color: T.muted }]} numberOfLines={1}>
                  Next run: {formatDate(item.nextRunAt)}
                </Text>

                <View style={styles.miniStatsRow}>
                  <View style={[styles.miniPill, { backgroundColor: T.chipBg }]}>
                    <Text style={[styles.miniPillText, { color: T.muted }]} numberOfLines={1}>
                      {capitalize(item.frequency)}
                    </Text>
                  </View>

                  <View style={[styles.miniPill, { backgroundColor: T.chipBg }]}>
                    <Text style={[styles.miniPillText, { color: T.muted }]} numberOfLines={1}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.rightBadge,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)" },
                ]}
              >
                <Text style={[styles.badgeTop, { color: T.text }]}>Amount</Text>
                <Text style={[styles.badgeBottom, { color: T.muted }]}>{money(item.amount)}</Text>
              </View>
            </View>
          </BlurView>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function BillingScreen() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { refreshing, refreshUser } = useAuth();

  const insets = useSafeAreaInsets();
  const TOPBAR_H = 52;
  const bottomSpace = TOPBAR_H + insets.bottom + 16;

  const spinner = isDark ? "rgba(255,255,255,0.92)" : "rgba(15,23,42,0.85)";
  const androidBg = isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.95)";

  const [limit] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [editingBillingId, setEditingBillingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  const swipeRefs = useRef<Record<string, () => void>>({});
  const openSwipe = useRef<{ id: string; close: () => void } | null>(null);

  function closeOpenSwipe() {
    openSwipe.current?.close?.();
    openSwipe.current = null;
  }

  function closeAllSwipes() {
    Object.values(swipeRefs.current).forEach((close) => close());
    swipeRefs.current = {};
  }

  function onSwipeStart(nextId: string) {
    if (openSwipe.current && openSwipe.current.id !== nextId) closeOpenSwipe();
  }

  function onSwipeOpen(id: string, closeFn: () => void) {
    Object.entries(swipeRefs.current).forEach(([key, close]) => {
      if (key !== id) close();
    });

    swipeRefs.current[id] = closeFn;
    openSwipe.current = { id, close: closeFn };
  }

  function onSwipeClose(id: string) {
    delete swipeRefs.current[id];
    if (openSwipe.current?.id === id) openSwipe.current = null;
  }

  function openEdit(id: string) {
    closeOpenSwipe();
    setEditingBillingId(id);
  }

  function closeEdit() {
    setEditingBillingId(null);
  }

  function openDelete(id: string, name: string) {
    closeOpenSwipe();
    setDeleting({ id, name });
  }

  function closeDelete() {
    setDeleting(null);
  }

  const q = useInfiniteBillings({
    limit,
  } as any);

  const rows: BillingRow[] = useMemo(() => {
    const pages = q.data?.pages ?? [];
    const all = pages.flatMap((p: any) => p.data ?? []);

    const map = new Map<string, BillingRow>();
    for (const r of all) map.set(String(r._id), r);
    return Array.from(map.values());
  }, [q.data]);

  const isInitialLoading = q.isLoading && rows.length === 0;

  async function onRefresh() {
    await refreshUser();
    await q.refetch();
  }

  function onEndReached() {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }

  function ListFooter() {
    if (!q.hasNextPage) return <View style={{ height: 10 }} />;

    if (q.isFetchingNextPage) {
      return (
        <View style={{ paddingTop: 12, paddingBottom: bottomSpace }}>
          <ActivityIndicator color={spinner} />
        </View>
      );
    }

    return <View style={{ height: 12 }} />;
  }

  return (
    <DashboardShell>
      <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
        <View style={[styles.headerRow, { marginBottom: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.h1, { color: isDark ? "rgba(255,255,255,0.92)" : "#0F172A" }]}>
              Billing
            </Text>
            <Text style={[styles.h2, { color: isDark ? "rgba(148,163,184,0.95)" : "#64748B" }]}>
              Track recurring subscriptions for this house.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.92 : 1 }]}
            onPress={() => setAddOpen(true)}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {isInitialLoading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={{ marginTop: 10, opacity: 0.7 }}>Loading billings...</Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={rows}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottomSpace, flexGrow: 1 }}
            alwaysBounceVertical
            bounces
            onScrollBeginDrag={closeAllSwipes}
            onMomentumScrollBegin={closeAllSwipes}
            renderItem={({ item }) => (
              <BillingCard
                item={item}
                isDark={isDark}
                onPress={openEdit}
                onDelete={openDelete}
                onSwipeStart={onSwipeStart}
                onSwipeOpen={onSwipeOpen}
                onSwipeClose={onSwipeClose}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || q.isRefetching}
                onRefresh={onRefresh}
                tintColor={spinner}
                colors={[spinner]}
                progressBackgroundColor={androidBg}
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.6}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={{ opacity: 0.7 }}>No billings yet. Tap Add.</Text>
              </View>
            }
            ListFooterComponent={<ListFooter />}
          />
        )}

        <AddBillingModal open={addOpen} onClose={() => setAddOpen(false)} />

        {/* <EditBillingModal
          open={!!editingBillingId}
          billingId={editingBillingId}
          onClose={closeEdit}
        />

        <DeleteBillingModal
          open={!!deleting}
          billingId={deleting?.id ?? null}
          billingName={deleting?.name ?? ""}
          onClose={closeDelete}
          onDeleted={() => {
            q.refetch();
          }}
        /> */}
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 14 },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 10,
  },

  h1: { fontSize: 18, fontWeight: "700" },
  h2: { marginTop: 2, fontSize: 13, lineHeight: 18 },

  addBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { paddingVertical: 28, alignItems: "center" },

  cardWrap: { marginBottom: 12, borderRadius: 18 },

  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    position: "relative",
  },

  swipeActionsWrap: {
    width: 86,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
  },

  deleteBtn: {
    height: 56,
    width: 56,
    borderRadius: 18,
    backgroundColor: "rgba(239,68,68,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    height: 44,
    width: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },

  mid: {
    flex: 1,
    minWidth: 0,
  },

  TextHero: {
    fontSize: 16,
    fontWeight: "700",
  },

  subText: {
    marginTop: 3,
    fontSize: 12.5,
    fontWeight: "700",
  },

  miniStatsRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  miniPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  miniPillText: {
    fontSize: 12,
    fontWeight: "800",
  },

  rightBadge: {
    width: 92,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  badgeTop: {
    fontSize: 11,
    fontWeight: "900",
    opacity: 0.9,
  },

  badgeBottom: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
  },

  rightBubble: {
    position: "absolute",
    right: -24,
    top: -18,
    width: 170,
    height: 170,
    borderRadius: 999,
    transform: [{ rotate: "18deg" }],
  },
});