"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiError, fieldError, send, type ApiError, type Deposit, type PaymentMethod } from "@/lib/api";
import { money } from "@/lib/format";
import { Alert, Button, Field, Input } from "./ui";

/** Second step of "إضافة رصيد": transfer details + amount + receipt upload. */
export function DepositDialog({ method, onClose }: { method: PaymentMethod; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [sender, setSender] = useState("");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [done, setDone] = useState<Deposit | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = useMutation({
    mutationFn: () => {
      const body = new FormData();
      body.append("payment_method_id", String(method.id));
      body.append("amount", amount);
      if (sender) body.append("sender_name", sender);
      if (reference) body.append("transaction_ref", reference);
      if (receipt) body.append("receipt_image", receipt);
      return send<Deposit>("post", "/deposits", body);
    },
    onSuccess: (res) => {
      setDone(res.data);
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (e) => setError(apiError(e)),
  });

  const details = Object.entries(method.account_details ?? {});
  const rate = Number(method.exchange_rate) || 1;
  const fee = Number(method.fee_percent) || 0;
  const estimate = amount ? (Number(amount) / rate) * (1 - fee / 100) : 0;
  const isUsd = method.currency === "USD";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 md:max-w-lg md:rounded-3xl md:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted">إضافة رصيد عبر</p>
            <h2 className="mt-1 text-xl font-bold">
              {method.name}
              {method.subtitle && <span className="text-base font-normal text-muted"> — {method.subtitle}</span>}
            </h2>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="flex size-10 items-center justify-center rounded-xl border border-line">
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <div className="space-y-5">
            <Alert tone="success" icon={<Check className="size-5 text-mint" />}>
              تم إرسال طلب الإيداع #P-{done.id} بقيمة <span className="ltr">{money(done.amount_usd)} $</span> وسيتم مراجعته قريبًا.
            </Alert>
            <div className="flex gap-3">
              <Link href="/deposits" className="flex h-11 flex-1 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white">
                دفعاتي
              </Link>
              <Button variant="outline" onClick={onClose}>
                إغلاق
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              submit.mutate();
            }}
          >
            {method.instructions && <p className="rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed text-ink/90">{method.instructions}</p>}

            {details.length > 0 && (
              <div className="space-y-2">
                {details.map(([key, value]) => (
                  <CopyRow key={key} label={key} value={String(value)} />
                ))}
              </div>
            )}

            <Field
              label={`المبلغ المرسل (${method.currency})`}
              error={fieldError(error, "amount")}
              hint={
                <>
                  الحد الأدنى {money(method.min_amount)}
                  {method.max_amount ? ` — الحد الأقصى ${money(method.max_amount)}` : ""} {method.currency}
                  {fee > 0 && ` · عمولة ${fee}%`}
                </>
              }
            >
              <Input type="number" inputMode="decimal" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="ltr text-right" required />
            </Field>
            {amount && !isUsd && (
              <p className="text-sm text-muted">
                سيُضاف تقريبًا: <span className="ltr font-bold text-mint">{estimate.toFixed(2)} $</span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="اسم المرسل" error={fieldError(error, "sender_name")}>
                <Input value={sender} onChange={(e) => setSender(e.target.value)} />
              </Field>
              <Field label="رقم العملية" error={fieldError(error, "transaction_ref")}>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} className="ltr text-right" />
              </Field>
            </div>

            <Field label="صورة الإيصال" error={fieldError(error, "receipt_image")}>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                className="block w-full rounded-xl border border-dashed border-line bg-surface-2/60 p-3 text-sm text-muted file:ml-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:text-white"
              />
            </Field>

            {error && !error.errors && <Alert tone="danger">{error.message}</Alert>}

            <Button type="submit" loading={submit.isPending} className="h-12 w-full">
              إرسال طلب الإيداع
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="ltr mt-0.5 truncate text-right text-sm font-bold">{value}</p>
      </div>
      <button
        type="button"
        aria-label="نسخ"
        onClick={async () => {
          await navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2"
      >
        {copied ? <Check className="size-4 text-mint" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
