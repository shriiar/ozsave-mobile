import { useEffect, useRef } from "react";
import { FlatList, ScrollView } from "react-native";
import { registerScrollToTop } from "../lib/scrollToTop";

type Scrollable = FlatList<any> | ScrollView;

export function useScrollToTop<T extends Scrollable = FlatList<any>>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    return registerScrollToTop(() => {
      const el = ref.current as any;
      if (!el) return;
      if (typeof el.scrollToOffset === "function") {
        el.scrollToOffset({ offset: 0, animated: true });
      } else if (typeof el.scrollTo === "function") {
        el.scrollTo({ y: 0, animated: true });
      }
    });
  }, []);

  return ref;
}
