import { AppState } from "react-native";
import { focusManager, onlineManager } from "@tanstack/react-query";

/**
 * Makes React Query behave like web:
 * - when app becomes active -> queries can refetch
 * - when app goes background -> stop refetching intervals automatically
 */
export function setupReactQueryAppState() {
  // Focus = app in foreground
  focusManager.setEventListener((handleFocus) => {
    const sub = AppState.addEventListener("change", (state) => {
      handleFocus(state === "active");
    });
    return () => sub.remove();
  });

  // (Optional) You can also wire onlineManager if you want netinfo later.
  // For now we just keep it always online.
  onlineManager.setOnline(true);
}