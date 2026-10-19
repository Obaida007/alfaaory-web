"use client";

import { useState } from "react";
import { DateRangeFilter, type DateRange } from "@/components/filters";
import { AppShell } from "@/components/shell";
import { DepositStatusBadge } from "@/components/status";
import { Breadcrumbs, ButtonLink, Empty, ErrorBox, LoadMore, Spinner } from "@/components/ui";
import { apiError, type Deposit } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { dateTime, money } from "@/lib/format";
import { usePagedList } from "@/lib/queries";

function methodName(d: Deposit) {
  const m = d.payment_method;
  return m ? (m.subtitle ? `${m.name} — ${m.subtitle}` : m.name) : "—";
}

export default function DepositsPage() {
  const allowed = useRequireAuth();
  const [range, setRange] = useState<DateRange>({});
  const list = usePagedList<Deposit>("deposits", "/deposits", { ...range }, allowed);
  const rows = list.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <AppShell title="دفعاتي" back="/account">
      {!allowed ? (
        <Spinner />
      ) : (
        <>
          <Breadcrumbs items={[{ label: "حسابي", href: "/account" }, { label: "دفعاتي" }]} />
          <div className="mb-6 hidden md:block">
            <h1 className="text-4xl font-bold">دفعاتي</h1>
            <p className="mt-2 text-sm text-muted">سجل عمليات إضافة الرصيد وحالتها.</p>
          </div>

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
            <Empty>لا توجد دفعات بعد.</Empty>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
                <table className="w-full text-sm">
                  <thead className="bg-surface-2/60 text-muted">
                    <tr>
                      {["رقم العملية", "طريقة الدفع", "التاريخ", "المبلغ والحالة"].map((h) => (
                        <th key={h} className="px-6 py-4 text-right font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-surface">
                    {rows.map((d) => (
                      <tr key={d.id}>
                        <td className="ltr px-6 py-4 text-right">#P-{d.id}</td>
                        <td className="px-6 py-4 font-bold">{methodName(d)}</td>
                        <td className="ltr px-6 py-4 text-right">{dateTime(d.created_at)}</td>
                        <td className="px-6 py-4">
                          <DepositStatusBadge status={d.status} amount={money(d.amount_usd)} />
                          {d.admin_note && <p className="mt-1 text-xs text-muted">{d.admin_note}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {rows.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="ltr text-xs text-muted">
                        #P-{d.id} · {dateTime(d.created_at)}
                      </span>
                      <DepositStatusBadge status={d.status} amount={money(d.amount_usd)} />
                    </div>
                    <p className="mt-2 font-bold">{methodName(d)}</p>
                    {d.admin_note && <p className="mt-1 text-xs text-muted">{d.admin_note}</p>}
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
