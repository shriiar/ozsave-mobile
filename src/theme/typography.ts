import { TextStyle } from "react-native";

type TypographyStyle = Pick<TextStyle, "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing">;

/**
 * Apple's Human Interface Guidelines type scale (default/"Large" Dynamic
 * Type size). React Native already renders San Francisco on iOS whenever no
 * `fontFamily` is set, so this intentionally only pins size/weight/line
 * height — never a fontFamily — matching native metrics without hardcoding
 * a typeface.
 *
 * Usage: spread into a style array, e.g. `style={[typography.headline, { color }]}`.
 */
export const typography: Record<string, TypographyStyle> = {
  largeTitle: { fontSize: 34, fontWeight: "700", lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: "700", lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: "600", lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: "600", lineHeight: 22 },
  body: { fontSize: 17, fontWeight: "400", lineHeight: 22 },
  bodyEmphasized: { fontSize: 17, fontWeight: "600", lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: "400", lineHeight: 21 },
  calloutEmphasized: { fontSize: 16, fontWeight: "600", lineHeight: 21 },
  subheadline: { fontSize: 15, fontWeight: "400", lineHeight: 20 },
  subheadlineEmphasized: { fontSize: 15, fontWeight: "600", lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  footnoteEmphasized: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: "400", lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: "400", lineHeight: 13 },
};
