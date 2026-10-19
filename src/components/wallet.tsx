"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { money, moneyShort } from "@/lib/format";
import { cn } from "./ui";

export type WalletSummary = {
  balance: string;
  total_purchases: string;
  total_received: string;
  pending_deposits: string;
  debit_balance: string;
};

export function useWalletSummary(enabled: boolean) {
  return useQuery({ queryKey: ["wallet"], queryFn: () => get<WalletSummary>("/wallet").then((r) => r.data), enabled });
}

export function WalletStats({ summary, className }: { summary?: WalletSummary; className?: string }) {
  const stats = [
    { label: "رصيدك الحالي", value: summary?.balance, accent: true },
    { label: "إجمالي المشتريات", value: summary?.total_purchases },
    { label: "الوارد", value: summary?.total_received },
    { label: "رصيد مدين", value: summary?.debit_balance },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4", className)}>
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-line bg-surface p-4 md:p-6">
          <p className="text-sm text-muted">{s.label}</p>
          <p className={cn("ltr mt-2 text-right text-2xl font-bold md:text-3xl", s.accent && "text-mint")}>
            {s.value === undefined ? "…" : s.accent ? money(s.value) : moneyShort(s.value)} $
          </p>
        </div>
      ))}
    </div>
  );
}

