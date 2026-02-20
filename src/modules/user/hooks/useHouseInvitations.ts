// src/modules/user/hooks/useHouseInvitations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserApi } from "../api";

export type InvitationHouse = {
  _id: string;
  name: string;
  // extend if backend returns more fields
};

type UseHouseInvitationsOptions = {
  onAccepted?: () => Promise<void> | void;
};

export function useHouseInvitations(opts: UseHouseInvitationsOptions = {}) {
  const queryClient = useQueryClient();

  const {
    data: invitations = [],
    isLoading,
    isError,
  } = useQuery<InvitationHouse[]>({
    queryKey: ["houseInvitations"],
    queryFn: async () => {
      const res: any = await UserApi.getInvitations();
      // supports either { data: [...] } or direct array
      return res?.data ?? res ?? [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (houseId: string) => UserApi.acceptInvitation(houseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["houseInvitations"] });
      await opts.onAccepted?.();
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
    acceptInvitation: (houseId: string) => acceptMutation.mutate(houseId),
    declineInvitation: (houseId: string) => declineMutation.mutate(houseId),
    accepting: acceptMutation.isPending,
    declining: declineMutation.isPending,
  };
}