import { useIsFocused } from "@react-navigation/native";
import { AppState, AppStateStatus } from "react-native";
import { useEffect, useState } from "react";

export function useScreenActive() {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", setAppState);
    return () => sub.remove();
  }, []);

  const isForeground = appState === "active";
  const isActiveScreen = isFocused && isForeground;

  return { isFocused, isForeground, isActiveScreen };
}