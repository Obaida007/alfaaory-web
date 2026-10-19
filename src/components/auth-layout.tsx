"use client";

import Link from "next/link";
import { MessageSquare, ShieldCheck, Zap } from "lucide-react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { apiError, send, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Logo } from "./shell";
import { Alert } from "./ui";

const POINTS = [
  { icon: Zap, title: "سرعة التنفيذ", text: "أغلب الطلبات تكتمل خلال دقائق معدودة." },
  { icon: ShieldCheck, title: "أمان مضمون", text: "معاملات آمنة مع حماية بياناتك." },
  { icon: MessageSquare, title: "دعم فني متواصل", text: "فريق دعم جاهز لمساعدتك 24/7." },
];

/** Split auth screen from the design: form on the right, brand panel on the left (desktop only). */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <div className="flex flex-col px-5 py-6 md:px-16 md:py-8">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
        <p className="text-center text-xs text-muted md:text-right">
          ©{new Date().getFullYear()} متجر الفاعوري ·{" "}
          <Link href="/privacy" className="hover:text-ink">
            سياسة الخصوصية
          </Link>
        </p>
      </div>
      <div className="hidden flex-col justify-center border-r border-line bg-surface px-16 md:flex">
        <p className="mb-5 text-sm text-brand-300">الفاعوري — نسهّل عالمك الرقمي</p>
        <h2 className="text-5xl font-bold leading-tight">
          بوابتك الرقمية الموثوقة
          <br />
          للألعاب والاشتراكات
        </h2>
        <div className="mt-8 max-w-lg space-y-4">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl bg-surface-2 px-6 py-4">
              <Icon className="size-5 text-mint" />
              <div>
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Where to go after signing in (?next=…, only same-site paths). */
export function useNextPath(): string {
  const params = useSearchParams();
  const next = params.get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

type GoogleId = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (r: { credential: string }) => void }) => void;
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

/** "المتابعة بحساب Google" — shown only when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set. */
export function GoogleButton() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const next = useNextPath();

  useEffect(() => {
    const google = (window as unknown as { google?: GoogleId }).google;
    if (!clientId || !loaded || !google || !ref.current) return;

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const res = await send<{ token: string; user: User }>("post", "/auth/google", { id_token: credential, device_name: "web" });
          await login(res.data.token);
          router.replace(next);
        } catch (e) {
          setError(apiError(e).message);
        }
      },
    });
    google.accounts.id.renderButton(ref.current, { theme: "filled_black", size: "large", shape: "pill", width: 360, text: "continue_with", locale: "ar" });
  }, [clientId, loaded, login, router, next]);

  if (!clientId) return null;

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setLoaded(true)} onReady={() => setLoaded(true)} />
      <div className="my-6 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        أو
        <span className="h-px flex-1 bg-line" />
      </div>
      <div ref={ref} className="flex justify-center" />
      {error && <Alert tone="danger" className="mt-3">{error}</Alert>}
    </>
  );
}
