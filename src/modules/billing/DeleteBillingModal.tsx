import { useEffect } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import { useDeleteBilling } from "./hooks/useBillingApi";

type Props = {
  open: boolean;
  billingId: string | null;
  billingName: string;
  onClose: () => void;
  onDeleted?: () => void;
};

export default function DeleteBillingModal({
  open,
  billingId,
  billingName,
  onClose,
  onDeleted,
}: Props) {
  const del = useDeleteBilling();

  useEffect(() => {
    if (!open) return;

    function handleDelete() {
      if (!billingId) return;
      del.mutate(billingId, {
        onSuccess: () => onDeleted?.(),
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "Failed to delete billing";
          Alert.alert("Delete failed", msg);
        },
      });
    }

    const title = "Delete billing";
    const message = `Delete "${billingName || "this billing"}"? Existing costs already created will stay, but future recurring costs will stop. You can't undo this.`;

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
