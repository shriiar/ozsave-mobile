export type VerifyPayload = {
    email: string;
    code: string;
  };
  
  export type VerifyResponse = {
    message: string;
    // common shapes:
    accessToken?: string;         // sometimes top-level
    data?: { accessToken?: string }; // often nested
  };
  
  export type ResendPayload = {
    email: string;
  };
  
  export type ResendResponse = {
    message: string;
  };