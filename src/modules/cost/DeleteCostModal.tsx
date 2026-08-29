import { useEffect } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import { useDeleteCost } from "./hooks/useCostApi";

type Props = {
  open: boolean;
  costId: string | null;
  costName: string;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function DeleteCostModal({ open, costId, costName, onClose, onDeleted }: Props) {
  const del = useDeleteCost();

  useEffect(() => {
    if (!open) return;

    function handleDelete() {
      if (!costId) return;
      del.mutate(costId, {
        onSuccess: () => onDeleted?.(),
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "Failed to delete cost";
          Alert.alert("Delete failed", msg);
        },
      });
    }

    const title = "Delete cost";
    const message = `Delete "${costName || "this cost"}"? You can't undo this.`;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          message,
          options: ["Delete", "Cancel"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          onClose();
          if (buttonIndex === 0) handleDelete();
        }
      );
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel", onPress: onClose },
        { text: "Delete", style: "destructive", onPress: () => { onClose(); handleDelete(); } },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return null;
}
