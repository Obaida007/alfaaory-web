"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, RefreshCw, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { apiError, send, type ApiError, type Category, type Order, type Product } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { money, uuid } from "@/lib/format";
import { useCategory, useFavoriteIds } from "@/lib/queries";
import { AppShell } from "./shell";
import { Alert, Badge, Breadcrumbs, Button, Empty, Input, Spinner, Tile, cn } from "./ui";

/** Game page: type tabs, package grid and the checkout card. */
export function ProductView({ game }: { game: Category }) {
  const params = useSearchParams();
  const router = useRouter();
  const types = game.children ?? [];
  const typeSlug = params.get("type") ?? types[0]?.slug;
  const selectedType = types.find((t) => t.slug === typeSlug) ?? types[0];

  // Without types the game holds its products directly.
  const typeQuery = useCategory(selectedType?.slug);
  const products = selectedType ? typeQuery.data?.products ?? [] : game.products ?? [];
  const loadingProducts = !!selectedType && typeQuery.isPending;

  const wantedProduct = Number(params.get("product")) || null;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = products.find((p) => p.id === selectedId) ?? products.find((p) => p.id === wantedProduct) ?? null;

  const isAuto = products.some((p) => p.delivery_type === "auto");
  const section = game.parent;
  const packageLabel = selectedType?.name.replace(/\s+(AUTO|MAN|CODES)$/i, "") ?? game.name;

  return (
    <AppShell title={game.name} subtitle={section?.name} back={section ? `/categories/${section.slug}` : "/"} tabs={false}>
      <Breadcrumbs
        items={[
          { label: "الرئيسية", href: "/" },
          ...(section ? [{ label: section.name, href: `/categories/${section.slug}` }] : []),
          { label: game.name, href: selectedType ? `/categories/${game.slug}` : undefined },
          ...(selectedType ? [{ label: selectedType.name }] : []),
        ]}
      />

      <div className="grid items-start gap-6 md:grid-cols-[1fr_340px] md:gap-8">
        <div>
          <div className="mb-6 hidden items-center gap-4 md:flex">
            <Tile name={game.name} image={game.image_url} className="size-24 rounded-2xl" textClassName="text-3xl" />
            <div>
              <h1 className="ltr text-right text-4xl font-bold">{game.name}</h1>
              {isAuto && (
                <Badge tone="success" className="mt-3">
                  تنفيذ تلقائي 24 ساعة
                </Badge>
              )}
            </div>
          </div>

          {types.length > 0 && (
            <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedId(null);
                    router.replace(`/categories/${game.slug}?type=${t.slug}`, { scroll: false });
                  }}
                  className={cn(
                    "ltr shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                    t.id === selectedType?.id ? "border-brand bg-brand text-white" : "border-line text-ink/85 hover:border-brand/60",
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

          <h2 className="mb-4 text-lg font-bold">اختر الباقة</h2>
          {loadingProducts ? (
            <Spinner />
          ) : products.length === 0 ? (
            <Empty>لا توجد باقات متاحة حاليًا في هذا القسم.</Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {products.map((p) => (
                <PackageCard key={p.id} product={p} label={packageLabel} selected={p.id === selected?.id} onSelect={() => setSelectedId(p.id)} />
              ))}
            </div>
          )}
        </div>

        <Checkout product={selected} label={packageLabel} isAuto={isAuto} onCancel={() => setSelectedId(null)} />
      </div>
    </AppShell>
  );
}

function PackageCard({ product, label, selected, onSelect }: { product: Product; label: string; selected: boolean; onSelect: () => void }) {
  const amount = product.name.replace(/\s*UC$/i, "");
  const discounted = product.final_price !== product.price;

  return (
    <button
      onClick={onSelect}
      disabled={!product.in_stock}
      className={cn(
        "relative rounded-2xl border p-4 text-right transition disabled:opacity-40",
        selected ? "border-brand bg-brand/10 ring-1 ring-brand" : "border-line bg-surface hover:border-brand/50",
      )}
    >
      <span className={cn("absolute left-4 top-4 size-5 rounded-full border-2", selected ? "border-brand bg-brand" : "border-faint")} />
      <p className="ltr truncate text-right text-[11px] text-muted">{label}</p>
      <p className="ltr mt-2 truncate text-right text-2xl font-bold md:text-3xl">{amount}</p>
      <p className="ltr mt-2 text-right text-sm font-bold text-brand-300">
        {discounted && <span className="mr-2 text-xs font-normal text-faint line-through">{money(product.price)}</span>}
        {money(product.final_price)} $
      </p>
      {!product.in_stock && <p className="mt-1 text-xs text-danger">نفدت الكمية</p>}
    </button>
  );
}

function Checkout({ product, label, isAuto, onCancel }: { product: Product | null; label: string; isAuto: boolean; onCancel: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoggedIn } = useAuth();
  const favorites = useFavoriteIds(isLoggedIn);

  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [error, setError] = useState<ApiError | null>(null);

  // A fresh key per selected package; retries of the same purchase reuse it (no double charge).
  const [idempotencyKey, setIdempotencyKey] = useState(uuid);
  const [keyFor, setKeyFor] = useState(product?.id);
  if (keyFor !== product?.id) {
    setKeyFor(product?.id);
    setIdempotencyKey(uuid());
    setError(null);
  }

  const extraFields = useMemo(
    () => (product?.extra_fields ?? []) as Array<{ name: string; label: string; required?: boolean }>,
    [product],
  );

  const checkName = useMutation({
    mutationFn: () => send<{ player_name: string }>("post", `/products/${product!.id}/check-name`, { player_id: playerId }),
    onSuccess: (r) => {
      setPlayerName(r.data.player_name);
      setError(null);
    },
    onError: (e) => {
      setPlayerName(null);
      setError(apiError(e));
    },
  });

  const buy = useMutation({
    mutationFn: () =>
      send<Order>(
        "post",
        "/orders",
        { product_id: product!.id, player_id: playerId || null, player_name: playerName, extra: Object.keys(extra).length ? extra : null },
        { "Idempotency-Key": idempotencyKey },
      ),
    onSuccess: async () => {
      setIdempotencyKey(uuid());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["me"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet"] }),
      ]);
      router.push("/orders?placed=1");
    },
    onError: (e) => setError(apiError(e)),
  });

  const toggleFavorite = useMutation({
    mutationFn: (on: boolean) => send(on ? "post" : "delete", `/favorites/${product!.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const isFavorite = !!product && !!favorites.data?.has(product.id);
  const missingExtra = extraFields.some((f) => f.required && !extra[f.name]?.trim());
  const canBuy = !!product && (!product.requires_player_id || playerId.trim() !== "") && !missingExtra;

  function submit() {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setError(null);
    buy.mutate();
  }

  return (
    <>
      <div className="rounded-3xl border border-line bg-surface p-5 md:sticky md:top-28 md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">إتمام الشراء</h2>
          <button
            aria-label="المفضلة"
            disabled={!product || !isLoggedIn || toggleFavorite.isPending}
            onClick={() => toggleFavorite.mutate(!isFavorite)}
            className="flex size-11 items-center justify-center rounded-xl border border-line disabled:opacity-40"
          >
            <Heart className={cn("size-4", isFavorite && "fill-danger text-danger")} />
          </button>
        </div>

        {product ? (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
            <span className="ltr truncate text-sm font-bold">
              {label} {product.name.replace(/\s*UC$/i, "")}
            </span>
            <span className="ltr shrink-0 rounded-full bg-brand px-3 py-1 text-sm font-bold text-white">{money(product.final_price)} $</span>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-dashed border-line px-4 py-4 text-center text-sm text-muted">اختر باقة للمتابعة</div>
        )}

        <div className="space-y-4">
          {(product?.requires_player_id ?? true) && (
            <label className="block space-y-2">
              <span className="text-sm">معرّف المستخدم (ID)</span>
              <Input
                value={playerId}
                onChange={(e) => {
                  setPlayerId(e.target.value.trim());
                  setPlayerName(null);
                }}
                placeholder="يرجى إدخال معرّف الـ ID"
                inputMode="numeric"
                className="ltr text-right"
              />
            </label>
          )}

          {(product?.supports_name_check ?? true) && (
            <div className="space-y-2">
              <span className="text-sm">التحقق من الاسم</span>
              <div className="flex gap-2">
                <div
                  className={cn(
                    "flex min-h-12 flex-1 items-center rounded-xl border border-dashed border-line px-4 text-sm",
                    playerName ? "border-solid border-mint/40 font-semibold text-mint" : "text-faint",
                  )}
                >
                  {playerName ?? "يظهر اسم اللاعب هنا بعد التحقق"}
                </div>
                <button
                  aria-label="تحقق من الاسم"
                  onClick={() => checkName.mutate()}
                  disabled={!product || !playerId || checkName.isPending}
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 disabled:opacity-40"
                >
                  <RefreshCw className={cn("size-4", checkName.isPending && "animate-spin")} />
                </button>
              </div>
            </div>
          )}

          {extraFields.map((f) => (
            <label key={f.name} className="block space-y-2">
              <span className="text-sm">{f.label}</span>
              <Input value={extra[f.name] ?? ""} onChange={(e) => setExtra((x) => ({ ...x, [f.name]: e.target.value }))} />
            </label>
          ))}

          {isLoggedIn && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">رصيدك الحالي</span>
              <span className="ltr font-bold text-mint">{money(user?.balance)} $</span>
            </div>
          )}

          {error && (
            <Alert tone="danger">
              {error.message}
              {error.code === "insufficient_balance" && (
                <Link href="/add-balance" className="mr-2 font-semibold underline">
                  إضافة رصيد
                </Link>
              )}
            </Alert>
          )}

          <div className="hidden gap-3 md:flex">
            <Button className="flex-1" disabled={!canBuy} loading={buy.isPending} onClick={submit}>
              شراء
            </Button>
            <Button variant="danger" onClick={onCancel} disabled={!product}>
              إلغاء
            </Button>
          </div>

          {isAuto && (
            <Alert tone="success" icon={<Zap className="size-4 text-mint" />} className="hidden md:flex">
              هذا المنتج يعمل بشكل تلقائي على مدار 24 ساعة.
            </Alert>
          )}
        </div>
      </div>

      {isAuto && (
        <Alert tone="success" icon={<Zap className="size-4 text-mint" />} className="md:hidden">
          هذا المنتج يعمل بشكل تلقائي على مدار 24 ساعة.
        </Alert>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-line bg-bg/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <Button variant="danger" onClick={onCancel} disabled={!product}>
          إلغاء
        </Button>
        <Button className="flex-1" disabled={!canBuy} loading={buy.isPending} onClick={submit}>
          شراء
        </Button>
      </div>
    </>
  );
}
