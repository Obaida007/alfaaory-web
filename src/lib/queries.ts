"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  get,
  type Agent,
  type Banner,
  type Category,
  type Level,
  type PageMeta,
  type PaymentMethod,
  type Product,
} from "./api";

export type HomeData = {
  hero_banners: Banner[];
  popup_banners: Banner[];
  sections: Category[];
  top_products: Product[];
};

export type PaymentGroup = { group: string; label: string; methods: PaymentMethod[] };

export type PublicSettings = Partial<
  Record<
    | "site_name"
    | "admin_whatsapp"
    | "admin_email"
    | "whatsapp_group_url"
    | "whatsapp_channel_url"
    | "facebook_url"
    | "instagram_url"
    | "telegram_url"
    | "tiktok_url"
    | "youtube_url",
    string | null
  >
>;

const LONG = 5 * 60_000;

export const useHome = () =>
  useQuery({ queryKey: ["home"], queryFn: () => get<HomeData>("/home").then((r) => r.data), staleTime: LONG });

export const useCategoryTree = () =>
  useQuery({ queryKey: ["categories"], queryFn: () => get<Category[]>("/categories").then((r) => r.data), staleTime: LONG });

export const useCategory = (slug: string | undefined) =>
  useQuery({
    queryKey: ["category", slug],
    queryFn: () => get<Category>(`/categories/${slug}`).then((r) => r.data),
    enabled: !!slug,
    staleTime: 60_000,
  });

export const usePaymentMethods = () =>
  useQuery({ queryKey: ["payment-methods"], queryFn: () => get<PaymentGroup[]>("/payment-methods").then((r) => r.data), staleTime: LONG });

export const useAgents = () =>
  useQuery({ queryKey: ["agents"], queryFn: () => get<Agent[]>("/agents").then((r) => r.data), staleTime: LONG });

export const useLevels = () =>
  useQuery({ queryKey: ["levels"], queryFn: () => get<Level[]>("/levels").then((r) => r.data), staleTime: LONG });

export const useSettings = () =>
  useQuery({ queryKey: ["settings"], queryFn: () => get<PublicSettings>("/settings/public").then((r) => r.data), staleTime: LONG });

export const usePage = (page: "about" | "privacy") =>
  useQuery({
    queryKey: ["page", page],
    queryFn: () => get<{ page: string; content: string }>(`/pages/${page}`).then((r) => r.data),
    staleTime: LONG,
  });

export const useFavoriteIds = (enabled: boolean) =>
  useQuery({
    queryKey: ["favorites"],
    queryFn: () => get<Product[]>("/favorites", { per_page: 100 }).then((r) => r.data),
    enabled,
    select: (products) => new Set(products.map((p) => p.id)),
  });

/** Paginated list ("load more") for the account history pages. */
export function usePagedList<T>(key: string, url: string, params: Record<string, unknown>, enabled = true) {
  return useInfiniteQuery({
    queryKey: [key, params],
    queryFn: ({ pageParam }) => get<T[]>(url, { ...params, page: pageParam, per_page: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const meta = last.meta as PageMeta | null;
      return meta && meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
    },
    enabled,
  });
}
