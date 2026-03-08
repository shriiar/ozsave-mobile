import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export const createToastConfig = (resolvedTheme: "light" | "dark") => {
  const isDark = resolvedTheme === "dark";

  return {
    error: ({ text1, text2 }: any) => {
      const translateY = useRef(new Animated.Value(0)).current;

      const panResponder = useRef(
        PanResponder.create({
          onMoveShouldSetPanResponder: (_, gesture) => {
            return Math.abs(gesture.dy) > 8;
          },
          onPanResponderMove: (_, gesture) => {
            if (gesture.dy < 0) {
              translateY.setValue(gesture.dy);
            }
          },
          onPanResponderRelease: (_, gesture) => {
            if (gesture.dy < -40) {
              Animated.timing(translateY, {
                toValue: -120,
                duration: 180,
                useNativeDriver: true,
              }).start(() => {
                Toast.hide();
                translateY.setValue(0);
              });
            } else {
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }
          },
        })
      ).current;

      return (
        <View style={styles.wrapper} pointerEvents="box-none">
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.shell, { transform: [{ translateY }] }]}
          >
            <BlurView
              intensity={Platform.OS === "ios" ? 25 : 50}
              tint={isDark ? "dark" : "light"}
              style={[
                styles.blurCard,
                {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.16)"
                    : "rgba(0,0,0,0.10)",
                  backgroundColor: isDark
                    ? "rgba(24,24,28,0.36)"
                    : "rgba(255,255,255,0.55)",
                },
              ]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? [
                        "rgba(255,255,255,0.18)",
                        "rgba(255,255,255,0.08)",
                        "rgba(255,255,255,0.03)",
                      ]
                    : [
                        "rgba(255,255,255,0.72)",
                        "rgba(255,255,255,0.38)",
                        "rgba(255,255,255,0.14)",
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.row}>
                <View style={styles.accent} />
                <View style={styles.content}>
                  <View
                    style={[
                      styles.grabber,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.20)"
                          : "rgba(15,23,42,0.16)",
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                    numberOfLines={1}
                  >
                    {text1}
                  </Text>

                  {!!text2 ? (
                    <Text
                      style={[
                        styles.message,
                        {
                          color: isDark
                            ? "rgba(235,235,245,0.78)"
                            : "rgba(15,23,42,0.72)",
                        },
                      ]}
                      numberOfLines={3}
                    >
                      {text2}
                    </Text>
                  ) : null}
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      );
    },
  };
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  shell: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  blurCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  accent: {
    width: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,120,60,0.95)",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  grabber: {
    alignSelf: "center",
    width: 34,
    height: 5,
    borderRadius: 999,
    marginBottom: 10,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  message: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 17,
    fontWeight: "500",
  },
});