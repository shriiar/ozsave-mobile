// src/modules/user/api.ts
import { apiRequest } from "../../lib/api";

export const UserApi = {
  acceptInvitation(houseId: string) {
    return apiRequest("PUT", `/user/accept-invitation/${houseId}`);
  },

  declineInvitation(houseId: string) {
    return apiRequest("PUT", `/user/decline-invitation/${houseId}`);
  },

  getInvitations() {
    return apiRequest("GET", "/user/house-invitations");
  },
};