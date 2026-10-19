"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthLayout, GoogleButton, useNextPath } from "@/components/auth-layout";
import { Alert, Button, Field, Input } from "@/components/ui";
import { apiError, fieldError, send, type ApiError, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type LoginResponse = { token?: string; user?: User; requires_two_factor?: boolean; challenge?: string };

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useNextPath();
  const [form, setForm] = useState({ login: "", password: "" });
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function finish(res: LoginResponse) {
    if (res.requires_two_factor && res.challenge) {
      setChallenge(res.challenge);
      return;
    }
    await login(res.token!);
    router.replace(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = challenge
        ? await send<LoginResponse>("post", "/auth/two-factor", { challenge, code, device_name: "web" })
        : await send<LoginResponse>("post", "/auth/login", { ...form, device_name: "web" });
      await finish(res.data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">تسجيل الدخول</h1>
      <p className="mt-3 text-sm text-muted">
        {challenge ? "أرسلنا رمز تحقق من 6 أرقام إلى بريدك الإلكتروني." : "قم بتسجيل الدخول وتمتّع بتجربة شراء سهلة."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        {challenge ? (
          <Field label="رمز التحقق" error={fieldError(error, "code")}>
            <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoFocus className="ltr text-center tracking-[0.5em]" />
          </Field>
        ) : (
          <>
            <Field label="اسم المستخدم أو البريد الإلكتروني" error={fieldError(error, "login")}>
              <Input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} autoComplete="username" required />
            </Field>
            <Field
              label="كلمة السر"
              error={fieldError(error, "password")}
              aside={
                <Link href="/forgot-password" className="text-xs text-brand-300 hover:text-ink">
                  نسيت كلمة السر؟
                </Link>
              }
            >
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
            </Field>
          </>
        )}

        {error && !error.errors && <Alert tone="danger">{error.message}</Alert>}

        <Button type="submit" loading={busy} className="h-12 w-full">
          {challenge ? "تأكيد" : "تسجيل الدخول"}
        </Button>
      </form>

      {!challenge && <GoogleButton />}

      <p className="mt-8 text-center text-sm text-muted">
        ليس لديك حساب؟{" "}
        <Link href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-brand-300 hover:text-ink">
          إنشاء حساب جديد
        </Link>
      </p>
    </>
  );
}
