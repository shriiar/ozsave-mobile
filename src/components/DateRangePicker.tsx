import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

type Props = {
  from: string; // YYYY-MM-DD or ""
  to: string; // YYYY-MM-DD or ""
  onChange: (next: { from: string; to: string }) => void;
  isDark: boolean;
  text: string;
  muted: string;
  tile: string;
  ring: string;
  primary: string;
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function addDaysYmd(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * A single calendar for picking a "from"/"to" range (or just one day) —
 * tap a start day, then an end day, and the days between highlight
 * automatically. Native UIDatePicker only ever selects one day at a time,
 * so this uses react-native-calendars' "period" marking instead.
 */
export function DateRangePicker({ from, to, onChange, isDark, text, muted, tile, ring, primary }: Props) {
  function handleDayPress(day: DateData) {
    const ymd = day.dateString;

    // No range in progress, or a full range already picked — start fresh.
    if (!from || (from && to)) {
      onChange({ from: ymd, to: "" });
      return;
    }

    // A start day is picked, waiting on an end day.
    if (ymd < from) {
      onChange({ from: ymd, to: "" });
    } else {
      onChange({ from, to: ymd });
    }
  }

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (!from) return marks;

    if (!to || to === from) {
      marks[from] = { startingDay: true, endingDay: true, color: primary, textColor: "#fff" };
      return marks;
    }

    const { r, g, b } = hexToRgb(primary);
    const inRangeColor = `rgba(${r},${g},${b},${isDark ? 0.35 : 0.20})`;

    marks[from] = { startingDay: true, color: primary, textColor: "#fff" };

    let cursor = from;
    while (cursor !== to) {
      cursor = addDaysYmd(cursor, 1);
      marks[cursor] =
        cursor === to
          ? { endingDay: true, color: primary, textColor: "#fff" }
          : { color: inRangeColor, textColor: text };
    }

    return marks;
  }, [from, to, primary, isDark, text]);

  return (
    <View style={[styles.wrap, { borderColor: ring, backgroundColor: tile }]}>
      <Calendar
        current={from || undefined}
        markingType="period"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        enableSwipeMonths
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: muted,
          dayTextColor: text,
          todayTextColor: primary,
          monthTextColor: text,
          arrowColor: text,
          textDisabledColor: isDark ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.35)",
        }}
        style={styles.calendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 4,
  },
  calendar: {
    borderRadius: 12,
  },
});
