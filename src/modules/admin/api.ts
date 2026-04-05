// src/modules/admin/api.ts
import { apiRequest } from "../../lib/api"

export type AdminSearchUser = {
  _id: string;
  name: string;
  email: string;
  invited: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const AdminApi = {
  async searchUsers(term: string): Promise<AdminSearchUser[]> {
    const res = await apiRequest("GET", `/admin/search?search=${encodeURIComponent(term)}`);
    return (res as ApiResponse<AdminSearchUser[]>).data ?? [];
  },

  async getInvitedUsers(): Promise<AdminSearchUser[]> {
    const res = await apiRequest("GET", "/admin/invited-users");
    return (res as ApiResponse<AdminSearchUser[]>).data ?? [];
  },

  async invite(userId: string): Promise<any> {
    return apiRequest("PUT", `/admin/invitation/${userId}`);
  },

  async removeInvite(userId: string): Promise<any> {
    return apiRequest("PUT", `/admin/remove-invitation/${userId}`);
  },
};