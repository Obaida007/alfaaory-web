"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ItemCard } from "@/components/catalog";
import { AppShell } from "@/components/shell";
import { Empty, ErrorBox, SearchBox, Spinner, Tile } from "@/components/ui";
import { apiError, get, type Category, type Product } from "@/lib/api";
import { money, productLabel } from "@/lib/format";

export default function SearchPage() {
  return (
    <AppShell title="البحث">
      <Suspense fallback={<Spinner />}>
        <Search />
      </Suspense>
    </AppShell>
  );
}

function Search() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim() !== q && input.trim().length >= 2) router.replace(`/search?q=${encodeURIComponent(input.trim())}`);
    }, 400);
    return () => clearTimeout(t);
  }, [input, q, router]);

  const results = useQuery({
    queryKey: ["search", q],
    queryFn: () => get<{ categories: Category[]; products: Product[] }>("/search", { q }).then((r) => r.data),
    enabled: q.length >= 2,
  });

  return (
    <>
      <h1 className="mb-6 hidden text-4xl font-bold md:block">البحث</h1>
      <SearchBox value={input} onChange={setInput} placeholder="ابحث عن لعبة، اشتراك أو بطاقة…" className="mb-8 max-w-2xl" />

      {q.length < 2 ? (
        <Empty>اكتب حرفين على الأقل للبحث.</Empty>
      ) : results.isPending ? (
        <Spinner />
      ) : results.isError ? (
        <ErrorBox message={apiError(results.error).message} onRetry={() => results.refetch()} />
      ) : results.data.categories.length + results.data.products.length === 0 ? (
        <Empty>لا توجد نتائج لـ «{q}».</Empty>
      ) : (
        <div className="space-y-10">
          {results.data.categories.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">الأقسام والألعاب</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
                {results.data.categories.map((c) => (
                  <ItemCard key={c.id} category={c} />
                ))}
              </div>
            </section>
          )}
          {results.data.products.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">الباقات</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {results.data.products.map((p) => (
                  <Link
                    key={p.id}
                    href={p.category ? `/categories/${p.category.slug}?product=${p.id}` : "#"}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 hover:border-brand/50"
                  >
                    <Tile name={p.category?.name ?? p.name} image={p.category?.image_url} className="size-12 shrink-0" textClassName="text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="ltr truncate text-right text-sm font-bold">{productLabel(p)}</p>
                      <p className="ltr truncate text-right text-xs text-muted">{p.category?.name}</p>
                    </div>
                    <span className="ltr font-bold text-brand-300">{money(p.final_price)} $</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
