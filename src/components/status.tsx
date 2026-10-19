import { Badge } from "./ui";

const ORDER: Record<string, { label: string; tone: "warn" | "success" | "danger" | "muted" }> = {
  pending: { label: "قيد التنفيذ", tone: "warn" },
  processing: { label: "قيد التنفيذ", tone: "warn" },
  completed: { label: "مكتمل", tone: "success" },
  rejected: { label: "مرفوض", tone: "danger" },
  refunded: { label: "مرفوض — أُعيد المبلغ", tone: "danger" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER[status] ?? { label: status, tone: "muted" as const };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const DEPOSIT: Record<string, { label: string; tone: "warn" | "success" | "danger" }> = {
  pending: { label: "قيد المراجعة", tone: "warn" },
  approved: { label: "مقبولة", tone: "success" },
  rejected: { label: "مرفوضة", tone: "danger" },
};

export function DepositStatusBadge({ status, amount }: { status: string; amount: string }) {
  const s = DEPOSIT[status] ?? { label: status, tone: "warn" as const };
  return (
    <Badge tone={s.tone}>
      {s.label} · <span className="ltr">{amount} $</span>
    </Badge>
  );
}
