import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserApi } from "../api";
import { useScreenActive } from "../../../hooks/useScreenActive"

export type InvitationHouse = {
  _id: string;
  name: string;
};

type UseHouseInvitationsOptions = {
  onAccepted?: () => Promise<void> | void;
};

export function useHouseInvitations(opts: UseHouseInvitationsOptions = {}) {
  const queryClient = useQueryClient();
  const { isActiveScreen } = useScreenActive();

  const {
    data: invitations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<InvitationHouse[]>({
    queryKey: ["houseInvitations"],
    queryFn: async () => {
      const res = await UserApi.getInvitations();
      return (res as any).data ?? (res as InvitationHouse[]);
    },

    // ✅ Only poll when screen is active (focused + foreground)
    refetchInterval: isActiveScreen ? 30_000 : false, // 30s polling
    refetchIntervalInBackground: false,

    // ✅ When screen becomes active again, refresh once immediately
    refetchOnMount: "always",
  });

  const acceptMutation = useMutation({
    mutationFn: (houseId: string) => UserApi.acceptInvitation(houseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["houseInvitations"] });
      if (opts.onAccepted) await opts.onAccepted();
    },
  });

  const declineMutation = useMutation({
    mutationFn: (houseId: string) => UserApi.declineInvitation(houseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["houseInvitations"] });
    },
  });

  return {
    invitations,
    isLoading,
    isError,
    refetch,

    acceptInvitation: (houseId: string) => acceptMutation.mutate(houseId),
    declineInvitation: (houseId: string) => declineMutation.mutate(houseId),

    accepting: acceptMutation.isPending,
    declining: declineMutation.isPending,
  };
}