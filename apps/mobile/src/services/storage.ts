import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ReviewResponse } from '../types/review';

const TOKEN_KEY = 'codereviewpilot.token';
const HISTORY_KEY = 'codereviewpilot.history';

export async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveLocalReview(review: ReviewResponse) {
  const current = await getLocalHistory();
  const next = [review, ...current.filter((item) => item.id !== review.id)].slice(0, 25);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function getLocalHistory(): Promise<ReviewResponse[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? (JSON.parse(raw) as ReviewResponse[]) : [];
}
