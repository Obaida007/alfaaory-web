"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Alert, Button, Field, Input } from "@/components/ui";
import { apiError, fieldError, send, type ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await send("post", "/auth/forgot-password", { email });
      setSent(res.message);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold md:text-4xl">استعادة كلمة السر</h1>
      <p className="mt-3 text-sm text-muted">أدخل بريدك الإلكتروني وسنرسل لك رابطًا لتعيين كلمة سر جديدة.</p>
      <form onSubmit={submit} className="mt-6 space-y-5">
        <Field label="البريد الإلكتروني" error={fieldError(error, "email")}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="ltr text-right" required />
        </Field>
        {sent && <Alert tone="success">{sent}</Alert>}
        {error && !error.errors && <Alert tone="danger">{error.message}</Alert>}
        <Button type="submit" loading={busy} className="h-12 w-full">
          إرسال الرابط
        </Button>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link href="/login" className="text-brand-300 hover:text-ink">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  );
}
