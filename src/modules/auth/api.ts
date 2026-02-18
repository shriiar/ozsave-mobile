import { apiRequest } from "@/src/lib/api";
import type { User } from "./types"; 

type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

export const AuthApi = {
  signup(data: { name: string; email: string; password: string }) {
    return apiRequest<ApiResponse<unknown>>("POST", "/auth/signup", data);
  },

  login(data: { email: string; password: string }) {
    return apiRequest<ApiResponse<{ accessToken: string }>>("POST", "/auth/login", data);
  },

  async me(): Promise<User> {
    const res = await apiRequest<ApiResponse<User>>("GET", "/user/profile");
    return res.data;
  },
};