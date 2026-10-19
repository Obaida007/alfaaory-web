"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { AppShell } from "@/components/shell";
import { Alert, Badge, Button, Card, Field, Input, Spinner, cn } from "@/components/ui";
import { WalletStats, useWalletSummary } from "@/components/wallet";
import { apiError, fieldError, get, send, type ApiError, type KycRequest, type User } from "@/lib/api";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { moneyShort, whatsappUrl } from "@/lib/format";
import { useAgents, useLevels } from "@/lib/queries";

const MENU: Array<{ label: string; href: string }> = [
  { label: "الملف الشخصي", href: "#profile" },
  { label: "المستوى", href: "#level" },
  { label: "محفظتي", href: "/wallet" },
  { label: "إضافة رصيد", href: "/add-balance" },
  { label: "دفعاتي", href: "/deposits" },
  { label: "طلباتي", href: "/orders" },
  { label: "المفضلة", href: "/favorites" },
  { label: "الإشعارات", href: "/notifications" },
  { label: "الحماية", href: "#security" },
  { label: "تحقق الهوية", href: "#kyc" },
  { label: "حساب تلغرام", href: "#telegram" },
  { label: "وكلاؤنا", href: "#agents" },
];

export default function AccountPage() {
  const allowed = useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();
  const wallet = useWalletSummary(allowed);

  async function signOut() {
    await logout();
    router.replace("/");
  }

  if (!allowed || !user) {
    return (
      <AppShell title="حسابي" back={false}>
        <Spinner />
      </AppShell>
    );
  }

  return (
    <AppShell title="حسابي" back={false}>
      <div className="mb-4 flex items-center justify-between md:hidden">
        <span />
        <button onClick={signOut} className="text-sm text-danger">
          تسجيل الخروج
        </button>
      </div>
      <h1 className="mb-6 hidden text-4xl font-bold md:block">حسابي</h1>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:hidden">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className="shrink-0 rounded-full border border-line px-4 py-2 text-sm text-ink/85">
            {m.label}
          </Link>
        ))}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          <ProfileCard user={user} />
          <WalletStats summary={wallet.data} />
          <LevelCard user={user} />
          <SecurityCard user={user} />
          <KycCard user={user} />
          <TelegramCard linked={user.telegram_linked} />
          <AgentsCard />
        </div>

        <aside className="sticky top-28 hidden rounded-2xl border border-line bg-surface p-3 md:block">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="block rounded-xl px-4 py-2.5 text-sm text-ink/85 hover:bg-surface-2">
              {m.label}
            </Link>
          ))}
          <div className="my-2 h-px bg-line" />
          <button onClick={signOut} className="block w-full rounded-xl px-4 py-2.5 text-right text-sm text-danger hover:bg-danger-bg/50">
            تسجيل الخروج
          </button>
        </aside>
      </div>
    </AppShell>
  );
}

function Section({ id, title, children, className }: { id: string; title?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("scroll-mt-28 p-5 md:p-6", className)}>
      <section id={id}>
        {title && <h2 className="mb-4 text-lg font-bold">{title}</h2>}
        {children}
      </section>
    </Card>
  );
}

function useSaveMe() {
  const queryClient = useQueryClient();
  return (data: User) => queryClient.setQueryData(["me"], data);
}

