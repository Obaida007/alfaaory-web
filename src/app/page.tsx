"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { Features, ItemCard, NameCard, SectionCard } from "@/components/catalog";
import { AppShell } from "@/components/shell";
import { ButtonLink, ErrorBox, SectionHeader, Spinner } from "@/components/ui";
import { apiError, type Banner, type Category } from "@/lib/api";
import { whatsappUrl } from "@/lib/format";
import { useCategoryTree, useHome, useSettings } from "@/lib/queries";

export default function HomePage() {
  const home = useHome();
  const tree = useCategoryTree();
  const { data: settings } = useSettings();

  const sections = home.data?.sections ?? [];
  const games = tree.data?.find((c) => c.slug === "games");
  const subscriptions = tree.data?.find((c) => c.slug === "subscriptions");
  const promo = home.data?.hero_banners[0];
  const popular = popularCategories(tree.data ?? []);

  return (
    <AppShell>
      <section className="grid gap-6 pb-10 md:grid-cols-[1fr_340px] md:gap-10 md:pb-14 md:pt-6">
        <div className="md:pt-6">
          <p className="mb-4 hidden text-xs text-brand-300 md:block">الفاعوري — نسهّل عالمك الرقمي</p>
          <h1 className="text-[1.65rem] font-bold leading-snug md:text-5xl md:leading-tight">
            اشحن ألعابك واشتراكاتك
            <br />
            خلال دقائق<span className="hidden md:inline"> معدودة</span>
          </h1>
          <p className="mt-5 hidden max-w-xl text-sm leading-relaxed text-muted md:block">
            شحن الألعاب، الاشتراكات، البطاقات الإلكترونية والأرصدة في مكان واحد — بأسعار تنافسية ومعاملات آمنة.
          </p>
          <HeroSearch />
          {popular.length > 0 && (
            <div className="mt-5 hidden flex-wrap items-center gap-2 md:flex">
              <span className="text-xs text-muted">الأكثر طلبًا:</span>
              {popular.map((c) => (
                <Link key={c.id} href={`/categories/${c.slug}`} className="ltr rounded-full border border-line px-4 py-1.5 text-xs font-semibold hover:border-brand/60">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        {promo && <PromoCard banner={promo} whatsapp={whatsappUrl(settings?.admin_whatsapp)} />}
      </section>

      {home.isPending ? (
        <Spinner />
      ) : home.isError ? (
        <ErrorBox message={apiError(home.error).message} onRetry={() => home.refetch()} />
      ) : (
        <>
          <section className="mb-12">
            <SectionHeader title="الأقسام" meta={`${sections.length} قسمًا`} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {sections.map((s) => (
                <SectionCard key={s.id} category={s} />
              ))}
            </div>
          </section>

          {games && (games.children?.length ?? 0) > 0 && (
            <section className="mb-12">
              <SectionHeader title={games.name} href={`/categories/${games.slug}`} linkLabel="عرض كل الألعاب" />
              <div className="grid grid-cols-3 gap-3 md:grid-cols-5 md:gap-4">
                {games.children!.slice(0, 10).map((g, i) => (
                  <ItemCard key={g.id} category={g} className={i >= 6 ? "hidden md:block" : undefined} />
                ))}
              </div>
            </section>
          )}

          {subscriptions && (subscriptions.children?.length ?? 0) > 0 && (
            <section className="mb-12">
              <SectionHeader title={subscriptions.name} href={`/categories/${subscriptions.slug}`} />
              <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
                {subscriptions.children!.slice(0, 6).map((s) => (
                  <NameCard key={s.id} category={s} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-xl font-bold md:text-2xl">لماذا نحن مختلفون؟</h2>
            <Features />
          </section>
        </>
      )}
    </AppShell>
  );
}

function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      className="mt-6 flex items-center gap-2 rounded-2xl border border-line bg-surface p-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <Search className="mr-2 size-4 shrink-0 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث عن لعبة، اشتراك أو بطاقة…"
        className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
      />
      <button type="submit" className="hidden h-10 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-600 md:block">
        بحث
      </button>
    </form>
  );
}

function PromoCard({ banner, whatsapp }: { banner: Banner; whatsapp: string | null }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 md:p-6">
      <span className="inline-block rounded-lg bg-warn-bg px-3 py-1 text-xs font-semibold text-warn">بشرى لزبائننا الكرام</span>
      <h2 className="mt-4 text-xl font-bold leading-snug">{banner.title}</h2>
      {banner.body && <p className="mt-3 text-sm leading-relaxed text-muted">{banner.body}</p>}
      <div className="mt-4 hidden flex-wrap gap-2 md:flex">
        {["أمان", "سرعة", "ثقة"].map((t) => (
          <span key={t} className="rounded-lg border border-line px-3 py-1 text-xs text-muted">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-5 space-y-2.5 md:mt-8">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-xl bg-mint text-sm font-semibold text-mint-ink hover:brightness-95"
          >
            تواصل عبر واتساب
          </a>
        )}
        {banner.link ? (
          <ButtonLink href={banner.link} variant="outline" className="hidden w-full md:flex">
            التفاصيل
          </ButtonLink>
        ) : (
          <ButtonLink href="/add-balance" variant="outline" className="hidden w-full md:flex">
            شحن الرصيد
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

/** "الأكثر طلبًا" chips: the first games and subscriptions. */
function popularCategories(tree: Category[]): Category[] {
  const games = tree.find((c) => c.slug === "games")?.children ?? [];
  const subs = tree.find((c) => c.slug === "subscriptions")?.children ?? [];
  return [...games.slice(0, 2), ...subs.slice(0, 2)];
}
