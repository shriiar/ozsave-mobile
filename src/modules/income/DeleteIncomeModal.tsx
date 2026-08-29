import { useEffect } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import { useDeleteIncome } from "./hooks/useIncomeApi";

type Props = {
  open: boolean;
  incomeId: string | null;
  incomeName: string;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function DeleteIncomeModal({
  open,
  incomeId,
  incomeName,
  onClose,
  onDeleted,
}: Props) {
  const del = useDeleteIncome();

  useEffect(() => {
    if (!open) return;

    function handleDelete() {
      if (!incomeId) return;
      del.mutate(incomeId, {
        onSuccess: () => onDeleted?.(),
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "Failed to delete income";
          Alert.alert("Delete failed", msg);
        },
      });
    }

    const title = "Delete income";
    const message = `Delete "${incomeName || "this income"}"? You can't undo this.`;

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
