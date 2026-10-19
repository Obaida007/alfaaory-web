"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/shell";
import { Breadcrumbs, Empty, ErrorBox, Spinner, Tile } from "@/components/ui";
import { apiError, get, send, type Product } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { money, productLabel } from "@/lib/format";

export default function FavoritesPage() {
  const allowed = useRequireAuth();
  const queryClient = useQueryClient();
  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: () => get<Product[]>("/favorites").then((r) => r.data),
    enabled: allowed,
  });
  const remove = useMutation({
    mutationFn: (id: number) => send("delete", `/favorites/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return (
    <AppShell title="المفضلة" back="/account">
      <Breadcrumbs items={[{ label: "حسابي", href: "/account" }, { label: "المفضلة" }]} />
      <div className="mb-6 hidden md:block">
        <h1 className="text-4xl font-bold">المفضلة</h1>
        <p className="mt-2 text-sm text-muted">المنتجات التي حفظتها للوصول السريع.</p>
      </div>

      {!allowed || favorites.isPending ? (
        <Spinner />
      ) : favorites.isError ? (
        <ErrorBox message={apiError(favorites.error).message} onRetry={() => favorites.refetch()} />
      ) : favorites.data.length === 0 ? (
        <Empty>لم تضف أي منتج إلى المفضلة بعد. اضغط ♡ في صفحة المنتج لحفظه هنا.</Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {favorites.data.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line bg-surface p-3">
              <div className="relative">
                <Tile name={p.category?.name ?? p.name} image={p.category?.image_url} className="aspect-[4/3] w-full" textClassName="text-3xl" />
                <button
                  aria-label="إزالة من المفضلة"
                  onClick={() => remove.mutate(p.id)}
                  className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-xl bg-bg/90"
                >
                  <Heart className="size-4 fill-danger text-danger" />
                </button>
              </div>
              <p className="ltr mt-3 truncate text-right text-sm font-bold">
                {productLabel(p)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="ltr font-bold text-brand-300">{money(p.final_price)} $</span>
                {p.category && (
                  <Link
                    href={`/categories/${p.category.slug}?product=${p.id}`}
                    className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    شراء
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
