"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense, useState } from "react";
import { DateRangeFilter, type DateRange } from "@/components/filters";
import { AppShell } from "@/components/shell";
import { OrderStatusBadge } from "@/components/status";
import { Alert, Empty, ErrorBox, LoadMore, SearchBox, Spinner, Tile, cn } from "@/components/ui";
import { apiError, type Order } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { date, dateTime, money, productLabel, productTileName } from "@/lib/format";
import { usePagedList } from "@/lib/queries";

const FILTERS = [
  { label: "الكل", value: "" },
  { label: "قيد التنفيذ", value: "pending,processing" },
  { label: "مكتمل", value: "completed" },
  { label: "مرفوض", value: "rejected,refunded" },
];

export default function OrdersPage() {
  return (
    <AppShell title="طلباتي" back={false}>
      <Suspense fallback={<Spinner />}>
        <Orders />
      </Suspense>
    </AppShell>
  );
}

function Orders() {
  const allowed = useRequireAuth();
  const params = useSearchParams();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<DateRange>({});
  const list = usePagedList<Order>("orders", "/orders", { status, q: q.trim().length >= 1 ? q.trim() : undefined, ...range }, allowed);
  const orders = list.data?.pages.flatMap((p) => p.data) ?? [];

  if (!allowed) return <Spinner />;

  return (
    <>
      {params.get("placed") && (
        <Alert tone="success" icon={<CheckCircle2 className="size-5 text-mint" />} className="mb-6">
          تم استلام طلبك — يجري تنفيذه الآن وسيظهر تحديث الحالة هنا.
        </Alert>
      )}

      <div className="mb-6 hidden items-center justify-between md:flex">
        <h1 className="text-4xl font-bold">طلباتي</h1>
        <SearchBox value={q} onChange={setQ} placeholder="ابحث برقم الطلب أو اسم المنتج…" className="w-96" />
      </div>

      <div className="mb-4">
        <DateRangeFilter value={range} onApply={setRange} />
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-5 py-2 text-sm",
              status === f.value ? "border-brand bg-brand font-semibold text-white" : "border-line text-ink/85 hover:border-brand/50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.isPending ? (
        <Spinner />
      ) : list.isError ? (
        <ErrorBox message={apiError(list.error).message} onRetry={() => list.refetch()} />
      ) : orders.length === 0 ? (
        <Empty>لا توجد طلبات مطابقة.</Empty>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-2/60 text-muted">
                <tr>
                  {["رقم الطلب", "المنتج", "معرّف اللاعب", "التاريخ", "المبلغ", "الحالة"].map((h) => (
                    <th key={h} className="px-6 py-4 text-right font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="ltr px-6 py-4 text-right">#{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Tile name={productTileName(o.product)} image={o.product?.category?.image_url} className="size-10" textClassName="text-xs" />
                        <div>
                          <p className="ltr text-right font-bold">{productLabel(o.product)}</p>
                          <p className="text-xs text-muted">الكمية: {o.quantity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="ltr px-6 py-4 text-right">{o.player_id ?? "—"}</td>
                    <td className="ltr px-6 py-4 text-right">{dateTime(o.created_at)}</td>
                    <td className="ltr px-6 py-4 text-right font-bold">{money(o.total)} $</td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                      {o.status === "completed" && o.delivered_code && (
                        <p className="ltr mt-1 select-all text-right text-xs text-mint">{o.delivered_code}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="ltr text-xs text-muted">
                    {date(o.created_at)} · #{o.id}
                  </span>
                  <OrderStatusBadge status={o.status} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Tile name={productTileName(o.product)} image={o.product?.category?.image_url} className="size-12 shrink-0" textClassName="text-sm" />
                    <div className="min-w-0">
                      <p className="ltr truncate text-right font-bold">{productLabel(o.product)}</p>
                      <p className="truncate text-xs text-muted">
                        الكمية: {o.quantity} · المعرّف <span className="ltr">{o.player_id ?? "—"}</span>
                      </p>
                    </div>
                  </div>
                  <span className="ltr shrink-0 font-bold">{money(o.total)} $</span>
                </div>
                {o.status === "completed" && o.delivered_code && <p className="ltr mt-3 select-all rounded-lg bg-surface-2 p-2 text-xs text-mint">{o.delivered_code}</p>}
              </div>
            ))}
          </div>

          <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()} />
        </>
      )}
    </>
  );
}
