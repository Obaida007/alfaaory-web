"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { useState } from "react";
import { DepositDialog } from "@/components/deposit-dialog";
import { AppShell } from "@/components/shell";
import { Alert, Button, ErrorBox, Input, Spinner, cn } from "@/components/ui";
import { apiError, send, type ApiError, type PaymentMethod } from "@/lib/api";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import { usePaymentMethods } from "@/lib/queries";

const COLLAPSED = 8;

export default function AddBalancePage() {
  const allowed = useRequireAuth();
  const { user } = useAuth();
  const methods = usePaymentMethods();
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);

  const verified = user?.kyc_status === "approved";
  const groups = (methods.data ?? []).filter((g) => g.group !== "code");
  const codeMethod = methods.data?.find((g) => g.group === "code")?.methods[0];

  function proceed() {
    if (!selected) return;
    if (selected.requires_kyc && !verified) {
      setBlocked("طريقة الدفع هذه تتطلب توثيق الهوية أولًا.");
      return;
    }
    setBlocked(null);
    setOpen(true);
  }

  if (!allowed) {
    return (
      <AppShell title="إضافة رصيد">
        <Spinner />
      </AppShell>
    );
  }

  return (
    <AppShell title="إضافة رصيد" tabs={false}>
      <div className="mb-6 hidden md:block">
        <h1 className="text-4xl font-bold">إضافة رصيد</h1>
        <p className="mt-2 text-sm text-muted">اختر طريقة الدفع المناسبة لك لشحن حسابك.</p>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_300px] md:gap-8">
        <div className="order-2 space-y-8 md:order-1">
          {!verified && <KycBanner className="hidden md:flex" />}

          {methods.isPending ? (
            <Spinner />
          ) : methods.isError ? (
            <ErrorBox message={apiError(methods.error).message} onRetry={() => methods.refetch()} />
          ) : (
            groups.map((g) => (
              <MethodGroup
                key={g.group}
                label={g.label}
                methods={g.methods}
                collapse={g.group === "agency_salary"}
                selected={selected}
                onSelect={setSelected}
                verified={verified}
              />
            ))
          )}
        </div>

        <aside className="order-1 space-y-4 md:sticky md:top-28 md:order-2">
          <div className="rounded-3xl border border-line bg-surface p-5">
            <p className="text-sm text-muted">رصيدك الحالي</p>
            <p className="ltr mt-2 text-right text-4xl font-bold text-mint">{money(user?.balance)} $</p>
            <div className="mt-5 hidden border-t border-line pt-4 md:block">
              <p className="text-xs text-muted">الطريقة المختارة</p>
              <p className="mt-2 font-bold">{selected ? `${selected.name}${selected.subtitle ? ` — ${selected.subtitle}` : ""}` : "لم تختر بعد"}</p>
              {blocked && <Alert tone="danger" className="mt-3">{blocked}</Alert>}
              <Button className="mt-4 w-full" disabled={!selected} onClick={proceed}>
                متابعة
              </Button>
              <Link href="/deposits" className="mt-3 block text-center text-xs text-brand-300 hover:text-ink">
                دفعاتي السابقة
              </Link>
            </div>
          </div>
          {!verified && <KycBanner className="md:hidden" />}
          <RedeemCode subtitle={codeMethod?.subtitle} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-bg/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="min-w-0">
          <p className="text-xs text-muted">الطريقة المختارة</p>
          <p className="truncate text-sm font-bold">{selected ? `${selected.name}${selected.subtitle ? ` — ${selected.subtitle}` : ""}` : "اختر طريقة دفع"}</p>
          {blocked && <p className="text-xs text-danger">{blocked}</p>}
        </div>
        <Button disabled={!selected} onClick={proceed} className="shrink-0">
          متابعة
        </Button>
      </div>

      {open && selected && <DepositDialog method={selected} onClose={() => setOpen(false)} />}
    </AppShell>
  );
}

function KycBanner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 rounded-2xl bg-warn-bg px-5 py-4", className)}>
      <p className="text-sm text-ink/95">لتستطيع استعمال طرق الدفع يجب تأكيد التحقق من الهوية.</p>
      <Link href="/account#kyc" className="shrink-0 rounded-xl bg-warn px-4 py-2 text-sm font-bold text-[#3a2c12]">
        تحقق الهوية
      </Link>
    </div>
  );
}

function MethodGroup({
  label,
  methods,
  collapse,
  selected,
  onSelect,
  verified,
}: {
  label: string;
  methods: PaymentMethod[];
  /** Only the long agency-salary list starts collapsed. */
  collapse: boolean;
  selected: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
  verified: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded || !collapse ? methods : methods.slice(0, COLLAPSED);

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{label}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {visible.map((m) => {
          const active = selected?.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3 text-right transition",
                active ? "border-brand bg-brand/10 ring-1 ring-brand" : "border-line bg-surface hover:border-brand/50",
              )}
            >
              {m.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image_url} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tile text-sm font-bold text-brand-300">{m.name.charAt(0)}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-snug">{m.name}</span>
                {m.subtitle && <span className="block text-xs text-muted">{m.subtitle}</span>}
              </span>
              {m.requires_kyc && !verified && <Lock className="size-3.5 shrink-0 text-warn" />}
            </button>
          );
        })}
      </div>
      {collapse && methods.length > COLLAPSED && !expanded && (
        <button onClick={() => setExpanded(true)} className="mt-4 text-sm text-brand-300 hover:text-ink">
          عرض كل {label} ({methods.length})
        </button>
      )}
    </section>
  );
}

function RedeemCode({ subtitle }: { subtitle?: string | null }) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const redeem = useMutation({
    mutationFn: () => send("post", "/recharge-codes/redeem", { code }),
    onSuccess: (res) => {
      setResult({ ok: true, message: res.message ?? "تم الشحن" });
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (e) => setResult({ ok: false, message: (apiError(e) as ApiError).message }),
  });

  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <p className="font-bold">لديك كود شحن؟</p>
      <p className="mt-1 text-xs text-muted">كود البطاقة — {subtitle ?? "Credit Card"} متجر الفاعوري</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(null);
          redeem.mutate();
        }}
      >
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="أدخل كود الشحن" className="ltr text-right" required />
        <Button type="submit" variant="mint" loading={redeem.isPending} className="h-12 shrink-0">
          شحن
        </Button>
      </form>
      {result && (
        <Alert tone={result.ok ? "success" : "danger"} className="mt-3">
          {result.message}
        </Alert>
      )}
    </div>
  );
}
