// src/api/client.ts
import axios, { AxiosError } from 'axios';
import { AxiosHeaders } from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Resolve the API base URL.
 * Primary source: app.json -> expo.extra.API_BASE_URL
 * Fallbacks: process.env (if you later add EXPO_PUBLIC_API_BASE_URL) -> localhost
 */
function resolveBaseURL(): string {
  const extra = (Constants?.expoConfig?.extra ?? {}) as Record<string, any>;
  const fromExtra = typeof extra.API_BASE_URL === 'string' ? extra.API_BASE_URL : undefined;
  const fromEnv =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    undefined;

  const url = fromExtra || fromEnv || 'http://localhost:8000';
  return url.replace(/\/+$/, ''); // strip trailing slash
}

export const baseURL = resolveBaseURL();

console.log('[API] baseURL =', baseURL);

export const api = axios.create({
  baseURL,
  timeout: 15000,
  // withCredentials: false, // keep false for typical JWT-in-header auth
});

// ---- Axios interceptors (logging + auth header + basic 401 handling) ----

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');

  // Always work with an AxiosHeaders instance (type-safe)
  const headers = AxiosHeaders.from(config.headers); // <- returns AxiosHeaders

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Default JSON for requests with a body if nothing is set
  if (config.data && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Assign back as AxiosHeaders (valid AxiosRequestHeaders)
  config.headers = headers;

  const fullUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
  console.log('[REQ]', (config.method ?? 'GET').toUpperCase(), fullUrl, config.params ?? {});
  return config;
});


api.interceptors.response.use(
  (res) => {
    console.log('[RES]', res.status, res.config?.url);
    return res;
  },
  async (error: AxiosError<any>) => {
    if (error.response) {
      const { status, config } = error.response;
      console.log('[ERR]', status, config?.url, error.response.data);
      // Basic 401 handling: drop bad token so user is forced to re-login
      if (status === 401) {
        await AsyncStorage.removeItem('token');
      }
    } else {
      console.log('[ERR]', error.message);
    }
    return Promise.reject(error);
  }
);

// --------------------- Auth ---------------------
export async function login(email: string, password: string) {
  const { data } = await api.post('/api/v1/auth/login', { email, password });
  // Accept multiple token shapes
  const token =
    (data && (data.token || data.access_token || data.jwt)) ||
    (typeof data === 'string' ? data : undefined);

  if (!token) {
    // Surface server error message if present
    const serverMsg =
      (data && (data.detail || data.message)) || 'No token in login response';
    throw new Error(String(serverMsg));
  }
  await AsyncStorage.setItem('token', String(token));
  return token as string;
}

export async function register(email: string, password: string) {
  const { data } = await api.post('/api/v1/auth/register', { email, password });
  const token =
    (data && (data.token || data.access_token || data.jwt)) ||
    (typeof data === 'string' ? data : undefined);
  if (token) await AsyncStorage.setItem('token', String(token));
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem('token');
}

// --------------------- Products ---------------------
export async function getRandomProducts(params: {
  count?: number;
  gender?: string;
  category?: string;
}) {
  const { data } = await api.get('/api/v1/products/products/random', {
    params: { count: 20, ...params },
  });
  return data as any[];
}

export async function getProduct(product_id: number) {
  const { data } = await api.get(`/api/v1/products/products/${product_id}`);
  return data;
}

export async function getProducts(params: {
  skip?: number;
  limit?: number;
  gender?: string;
  category?: string;
  color?: string;
}) {
  const { data } = await api.get('/api/v1/products/products/', {
    params,
  });
  return data as any[];
}

// --------------------- Preferences ---------------------
export async function rateProduct(product_id: number, rating: number) {
  const { data } = await api.post('/api/v1/preferences/rate-product', {
    product_id,
    rating,
  });
  return data;
}

export async function rateProductsBulk(
  ratings: { product_id: number; rating: number }[]
) {
  const { data } = await api.post('/api/v1/preferences/rate-products-bulk', {
    ratings,
  });
  return data;
}

// --------------------- Recommendations ---------------------
export async function getRecommendations(params: {
  count?: number;
  gender?: string;
  category?: string;
}) {
  const { data } = await api.get('/api/v1/recommendations/recommendations', {
    params: { count: 20, ...params },
  });
  return data as any[];
}

export async function retrainModel() {
  const { data } = await api.post('/api/v1/recommendations/retrain-model');
  return data;
}

// --------------------- Image URL helper ---------------------
/**
 * Normalizes image URLs returned by the backend.
 * - If absolute & NOT localhost → keep as-is
 * - If absolute & localhost/127.0.0.1 → rewrite host to baseURL's host
 * - If relative → prefix with baseURL
 */
// Replace your existing resolveImageUrl with this:
export function resolveImageUrl(raw?: string): string | undefined {
  if (!raw) return raw;

  // Clean backslashes and spaces
  let url = raw.replace(/\\/g, '/').replace(/\s/g, '%20');

  const base = new URL(baseURL);

  // If it's already absolute, normalize host/protocol if it's localhost-like
  try {
    const u = new URL(url);
    const isLocalhost = ['localhost', '127.0.0.1'].includes(u.hostname);
    if (isLocalhost) {
      u.protocol = base.protocol;
      u.host = base.host; // includes port
      return u.toString();
    }
    return u.toString();
  } catch {
    // Not absolute → make it absolute
    if (url.startsWith('//')) {
      // protocol-relative
      return `${base.protocol}${url}`;
    }
    if (url.startsWith('/')) {
      return `${base.origin}${url}`;
    }
    // plain filename or relative path
    return `${base.origin}/${url}`;
  }
}

