"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useState } from "react";
import { DateRangeFilter, type DateRange } from "@/components/filters";
import { AppShell } from "@/components/shell";
import { Badge, Breadcrumbs, Button, Empty, ErrorBox, LoadMore, Spinner } from "@/components/ui";
import { apiError, send, type AppNotification, type PageMeta } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { dateTime } from "@/lib/format";
import { usePagedList } from "@/lib/queries";

const SUBJECT: Record<string, string> = { order: "الطلبات", deposit: "الدفعات", kyc: "الحماية" };

export default function NotificationsPage() {
  const allowed = useRequireAuth();
  const queryClient = useQueryClient();
  const [range, setRange] = useState<DateRange>({});
  const list = usePagedList<AppNotification>("notifications", "/notifications", { ...range }, allowed);
  const rows = list.data?.pages.flatMap((p) => p.data) ?? [];
  const unread = (list.data?.pages[0]?.meta as PageMeta | null)?.unread_count ?? 0;

  const readAll = useMutation({
    mutationFn: () => send("post", "/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <AppShell title="الإشعارات" back="/account">
      {!allowed ? (
        <Spinner />
      ) : (
        <>
          <Breadcrumbs items={[{ label: "حسابي", href: "/account" }, { label: "الإشعارات" }]} />
          <h1 className="mb-6 hidden text-4xl font-bold md:block">الإشعارات</h1>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <DateRangeFilter value={range} onApply={setRange} />
            {unread > 0 && (
              <Button variant="outline" loading={readAll.isPending} onClick={() => readAll.mutate()}>
                تعليم الكل كمقروء ({unread})
              </Button>
            )}
          </div>

          {list.isPending ? (
            <Spinner />
          ) : list.isError ? (
            <ErrorBox message={apiError(list.error).message} onRetry={() => list.refetch()} />
          ) : rows.length === 0 ? (
            <Empty>لا توجد إشعارات.</Empty>
          ) : (
            <div className="max-w-4xl space-y-3">
              {rows.map((n) => (
                <div key={n.id} className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-4 md:p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-300">
                    <Bell className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-relaxed">{n.title}</p>
                    {n.body && <p className="mt-1 text-sm text-ink/80">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted">
                      {SUBJECT[n.subject ?? ""] ?? "عام"} · <span className="ltr">{dateTime(n.created_at)}</span>
                    </p>
                  </div>
                  {n.read_at ? <Badge>مقروء</Badge> : <Badge tone="success">جديد</Badge>}
                </div>
              ))}
              <LoadMore hasMore={!!list.hasNextPage} loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()} />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