function ProfileCard({ user }: { user: User }) {
  const saveMe = useSaveMe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name ?? "",
    email: user.email,
    username: user.username,
    phone: user.phone ?? "",
  });
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: () => send<User>("put", "/me/profile", { ...form, phone: form.phone || null }),
    onSuccess: (r) => {
      saveMe(r.data);
      setSaved(r.message);
      setError(null);
    },
    onError: (e) => {
      setError(apiError(e));
      setSaved(null);
    },
  });

  const avatar = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("avatar", file);
      return send<User>("post", "/me/avatar", body);
    },
    onSuccess: (r) => saveMe(r.data),
    onError: (e) => setError(apiError(e)),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Section id="profile">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="size-14 rounded-full object-cover" />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full bg-tile text-xl font-bold text-brand-300">ف</span>
          )}
          <div>
            <p className="text-lg font-bold">
              {user.full_name} <span className="ltr text-xs font-normal text-muted">#{user.id}</span>
            </p>
            {user.level && (
              <Badge tone="warn" className="mt-1">
                المستوى {user.level.name}
              </Badge>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) avatar.mutate(file);
            e.target.value = "";
          }}
        />
        <Button variant="outline" className="h-10" loading={avatar.isPending} onClick={() => fileRef.current?.click()}>
          تغيير الصورة
        </Button>
      </div>

      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate();
        }}
      >
        <Field label="الاسم الأول" error={fieldError(error, "first_name")}>
          <Input value={form.first_name} onChange={set("first_name")} required />
        </Field>
        <Field label="الاسم الأخير" error={fieldError(error, "last_name")}>
          <Input value={form.last_name} onChange={set("last_name")} />
        </Field>
        <Field label="البريد الإلكتروني" error={fieldError(error, "email")}>
          <Input type="email" value={form.email} onChange={set("email")} className="ltr text-right" required />
        </Field>
        <Field label="اسم المستخدم" error={fieldError(error, "username")}>
          <Input value={form.username} onChange={set("username")} className="ltr text-right" required />
        </Field>
        <Field label="الهاتف" error={fieldError(error, "phone")}>
          <Input type="tel" value={form.phone} onChange={set("phone")} className="ltr text-right" />
        </Field>
        <div className="md:col-span-2">
          {saved && <Alert tone="success" className="mb-3">{saved}</Alert>}
          {error && !error.errors && <Alert tone="danger" className="mb-3">{error.message}</Alert>}
          <Button type="submit" loading={update.isPending}>
            حفظ
          </Button>
        </div>
      </form>
    </Section>
  );
}

