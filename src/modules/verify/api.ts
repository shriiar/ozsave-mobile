import { apiRequest } from "@/src/lib/api";

import { VerifyPayload, VerifyResponse, ResendPayload, ResendResponse } from "./types";

export const VerificationApi = {
  verify: (data: VerifyPayload) =>
    apiRequest<VerifyResponse>("PUT", "/verification/verify", data),

  resend: (data: ResendPayload) =>
    apiRequest<ResendResponse>("POST", "/verification/resend", data),
};