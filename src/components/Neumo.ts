// src/components/neumo.ts
import { StyleSheet } from "react-native";

export function makeNeumo(isDark: boolean) {
  const surfaceBg = isDark ? "rgba(2,6,23,0.55)" : "rgba(237,237,237,1)";
  const tileBg = isDark ? "rgba(15,23,42,0.35)" : "rgba(237,237,237,1)";

  const titleColor = isDark ? "rgba(255,255,255,0.92)" : "#0F172A";
  const subColor = isDark ? "rgba(148,163,184,0.95)" : "rgba(64, 69, 75, 0.95)";

  const surfaceShadow = isDark
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.65,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 14 },
        elevation: 14,
      }
    : {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
      };

  const tileShadow = isDark
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.55,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }
    : {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      };

  // NOTE: RN doesn't support "inset" shadows like web.
  // We emulate the vibe with background + elevation + soft shadows.

  return StyleSheet.create({
    surface: {
      borderRadius: 18,
      backgroundColor: surfaceBg,
      ...surfaceShadow,
    },

    tile: {
      borderRadius: 14,
      backgroundColor: tileBg,
      ...tileShadow,
    },

    input: {
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: tileBg,
      color: titleColor,
    },

    btnPrimary: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: isDark ? "rgba(241,245,249,1)" : "rgba(15,23,42,1)",
      alignItems: "center",
      justifyContent: "center",
    },

    btnPrimaryText: {
      fontSize: 13,
      fontWeight: "800",
      color: isDark ? "#0F172A" : "#FFFFFF",
    },

    btnGhost: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },

    btnGhostText: {
      fontSize: 13,
      fontWeight: "800",
      color: titleColor,
    },

    textTitle: { color: titleColor, fontWeight: "800" },
    textSub: { color: subColor, fontWeight: "700" },
  });
}