import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOKEN_KEY = "ozsave_access_token";

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ---- cooldown (per email) ----
const COOLDOWN_PREFIX = "ozsave_verifyCooldown";

const cooldownKey = (email: string) =>
  `${COOLDOWN_PREFIX}:${email.trim().toLowerCase()}`;

// Save end time (ms since epoch)
export async function setVerifyCooldown(email: string, endTimeMs: number) {
  await AsyncStorage.setItem(cooldownKey(email), String(endTimeMs));
}

export async function getVerifyCooldown(email: string) {
  const raw = await AsyncStorage.getItem(cooldownKey(email));
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export async function clearVerifyCooldown(email: string) {
  await AsyncStorage.removeItem(cooldownKey(email));
}