"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthLayout, GoogleButton, useNextPath } from "@/components/auth-layout";
import { Alert, Button, Field, Input } from "@/components/ui";
import { apiError, fieldError, send, type ApiError, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}

function RegisterForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useNextPath();
  const [form, setForm] = useState({ first_name: "", last_name: "", username: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await send<{ token: string; user: User }>("post", "/auth/register", { ...form, phone: form.phone || null, device_name: "web" });
      await login(res.data.token);
      router.replace(next);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">إنشاء حساب جديد</h1>
      <p className="mt-3 text-sm text-muted">انضم إلى متجر الفاعوري واشحن ألعابك واشتراكاتك بسهولة.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="الاسم الأول" error={fieldError(error, "first_name")}>
            <Input value={form.first_name} onChange={set("first_name")} required />
          </Field>
          <Field label="الاسم الأخير" error={fieldError(error, "last_name")}>
            <Input value={form.last_name} onChange={set("last_name")} required />
          </Field>
        </div>
        <Field label="اسم المستخدم" error={fieldError(error, "username")} hint="حروف إنجليزية وأرقام و _ فقط">
          <Input value={form.username} onChange={set("username")} className="ltr text-right" autoComplete="username" required />
        </Field>
        <Field label="البريد الإلكتروني" error={fieldError(error, "email")}>
          <Input type="email" value={form.email} onChange={set("email")} className="ltr text-right" autoComplete="email" required />
        </Field>
        <Field label="الهاتف (اختياري)" error={fieldError(error, "phone")}>
          <Input type="tel" value={form.phone} onChange={set("phone")} className="ltr text-right" autoComplete="tel" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="كلمة السر" error={fieldError(error, "password")}>
            <Input type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required />
          </Field>
          <Field label="تأكيد كلمة السر">
            <Input type="password" value={form.password_confirmation} onChange={set("password_confirmation")} autoComplete="new-password" required />
          </Field>
        </div>

        {error && !error.errors && <Alert tone="danger">{error.message}</Alert>}

        <Button type="submit" loading={busy} className="h-12 w-full">
          إنشاء الحساب
        </Button>
      </form>

      <GoogleButton />

      <p className="mt-8 text-center text-sm text-muted">
        لديك حساب؟{" "}
        <Link href="/login" className="font-bold text-brand-300 hover:text-ink">
          تسجيل الدخول
        </Link>
      </p>
    </>
  );
}
