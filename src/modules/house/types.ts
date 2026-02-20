// src/modules/house/types.ts
export type House = {
    _id: string;
    name: string;
    admin: string;        // user id
    members: string[];    // array of user ids
    createdAt: string;
    updatedAt: string;
  };