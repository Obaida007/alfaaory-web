"use client";

import { CreditCard, Gamepad2 } from "lucide-react";
import { Features } from "@/components/catalog";
import { AppShell } from "@/components/shell";
import { usePage, useSettings } from "@/lib/queries";
import { whatsappUrl } from "@/lib/format";

const SERVICES = [
  { icon: CreditCard, title: "شحن الرصيد والبطاقات الرقمية", items: ["جميع شركات الاتصالات", "منصات الألعاب والترفيه", "خدمات الاشتراكات"] },
  { icon: Gamepad2, title: "شحن الألعاب والبرامج", items: ["أحدث الألعاب بأسعار تنافسية", "جميع البرامج والتطبيقات", "حسابات وعروض حصرية"] },
];

export default function AboutPage() {
  const { data: about } = usePage("about");
  const { data: settings } = useSettings();

  const contacts = [
    { label: "رقم الإدارة — واتساب", value: settings?.admin_whatsapp, href: whatsappUrl(settings?.admin_whatsapp), ltr: true },
    { label: "مجتمع العروض", value: settings?.whatsapp_group_url ? "انضم إلى مجموعة واتساب" : null, href: settings?.whatsapp_group_url },
    { label: "قناتنا", value: settings?.whatsapp_channel_url ? "تابع قناة واتساب" : null, href: settings?.whatsapp_channel_url },
    { label: "الموقع الإلكتروني", value: "alfaore-store.com", href: "https://alfaore-store.com", ltr: true },
  ].filter((c) => c.value);

  return (
    <AppShell title="من نحن">
      <section className="pb-10 md:pb-14 md:pt-6">
        <p className="mb-4 text-sm text-brand-300">من نحن في شركة الفاعوري؟</p>
        <h1 className="text-3xl font-bold md:text-6xl">بوابتك الرقمية الموثوقة</h1>
        <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink/85 md:text-lg">
          {about?.content || "نقدّم حلولًا تقنية شاملة عبر منصتنا الرئيسية Alfaore Store — المتجر الإلكتروني المتكامل لجميع احتياجاتك الرقمية."}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-xl font-bold md:text-2xl">خدماتنا الرئيسية</h2>
        <div className="grid gap-4 md:grid-cols-2 md:pl-[25%]">
          {SERVICES.map(({ icon: Icon, title, items }) => (
            <div key={title} className="rounded-3xl border border-line bg-surface p-6 md:p-8">
              <span className="mb-6 hidden size-12 items-center justify-center rounded-xl bg-tile text-brand-300 md:flex">
                <Icon className="size-5" />
              </span>
              <h3 className="text-lg font-bold md:text-xl">{title}</h3>
              <ul className="mt-4 list-disc space-y-2 pr-5 text-sm text-ink/85">
                {items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-5 text-xl font-bold md:text-2xl">لماذا نحن مختلفون؟</h2>
        <Features extra />
      </section>

      {contacts.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-5 text-xl font-bold md:text-2xl">تواصل معنا</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 transition hover:border-brand/50 md:block md:p-5"
              >
                <p className="text-xs text-muted">{c.label}</p>
                <p className={`font-bold md:mt-2 ${c.ltr ? "ltr" : ""}`}>{c.value}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 rounded-3xl border border-line bg-surface p-6 md:grid-cols-[1fr_380px] md:items-center md:p-12">
        <div>
          <p className="text-sm text-brand-300">كلمة أخيرة</p>
          <h2 className="mt-3 text-2xl font-bold leading-snug md:text-3xl">نحن لسنا مجرد بائعين، نحن شركاء في رحلتك الرقمية.</h2>
          <p className="mt-4 text-sm text-muted">الفاعوري — نسهّل عالمك الرقمي.</p>
        </div>
        <div>
          <p className="mb-3 hidden text-sm text-muted md:block">نؤمن أن التكنولوجيا يجب أن تكون:</p>
          <div className="flex flex-wrap gap-2 md:flex-col">
            {["يسيرة الوصول", "آمنة الاستخدام", "مفيدة للجميع"].map((t) => (
              <span key={t} className="rounded-xl bg-surface-2 px-4 py-3 text-sm font-semibold">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
