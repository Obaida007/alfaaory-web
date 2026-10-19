"use client";

import Link from "next/link";
import { ChevronLeft, Loader2, Search } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { initials } from "@/lib/format";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "mint" | "outline" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-600 shadow-[0_8px_24px_-12px_rgb(124_58_237/0.8)]",
  mint: "bg-mint text-mint-ink hover:brightness-95",
  outline: "border border-line bg-transparent text-ink hover:bg-surface-2",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-surface-2",
  danger: "border border-danger/40 bg-transparent text-danger hover:bg-danger-bg",
};

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonStyles[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition",
        buttonStyles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-line bg-surface-2/60 px-4 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand/70 focus:ring-2 focus:ring-brand/20",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  error,
  hint,
  children,
  aside,
}: {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center justify-between text-sm text-ink/90">
        <span>{label}</span>
        {aside}
      </span>
      {children}
      {error ? <span className="block text-xs text-danger">{error}</span> : hint ? <span className="block text-xs text-faint">{hint}</span> : null}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-line bg-surface", className)}>{children}</div>;
}

type Tone = "success" | "warn" | "danger" | "muted" | "brand";

const toneStyles: Record<Tone, string> = {
  success: "bg-success-bg text-mint",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
  muted: "bg-surface-2 text-muted",
  brand: "bg-brand/20 text-brand-300",
};

export function Badge({ tone = "muted", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold", toneStyles[tone], className)}>
      {children}
    </span>
  );
}

export function Alert({ tone = "success", icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl px-5 py-4 text-sm", toneStyles[tone], className)}>
      {icon}
      <div className="flex-1 text-ink/95">{children}</div>
    </div>
  );
}

/** Image when available, otherwise the design's two-letter violet tile. */
export function Tile({ name, image, className, textClassName }: { name: string; image?: string | null; className?: string; textClassName?: string }) {
  return (
    <div className={cn("flex items-center justify-center overflow-hidden rounded-xl bg-tile", className)}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="size-full object-cover" />
      ) : (
        <span className={cn("ltr font-bold tracking-wide text-tile-ink", textClassName)}>{initials(name)}</span>
      )}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center py-16", className)}>
      <Loader2 className="size-7 animate-spin text-brand-300" />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">{children}</div>;
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger-bg/40 px-6 py-10 text-center text-sm text-danger">
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="h-9">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="mb-3 hidden flex-wrap items-center gap-2 text-sm text-muted md:flex">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-faint">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageTitle({ title, subtitle, aside, className }: { title: ReactNode; subtitle?: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 hidden flex-wrap items-end justify-between gap-4 md:flex", className)}>
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pr-11" />
    </div>
  );
}

export function SectionHeader({ title, href, linkLabel = "عرض الكل", meta }: { title: string; href?: string; linkLabel?: string; meta?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
      {href ? (
        <Link href={href} className="flex items-center gap-1 text-xs text-brand-300 hover:text-ink">
          {linkLabel}
          <ChevronLeft className="size-3 md:hidden" />
        </Link>
      ) : (
        meta && <span className="text-xs text-muted">{meta}</span>
      )}
    </div>
  );
}

export function LoadMore({ hasMore, loading, onClick }: { hasMore: boolean; loading: boolean; onClick: () => void }) {
  if (!hasMore) return null;
  return (
    <div className="mt-6 flex justify-center">
      <Button variant="outline" loading={loading} onClick={onClick}>
        عرض المزيد
      </Button>
    </div>
  );
}
