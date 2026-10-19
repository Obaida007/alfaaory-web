import axios, { AxiosError } from "axios";
import type { components } from "@/types/api";

export type Schemas = components["schemas"];
export type User = Schemas["UserResource"];
export type Level = Schemas["LevelResource"];
export type Category = Schemas["CategoryResource"];
export type Product = Schemas["ProductResource"];
export type Order = Schemas["OrderResource"];
/** `account_details` is a JSON object of label → value (e.g. {"رقم المحفظة": "0991…"}). */
export type PaymentMethod = Omit<Schemas["PaymentMethodResource"], "account_details"> & {
  account_details: Record<string, string> | [];
};
export type Deposit = Schemas["DepositResource"];
export type WalletTransaction = Schemas["WalletTransactionResource"];
/** The generated schema can't see inside the notification `data` JSON, so the shape is spelled out here. */
export type AppNotification = Omit<Schemas["NotificationResource"], "subject" | "subject_id" | "status" | "title" | "body"> & {
  subject: "order" | "deposit" | "kyc" | null;
  subject_id: number | null;
  status: string | null;
  title: string | null;
  body: string | null;
};
export type Banner = Schemas["BannerResource"];
export type Agent = Schemas["AgentResource"];
export type KycRequest = Schemas["KycRequestResource"];

/** Every API response is { data, meta, message }. */
export type Envelope<T> = { data: T; meta: Record<string, unknown> | null; message: string | null };

export type PageMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  unread_count?: number;
};

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

const TOKEN_KEY = "alfaore.token";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable: the session just won't persist */
    }
  },
};

export const http = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Called when the API answers 401 so the auth layer can drop the stale token. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.set(null);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<Envelope<T>> {
  const { data } = await http.get<Envelope<T>>(url, { params: clean(params) });
  return data;
}

export async function send<T>(
  method: "post" | "put" | "delete",
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<Envelope<T>> {
  const { data } = await http.request<Envelope<T>>({ method, url, data: body, headers });
  return data;
}

function clean(params?: Record<string, unknown>) {
  if (!params) return undefined;
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

export type ApiError = {
  message: string;
  status?: number;
  code?: string | null;
  errors?: Record<string, string[]>;
};

/** Normalises any thrown value into the API's Arabic error message + field errors. */
export function apiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as Partial<ApiError> | undefined;
    if (body?.message) {
      return { message: body.message, status: error.response?.status, code: body.code, errors: body.errors };
    }
    if (!error.response) return { message: "تعذّر الاتصال بالخادم، تحقّق من اتصالك وحاول مجددًا." };
  }
  return { message: "حدث خطأ غير متوقع، حاول مجددًا." };
}

export function fieldError(error: ApiError | null | undefined, field: string): string | undefined {
  return error?.errors?.[field]?.[0];
}
