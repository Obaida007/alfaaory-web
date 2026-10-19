"use client";

import Link from "next/link";
import { ChevronLeft, MessageSquare, ShieldCheck, Tag, Zap } from "lucide-react";
import type { Category } from "@/lib/api";
import { SectionArt, SectionBackdrop } from "./section-art";
import { Tile, cn } from "./ui";

/** Big illustrated card for a root section (قسم الألعاب, عالم الاشتراكات…). */
export function SectionCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-brand/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {category.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={category.image_url} alt={category.name} className="size-full object-cover" />
        ) : (
          <>
            <SectionBackdrop />
            <SectionArt slug={category.slug} className="absolute inset-0 m-auto h-4/5 transition group-hover:scale-105" />
          </>
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-3 md:px-4">
        <span className="text-sm font-semibold">{category.name}</span>
        <ChevronLeft className="hidden size-4 text-muted md:block" />
      </div>
    </Link>
  );
}

/** Game / service card: image or initials tile with the name under it. */
export function ItemCard({ category, className }: { category: Category; className?: string }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn("group rounded-2xl border border-line bg-surface p-2 transition hover:border-brand/50", className)}
    >
      <Tile name={category.name} image={category.image_url} className="aspect-[4/3] w-full" textClassName="text-2xl md:text-3xl" />
      <p className="ltr truncate px-1 pb-1 pt-3 text-right text-xs font-semibold md:text-sm" dir="auto">
        {category.name}
      </p>
    </Link>
  );
}

/** Compact name-only card (subscriptions row). */
export function NameCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="ltr flex h-14 items-center justify-center rounded-2xl border border-line bg-surface px-3 text-center text-xs font-bold transition hover:border-brand/50 md:h-[52px] md:text-sm"
    >
      {category.name}
    </Link>
  );
}

const FEATURES = [
  { icon: Zap, title: "سرعة التنفيذ", text: "أغلب الطلبات تكتمل خلال دقائق معدودة." },
  { icon: ShieldCheck, title: "أمان مضمون", text: "معاملات آمنة مع حماية بياناتك." },
  { icon: MessageSquare, title: "دعم فني متواصل", text: "فريق دعم جاهز لمساعدتك 24/7." },
  { icon: Tag, title: "أسعار تنافسية", text: "أفضل الأسعار مع عروض أسبوعية حصرية." },
];

export function Features({ extra }: { extra?: boolean }) {
  const items = extra ? [...FEATURES, { icon: Tag, title: "هدايا وعروض مستمرة", text: "مكافآت دائمة للمواظبين والعملاء الجدد." }] : FEATURES;

  return (
    <div className={cn("grid gap-3 md:gap-4", extra ? "grid-cols-1 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4")}>
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="rounded-2xl border border-line bg-surface p-4 md:p-5">
          {!extra && <Icon className="mb-3 hidden size-5 text-mint md:block" />}
          <p className={cn("font-bold", extra ? "text-mint" : "text-mint md:text-ink")}>{title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted md:text-sm">{text}</p>
        </div>
      ))}
    </div>
  );
}
