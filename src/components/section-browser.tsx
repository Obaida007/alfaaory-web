"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category } from "@/lib/api";
import { useCategoryTree } from "@/lib/queries";
import { ItemCard } from "./catalog";
import { AppShell } from "./shell";
import { Breadcrumbs, Button, Empty, SearchBox, cn } from "./ui";

const PAGE = 20;

function countLabel(section: Category, count: number) {
  return section.slug === "games" ? `${count} لعبة` : `${count} عنصر`;
}

/** A root section: sidebar of all sections, searchable grid of its games/services. */
export function SectionBrowser({ section }: { section: Category }) {
  const { data: tree } = useCategoryTree();
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const children = useMemo(() => tree?.find((c) => c.id === section.id)?.children ?? section.children ?? [], [tree, section]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? children.filter((c) => c.name.toLowerCase().includes(needle)) : children;
  }, [children, q]);
  const visible = filtered.slice(0, limit);

  return (
    <AppShell title={section.name} subtitle={countLabel(section, children.length)} back="/">
      <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: section.name }]} />
      <div className="mb-6 hidden items-center justify-between gap-6 md:flex">
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-bold">{section.name}</h1>
          <span className="text-sm text-muted">{countLabel(section, children.length)}</span>
        </div>
        <SearchBox value={q} onChange={setQ} placeholder={`ابحث داخل ${section.name}…`} className="w-96" />
      </div>
      <SearchBox value={q} onChange={setQ} placeholder={`ابحث داخل ${section.name}…`} className="mb-4 md:hidden" />

      {tree && (
        <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:hidden">
          {tree.map((s) => (
            <Link
              key={s.id}
              href={`/categories/${s.slug}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm",
                s.id === section.id ? "border-brand bg-brand font-semibold text-white" : "border-line text-muted",
              )}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden self-start rounded-2xl border border-line bg-surface p-3 md:block">
          <p className="px-3 pb-2 pt-1 text-xs text-muted">كل الأقسام</p>
          {tree?.map((s) => (
            <Link
              key={s.id}
              href={`/categories/${s.slug}`}
              className={cn(
                "block rounded-xl px-4 py-2.5 text-sm transition",
                s.id === section.id ? "bg-surface-2 font-semibold text-ink" : "text-muted hover:text-ink",
              )}
            >
              {s.name}
            </Link>
          ))}
        </aside>

        <div>
          {visible.length === 0 ? (
            <Empty>{q ? "لا توجد نتائج مطابقة." : "لا توجد عناصر في هذا القسم بعد."}</Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {visible.map((c) => (
                <ItemCard key={c.id} category={c} />
              ))}
            </div>
          )}
          {filtered.length > limit && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" className="w-full md:w-auto" onClick={() => setLimit((l) => l + PAGE * 2)}>
                عرض {filtered.length - limit} {section.slug === "games" ? "لعبة" : "عنصر"} أخرى
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
