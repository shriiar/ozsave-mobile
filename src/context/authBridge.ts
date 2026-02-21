// src/context/authBridge.ts
type LogoutFn = () => Promise<void> | void;

let logoutFn: LogoutFn | null = null;

export function registerLogout(fn: LogoutFn) {
  logoutFn = fn;
}

export async function triggerLogout() {
  if (!logoutFn) return;
  await logoutFn();
}