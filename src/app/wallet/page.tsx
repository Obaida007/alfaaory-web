"use client";

import { useState } from "react";
import { DateRangeFilter, type DateRange } from "@/components/filters";
import { AppShell } from "@/components/shell";
import { Breadcrumbs, ButtonLink, Empty, ErrorBox, LoadMore, Spinner, cn } from "@/components/ui";
import { apiError, type WalletTransaction } from "@/lib/api";
import { WalletStats, useWalletSummary } from "@/components/wallet";
import { useRequireAuth } from "@/lib/auth";
import { dateTime, money } from "@/lib/format";
import { usePagedList } from "@/lib/queries";

function reference(tx: WalletTransaction): string {
  if (tx.source_type === "order" && tx.source_id) return `طلب #${tx.source_id}`;
  if (tx.source_type === "recharge_code") return "كود شحن";
  if (tx.source_type === "admin_adjustment") return "تعديل إداري";
  return "وارد";
}

function AmountBadge({ tx }: { tx: WalletTransaction }) {
  const credit = tx.type === "credit";
  return (
    <span className={cn("ltr inline-block rounded-full px-3 py-1 text-xs font-bold", credit ? "bg-success-bg text-mint" : "bg-surface-2 text-ink/90")}>
      {credit ? "+" : "-"} {money(tx.amount)} $
    </span>
  );
}

export default function WalletPage() {
  const allowed = useRequireAuth();
  const [range, setRange] = useState<DateRange>({});
  const summary = useWalletSummary(allowed);
  const list = usePagedList<WalletTransaction>("wallet-transactions", "/wallet/transactions", { ...range }, allowed);
  const rows = list.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <AppShell title="المحفظة" back="/account">
      {!allowed ? (
        <Spinner />
      ) : (
        <>
          <Breadcrumbs items={[{ label: "حسابي", href: "/account" }, { label: "المحفظة" }]} />
          <h1 className="mb-6 hidden text-4xl font-bold md:block">المحفظة</h1>
          <WalletStats summary={summary.data} className="mb-6" />

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <DateRangeFilter value={range} onApply={setRange} />
            <ButtonLink href="/add-balance" variant="mint" className="hidden md:inline-flex">
              إضافة رصيد
            </ButtonLink>
          </div>

          {list.isPending ? (
            <Spinner />
          ) : list.isError ? (
            <ErrorBox message={apiError(list.error).message} onRetry={() => list.refetch()} />
          ) : rows.length === 0 ? (
            <Empty>لا توجد حركات في هذه الفترة.</Empty>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
                <table className="w-full text-sm">
                  <thead className="bg-surface-2/60 text-muted">
                    <tr>
                      {["التاريخ", "البيان", "المرجع", "المبلغ"].map((h) => (
                        <th key={h} className="px-6 py-4 text-right font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-surface">
                    {rows.map((tx) => (
                      <tr key={tx.id}>
                        <td className="ltr px-6 py-4 text-right">{dateTime(tx.created_at)}</td>
                        <td className="px-6 py-4 font-bold">{tx.description}</td>
                        <td className="px-6 py-4">{reference(tx)}</td>
                        <td className="px-6 py-4">
                          <AmountBadge tx={tx} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {rows.map((tx) => (
                  <div key={tx.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">
                        {reference(tx)} · <span className="ltr">{dateTime(tx.created_at)}</span>
                      </span>
                      <AmountBadge tx={tx} />
                    </div>
                    <p className="mt-2 font-bold">{tx.description}</p>
                  </div>
                ))}
              </div>

              <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()} />
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
