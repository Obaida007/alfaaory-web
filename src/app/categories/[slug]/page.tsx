"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ProductView } from "@/components/product-view";
import { SectionBrowser } from "@/components/section-browser";
import { AppShell } from "@/components/shell";
import { ErrorBox, Spinner } from "@/components/ui";
import { apiError } from "@/lib/api";
import { useCategory } from "@/lib/queries";

/**
 * One route for the whole tree:
 * - root section (قسم الألعاب)      → grid of its games
 * - game (PUBG MOBILE)             → product page with its types as tabs
 * - type (PUBG GLOBAL AUTO)        → redirects to the game page with ?type=
 */
export default function CategoryPage() {
  return (
    <Suspense fallback={<AppShell title=" "><Spinner /></AppShell>}>
      <CategoryRoute />
    </Suspense>
  );
}

function CategoryRoute() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const category = useCategory(decodeURIComponent(slug));
  const c = category.data;

  const isType = !!c && !!c.parent && c.parent.parent_id !== null && (c.children?.length ?? 0) === 0;

  useEffect(() => {
    if (isType && c?.parent) {
      const product = search.get("product");
      router.replace(`/categories/${c.parent.slug}?type=${c.slug}${product ? `&product=${product}` : ""}`);
    }
  }, [isType, c, router, search]);

  if (category.isError) {
    return (
      <AppShell title="القسم">
        <ErrorBox message={apiError(category.error).message} onRetry={() => category.refetch()} />
      </AppShell>
    );
  }

  if (!c || isType) {
    return (
      <AppShell title=" ">
        <Spinner />
      </AppShell>
    );
  }

  if (c.parent_id === null && (c.children?.length ?? 0) > 0) return <SectionBrowser section={c} />;

  return <ProductView game={c} />;
}
