// import type { House } from "@/src/modules/house/types";

export type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  house: any | null;
  role: "user" | "admin";
  houseInvitations: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function userId(u: User) {
  return (u._id || u.id) as string;
}