function LevelCard({ user }: { user: User }) {
  const { data: levels } = useLevels();
  const progress = user.level_progress;
  const next = progress.next_level;

  return (
    <Section id="level" title="المستوى">
      <p className="text-sm leading-relaxed text-ink/85">
        شريحتك الحالية: <b>المستوى {user.level?.name ?? "—"}</b>.{" "}
        {next ? `إذا كنت ترغب بترقية حسابك إلى شريحة أعلى والحصول على حسومات مميزة ما عليك إلا زيادة مبيعاتك.` : "وصلت إلى أعلى مستوى، شكرًا لثقتك!"}
      </p>
      <div className="mt-5 flex justify-between text-xs text-muted">
        <span className="ltr">{moneyShort(user.level?.min_total_purchases ?? 0)} $</span>
        <span>{Math.round(progress.percent)}%</span>
        <span className="ltr">{next ? `${moneyShort(next.min_total_purchases)} $` : "—"}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-gradient-to-l from-warn to-brand" style={{ width: `${Math.max(2, progress.percent)}%` }} />
      </div>
      {next && (
        <p className="mt-2 text-xs text-muted">
          متبقٍ <span className="ltr">{moneyShort(progress.remaining)} $</span> للوصول إلى المستوى {next.name}
        </p>
      )}
      {levels && (
        <div className="mt-5 flex flex-wrap gap-2">
          {levels.map((l) => (
            <span
              key={l.id}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs",
                l.id === user.level?.id ? "border-brand bg-brand font-semibold text-white" : "border-line text-muted",
              )}
              title={`من ${moneyShort(l.min_total_purchases)}$ · خصم ${l.discount_percent}%`}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}
    </Section>
  );
}

function SecurityCard({ user }: { user: User }) {
  const saveMe = useSaveMe();
  const [enabled, setEnabled] = useState(user.two_factor_enabled);
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const changed = enabled !== user.two_factor_enabled;

  const save = useMutation({
    mutationFn: () => send<User>("put", "/me/two-factor", { enabled, password: password || null }),
    onSuccess: (r) => {
      saveMe(r.data);
      setPassword("");
      setMessage(r.message);
      setError(null);
    },
    onError: (e) => setError(apiError(e)),
  });

  return (
    <Section id="security" title="الحماية">
      {!user.two_factor_enabled && <Alert tone="warn" className="mb-4">حرصًا على أمان حسابك يجب تفعيل المصادقة الثنائية.</Alert>}

      <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-line py-4">
        <span>
          <span className="block font-bold">المصادقة الثنائية</span>
          <span className="text-xs text-muted">سيتم إرسال رمز تحقق إلى بريدك عند كل تسجيل دخول جديد</span>
        </span>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-5 accent-[#7c3aed]" />
      </label>
      <label className="flex items-center justify-between gap-4 py-4 opacity-60">
        <span>
          <span className="ltr block text-right font-bold">Google Authenticator</span>
          <span className="text-xs text-muted">استخدم تطبيق المصادقة لتوليد الرمز — قريبًا</span>
        </span>
        <input type="checkbox" disabled className="size-5" />
      </label>

      {changed && user.has_password && (
        <Field label="كلمة السر الحالية للتأكيد" error={fieldError(error, "password")}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </Field>
      )}
      {message && <Alert tone="success" className="mt-3">{message}</Alert>}
      {error && !error.errors && <Alert tone="danger" className="mt-3">{error.message}</Alert>}

      <div className="mt-4 flex gap-3">
        <Button disabled={!changed} loading={save.isPending} onClick={() => save.mutate()}>
          حفظ
        </Button>
        <Button variant="outline" onClick={() => setShowPasswordForm((v) => !v)}>
          تغيير كلمة السر
        </Button>
      </div>
      {showPasswordForm && <PasswordForm hasPassword={user.has_password} onDone={() => setShowPasswordForm(false)} />}
    </Section>
  );
}

function PasswordForm({ hasPassword, onDone }: { hasPassword: boolean; onDone: () => void }) {
  const [form, setForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [error, setError] = useState<ApiError | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: () => send("put", "/me/password", form),
    onSuccess: (r) => {
      setDone(r.message);
      setError(null);
      setTimeout(onDone, 1500);
    },
    onError: (e) => setError(apiError(e)),
  });

  return (
    <form
      className="mt-5 grid gap-4 rounded-2xl bg-surface-2/60 p-4 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        change.mutate();
      }}
    >
      {hasPassword && (
        <Field label="كلمة السر الحالية" error={fieldError(error, "current_password")}>
          <Input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} required />
        </Field>
      )}
      <Field label="كلمة السر الجديدة" error={fieldError(error, "password")}>
        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      </Field>
      <Field label="تأكيدها">
        <Input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required />
      </Field>
      <div className="md:col-span-3">
        {done && <Alert tone="success" className="mb-3">{done}</Alert>}
        <Button type="submit" loading={change.isPending}>
          تغيير كلمة السر
        </Button>
      </div>
    </form>
  );
}

