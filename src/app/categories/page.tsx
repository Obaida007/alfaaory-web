"use client";

import { SectionBrowser } from "@/components/section-browser";
import { AppShell } from "@/components/shell";
import { ErrorBox, Spinner } from "@/components/ui";
import { apiError } from "@/lib/api";
import { useCategoryTree } from "@/lib/queries";

/** "الأقسام" opens the first section (قسم الألعاب) with the section sidebar. */
export default function CategoriesPage() {
  const tree = useCategoryTree();

  if (tree.data?.[0]) return <SectionBrowser section={tree.data[0]} />;

  return (
    <AppShell title="الأقسام">
      {tree.isError ? <ErrorBox message={apiError(tree.error).message} onRetry={() => tree.refetch()} /> : <Spinner />}
    </AppShell>
  );
}
