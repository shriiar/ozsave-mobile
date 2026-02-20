// src/modules/house/api.ts
import { apiRequest } from "../../lib/api" 
import type { House } from "./types";

export const HouseApi = {
  // POST /house/create   body: { name }
  create(name: string) {
    return apiRequest<{ data: House }>("POST", "/house/create", { name });
  },
};