"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, Button, Field, Input } from "@/components/ui";
import { apiError, fieldError, send, type ApiError } from "@/lib/api";

/** Target of the reset email: FRONTEND_URL/reset-password?token=…&email=… */
export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthLayout>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await send("post", "/auth/reset-password", {
        token: params.get("token"),
        email: params.get("email"),
        password,
        password_confirmation: confirmation,
      });
      setDone(res.message);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">تعيين كلمة سر جديدة</h1>
      {done ? (
        <div className="mt-6 space-y-5">
          <Alert tone="success">{done}</Alert>
          <Link href="/login" className="block text-center text-sm text-brand-300">
            تسجيل الدخول
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="كلمة السر الجديدة" error={fieldError(error, "password")}>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          </Field>
          <Field label="تأكيد كلمة السر">
            <Input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required />
          </Field>
          {error && <Alert tone="danger">{fieldError(error, "email") ?? error.message}</Alert>}
          <Button type="submit" loading={busy} className="h-12 w-full">
            حفظ كلمة السر
          </Button>
        </form>
      )}
    </>
  );
}
