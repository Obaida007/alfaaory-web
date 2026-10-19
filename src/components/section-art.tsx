import type { ReactNode } from "react";

/**
 * Illustrations for the 11 store sections (keyed by category slug), drawn after the design.
 * Used when a section has no uploaded image.
 */
const ART: Record<string, ReactNode> = {
  games: (
    <g>
      <path d="M38 34h44c11 0 18 9 20 20l3 14c2 8-6 14-12 9l-9-8H36l-9 8c-6 5-14-1-12-9l3-14c2-11 9-20 20-20z" fill="#8b5cf6" />
      <rect x="31" y="47" width="5" height="16" rx="2" fill="#f4f3f8" />
      <rect x="25.5" y="52.5" width="16" height="5" rx="2" fill="#f4f3f8" />
      <circle cx="80" cy="50" r="4" fill="#f4f3f8" />
      <circle cx="88" cy="58" r="4" fill="#f4f3f8" />
      <circle cx="72" cy="58" r="4" fill="#f4f3f8" />
      <circle cx="54" cy="55" r="2.5" fill="#c4b5fd" />
      <circle cx="64" cy="55" r="2.5" fill="#c4b5fd" />
    </g>
  ),
  subscriptions: (
    <g>
      <rect x="22" y="26" width="76" height="50" rx="6" fill="#ec6aa9" />
      <path d="M53 40l20 11-20 11z" fill="#fde2ef" />
      <rect x="44" y="82" width="32" height="5" rx="2.5" fill="#d9d6e4" />
    </g>
  ),
  balances: (
    <g>
      <rect x="40" y="18" width="38" height="72" rx="7" fill="#57d39d" />
      <rect x="45" y="27" width="28" height="50" rx="3" fill="#1b2a24" />
      <rect x="51" y="58" width="4" height="12" rx="1" fill="#57d39d" />
      <rect x="57" y="51" width="4" height="19" rx="1" fill="#57d39d" />
      <rect x="63" y="44" width="4" height="26" rx="1" fill="#57d39d" />
      <circle cx="59" cy="83" r="2.5" fill="#1b2a24" />
      <circle cx="86" cy="70" r="11" fill="#13111c" stroke="#e8e6ef" strokeWidth="3.5" />
      <path d="M86 64v12M80 70h12" stroke="#e8e6ef" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  "gift-cards": (
    <g>
      <rect x="44" y="26" width="62" height="40" rx="5" fill="#d9d6e4" transform="rotate(8 75 46)" />
      <rect x="20" y="36" width="64" height="42" rx="6" fill="#f4b955" />
      <rect x="20" y="45" width="64" height="7" fill="#c98a2b" />
      <rect x="27" y="58" width="22" height="4" rx="2" fill="#c98a2b" />
      <rect x="27" y="66" width="34" height="4" rx="2" fill="#c98a2b" />
    </g>
  ),
  chat: (
    <g>
      <path d="M22 30h44c4 0 7 3 7 7v24c0 4-3 7-7 7H38l-11 9v-9h-5c-4 0-7-3-7-7V37c0-4 3-7 7-7z" fill="#4aa8ee" />
      <circle cx="33" cy="49" r="3.5" fill="#fff" />
      <circle cx="44" cy="49" r="3.5" fill="#fff" />
      <circle cx="55" cy="49" r="3.5" fill="#fff" />
      <path d="M56 46h40c4 0 7 3 7 7v22c0 4-3 7-7 7h-5v9l-11-9H56c-4 0-7-3-7-7V53c0-4 3-7 7-7z" fill="#eceaf3" />
      <rect x="60" y="57" width="34" height="4" rx="2" fill="#9a96ad" />
      <rect x="60" y="66" width="24" height="4" rx="2" fill="#9a96ad" />
    </g>
  ),
  "numbers-accounts": (
    <g>
      <path d="M38 22h26l14 14v48c0 3-3 6-6 6H38c-3 0-6-3-6-6V28c0-3 3-6 6-6z" fill="#f0795d" />
      <rect x="40" y="48" width="30" height="26" rx="4" fill="#fff" opacity="0.92" />
      <path d="M55 48v26M40 61h30" stroke="#f0795d" strokeWidth="3" />
      <circle cx="82" cy="72" r="15" fill="#e8e6ef" />
      <circle cx="82" cy="67" r="5" fill="#13111c" />
      <path d="M72 81c2-6 6-8 10-8s8 2 10 8" fill="#13111c" />
    </g>
  ),
  crypto: (
    <g>
      <circle cx="70" cy="56" r="18" fill="#d9d6e4" />
      <circle cx="50" cy="50" r="22" fill="#f4c542" />
      <circle cx="50" cy="50" r="16" fill="none" stroke="#1d1a14" strokeWidth="3" />
      <text x="50" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1d1a14" fontFamily="sans-serif">B</text>
      <path d="M68 86l12-12 7 6 14-16" stroke="#f4c542" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="101" cy="64" r="3" fill="#f4c542" />
    </g>
  ),
  "money-transfers": (
    <g>
      <path d="M28 30h56M76 22l10 8-10 8" stroke="#f4f3f8" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="24" y="42" width="72" height="30" rx="5" fill="#3cc6b4" />
      <circle cx="60" cy="57" r="9" fill="#13111c" />
      <circle cx="35" cy="57" r="3" fill="#13111c" />
      <circle cx="85" cy="57" r="3" fill="#13111c" />
      <path d="M92 84H36M44 76l-10 8 10 8" stroke="#f4f3f8" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  "social-media": (
    <g>
      <path d="M44 86S18 70 18 52c0-9 7-16 15-16 5 0 9 3 11 6 2-3 6-6 11-6 8 0 15 7 15 16 0 18-26 34-26 34z" fill="#f05b8a" />
      <rect x="66" y="22" width="34" height="26" rx="5" fill="#f4f3f8" />
      <path d="M79 29l10 6-10 6z" fill="#13111c" />
      <circle cx="84" cy="70" r="12" fill="#f05b8a" opacity="0.85" />
      <rect x="77" y="66" width="14" height="3" rx="1.5" fill="#fff" />
      <rect x="77" y="72" width="10" height="3" rx="1.5" fill="#fff" />
    </g>
  ),
  "software-tools": (
    <g>
      <rect x="18" y="24" width="84" height="58" rx="6" fill="#7b83f6" />
      <rect x="22" y="36" width="76" height="42" rx="3" fill="#1b1a33" />
      <circle cx="26" cy="30" r="2" fill="#fff" />
      <circle cx="33" cy="30" r="2" fill="#fff" />
      <circle cx="40" cy="30" r="2" fill="#fff" />
      <path d="M46 49l-10 8 10 8M74 49l10 8-10 8M64 46l-8 22" stroke="#e8e6ff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  "salary-check": (
    <g>
      <path d="M36 18h44v68l-5-4-6 4-5-4-6 4-5-4-6 4-5-4-6 4z" fill="#f4f3f8" />
      <rect x="44" y="30" width="28" height="4" rx="2" fill="#9a96ad" />
      <rect x="44" y="40" width="20" height="4" rx="2" fill="#9a96ad" />
      <circle cx="58" cy="62" r="10" fill="#43c08a" />
      <path d="M53 62l4 4 7-8" stroke="#13111c" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="90" cy="74" r="10" fill="#13111c" stroke="#6ee7b7" strokeWidth="3.5" />
      <circle cx="90" cy="74" r="4.5" fill="#6ee7b7" />
    </g>
  ),
};

export function SectionArt({ slug, className }: { slug: string; className?: string }) {
  const art = ART[slug];
  if (!art) return null;

  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      {art}
    </svg>
  );
}

/** Decorative card backdrop: soft circles + a dot grid in the corner, as in the design. */
export function SectionBackdrop() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="200" height="120" fill="#1d1830" />
      <circle cx="175" cy="18" r="45" fill="#2a2342" />
      <circle cx="10" cy="118" r="34" fill="#2a2342" />
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={i} cx={10 + (i % 6) * 5} cy={10 + Math.floor(i / 6) * 5} r="0.9" fill="#6f6a82" />
      ))}
    </svg>
  );
}