function KycCard({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: ["kyc"],
    queryFn: () => get<{ status: string; request: KycRequest | null }>("/kyc").then((r) => r.data),
  });
  const [form, setForm] = useState({ full_name: "", national_id: "", details: "" });
  const [files, setFiles] = useState<{ id_image?: File; selfie_image?: File }>({});
  const [error, setError] = useState<ApiError | null>(null);

  const submit = useMutation({
    mutationFn: () => {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => v && body.append(k, v));
      if (files.id_image) body.append("id_image", files.id_image);
      if (files.selfie_image) body.append("selfie_image", files.selfie_image);
      return send("post", "/kyc", body);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => setError(apiError(e)),
  });

  const current = status.data?.status ?? user.kyc_status;

  return (
    <Section id="kyc" title="تحقق الهوية لحسابك">
      {current === "approved" ? (
        <Alert tone="success" icon={<CheckCircle2 className="size-5 text-mint" />}>
          حسابك موثّق، ويمكنك استخدام جميع طرق الدفع.
        </Alert>
      ) : current === "pending" ? (
        <Alert tone="warn" icon={<Clock className="size-5 text-warn" />}>
          طلب التوثيق قيد المراجعة، سنرسل لك إشعارًا عند الانتهاء.
        </Alert>
      ) : (
        <>
          <p className="mb-5 text-sm leading-relaxed text-ink/85">
            يرجى تعبئة البيانات بيانات حقيقية، وإضافة أي معلومات إضافية حسب طلب الإدارة. علمًا أن بعض البنوك لن يتم قبول دفعاتها في حال مخالفة اسم المرسل للاسم المحقق لدينا.
          </p>
          {current === "rejected" && status.data?.request?.admin_note && (
            <Alert tone="danger" className="mb-4">
              رُفض الطلب السابق: {status.data.request.admin_note}
            </Alert>
          )}
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <Field label="الاسم الكامل" error={fieldError(error, "full_name")}>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </Field>
            <Field label="الرقم الوطني أو جواز السفر" error={fieldError(error, "national_id")}>
              <Input value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} className="ltr text-right" required />
            </Field>
            <div className="md:col-span-2">
              <Field label="تفاصيل إضافية (العنوان…)" error={fieldError(error, "details")}>
                <Input value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
              </Field>
            </div>
            <FileField label="صورة الهوية (الوجه الأمامي والخلفي)" error={fieldError(error, "id_image")} onChange={(f) => setFiles({ ...files, id_image: f })} />
            <FileField label="صورة شخصية لك وأنت تحمل الهوية" error={fieldError(error, "selfie_image")} onChange={(f) => setFiles({ ...files, selfie_image: f })} />
            <div className="md:col-span-2">
              {error && !error.errors && <Alert tone="danger" className="mb-3">{error.message}</Alert>}
              <Button type="submit" loading={submit.isPending}>
                حفظ
              </Button>
            </div>
          </form>
        </>
      )}
    </Section>
  );
}

function FileField({ label, error, onChange }: { label: string; error?: string; onChange: (f?: File) => void }) {
  return (
    <Field label={label} error={error}>
      <input
        type="file"
        accept="image/*"
        required
        onChange={(e) => onChange(e.target.files?.[0])}
        className="block w-full rounded-xl border border-line bg-surface-2/60 p-3 text-sm text-muted file:ml-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-ink"
      />
    </Field>
  );
}

function TelegramCard({ linked }: { linked: boolean }) {
  const [info, setInfo] = useState<{ url: string | null; token: string } | null>(null);
  const link = useMutation({
    mutationFn: () => send<{ url: string | null; token: string }>("post", "/me/telegram/link"),
    onSuccess: (r) => {
      setInfo(r.data);
      if (r.data.url) window.open(r.data.url, "_blank", "noopener");
    },
  });

  return (
    <Section id="telegram">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">حساب تلغرام</h2>
          <p className="mt-1 text-sm text-muted">{linked ? "حساب تلغرام مربوط بحسابك في المتجر." : "اربط حسابك على تلغرام مع حسابك في المتجر."}</p>
        </div>
        {!linked && (
          <Button loading={link.isPending} onClick={() => link.mutate()}>
            ربط
          </Button>
        )}
      </div>
      {info && !info.url && (
        <Alert tone="warn" className="mt-4">
          لم يُضبط بوت تلغرام بعد. رمز الربط: <span className="ltr select-all font-bold">{info.token}</span>
        </Alert>
      )}
    </Section>
  );
}

function AgentsCard() {
  const { data: agents } = useAgents();

  return (
    <Section id="agents" title="وكلاؤنا">
      <div className="grid gap-3 md:grid-cols-3">
        {agents?.map((a) => {
          const wa = whatsappUrl(a.whatsapp);
          return (
            <div key={a.id} className="rounded-2xl bg-surface-2/70 p-4">
              <p className="font-bold">{a.name}</p>
              <p className="mt-1 text-xs text-muted">{a.region}</p>
              {wa && (
                <a href={wa} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-mint">
                  تواصل عبر واتساب
                </a>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
