"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui";

export type DateRange = { from?: string; to?: string };

/** "من / إلى" date inputs with a search button, as in the design's history pages. */
export function DateRangeFilter({ value, onApply }: { value: DateRange; onApply: (range: DateRange) => void }) {
  const [from, setFrom] = useState(value.from ?? "");
  const [to, setTo] = useState(value.to ?? "");

  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onApply({ from: from || undefined, to: to || undefined });
      }}
    >
      <label className="block flex-1 space-y-2 md:w-72 md:flex-none">
        <span className="text-sm text-muted">من</span>
        <Input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="ltr text-right" />
      </label>
      <label className="block flex-1 space-y-2 md:w-72 md:flex-none">
        <span className="text-sm text-muted">إلى</span>
        <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="ltr text-right" />
      </label>
      <button type="submit" aria-label="بحث" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-600">
        <Search className="size-5" />
      </button>
    </form>
  );
}
