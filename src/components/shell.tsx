"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Home, LayoutGrid, Plus, ReceiptText, User, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/format";
import { useSettings } from "@/lib/queries";
import { whatsappUrl } from "@/lib/format";
import { cn } from "./ui";

const NAV = [
  { href: "/", label: "الرئيسية", match: (p: string) => p === "/" },
  { href: "/categories", label: "الأقسام", match: (p: string) => p.startsWith("/categories") || p.startsWith("/search") },
  { href: "/orders", label: "طلباتي", match: (p: string) => p.startsWith("/orders") },
  { href: "/about", label: "من نحن", match: (p: string) => p.startsWith("/about") },
];

const TABS = [
  { href: "/", label: "الرئيسية", icon: Home, match: (p: string) => p === "/" },
  { href: "/categories", label: "الأقسام", icon: LayoutGrid, match: (p: string) => p.startsWith("/categories") || p.startsWith("/search") },
  { href: "/add-balance", label: "الرصيد", icon: Wallet, match: (p: string) => p.startsWith("/add-balance") },
  { href: "/orders", label: "طلباتي", icon: ReceiptText, match: (p: string) => p.startsWith("/orders") },
  {
    href: "/account",
    label: "حسابي",
    icon: User,
    match: (p: string) => ["/account", "/wallet", "/deposits", "/favorites", "/notifications"].some((x) => p.startsWith(x)),
  },
];

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white md:size-10">ف</span>
      {!compact && <span className="text-base font-bold md:text-lg">متجر الفاعوري</span>}
    </Link>
  );
}

function BalancePill({ mobile }: { mobile?: boolean }) {
  const { user, isLoggedIn, ready } = useAuth();

  if (!ready) return <div className="h-10 w-28 animate-pulse rounded-xl bg-surface-2" />;

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-600">
        تسجيل الدخول
      </Link>
    );
  }

  if (mobile) {
    return (
      <Link href="/add-balance" className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-mint text-mint-ink">
          <Plus className="size-4" strokeWidth={3} />
        </span>
        <span className="ltr text-sm font-bold">{money(user?.balance)} $</span>
      </Link>
    );
  }

  return (
    <div className="flex h-11 items-center gap-3 rounded-xl border border-line bg-surface px-2">
      <Link href="/add-balance" className="rounded-lg bg-mint px-2.5 py-1 text-xs font-bold text-mint-ink hover:brightness-95">
        شحن
      </Link>
      <span className="text-xs text-muted">الرصيد</span>
      <span className="ltr pl-1 text-sm font-bold">{money(user?.balance)} $</span>
    </div>
  );
}

function DesktopHeader() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-bg/85 backdrop-blur md:block">
      <div className="mx-auto flex h-[86px] max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm transition",
                  item.match(pathname) ? "bg-surface-2 font-semibold text-ink" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <BalancePill />
          {isLoggedIn && (
            <Link href="/account" aria-label="حسابي" className="flex size-11 items-center justify-center rounded-xl border border-line hover:bg-surface-2">
              <User className="size-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/** Mobile top bar: back button + title on inner pages, logo on the home page. */
function MobileTopBar({ title, subtitle, back }: { title?: string; subtitle?: string; back?: string | boolean }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/90 backdrop-blur md:hidden">
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          {title ? (
            <>
              {back !== false && (
                <button
                  onClick={() => (typeof back === "string" ? router.push(back) : router.back())}
                  aria-label="رجوع"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line"
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-bold leading-tight">{title}</p>
                {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
              </div>
            </>
          ) : (
            <Logo />
          )}
        </div>
        <BalancePill mobile />
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 py-3 text-xs", active ? "font-semibold text-brand-300" : "text-muted")}>
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Footer() {
  const { data: settings } = useSettings();
  const whatsapp = whatsappUrl(settings?.admin_whatsapp);

  return (
    <footer className="mx-auto mt-16 max-w-6xl px-4 pb-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted">
        <span>©{new Date().getFullYear()} متجر الفاعوري</span>
        <div className="flex items-center gap-5">
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noreferrer" className="hover:text-ink">
              واتساب
            </a>
          )}
          {settings?.facebook_url && (
            <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-ink">
              فيسبوك
            </a>
          )}
          <Link href="/about" className="hover:text-ink">
            من نحن
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            سياسة الخصوصية
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  back,
  footer = true,
  bottomSpace = true,
  tabs = true,
}: {
  children: ReactNode;
  /** Mobile top-bar title; omit on the home page to show the logo. */
  title?: string;
  subtitle?: string;
  back?: string | boolean;
  footer?: boolean;
  /** Extra bottom padding on mobile so content clears the tab bar. */
  bottomSpace?: boolean;
  /** Show the mobile bottom tab bar (the product page replaces it with a buy bar). */
  tabs?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DesktopHeader />
      <MobileTopBar title={title} subtitle={subtitle} back={back} />
      <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 pt-4 md:px-6 md:pt-8", bottomSpace && "pb-28 md:pb-0")}>{children}</main>
      {footer && <div className={cn(bottomSpace && "pb-20 md:pb-0")}><Footer /></div>}
      {tabs && <BottomNav />}
    </div>
  );
}
