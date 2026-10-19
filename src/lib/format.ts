/** "24.5" → "24.50" — amounts come from the API as decimal strings. */
export function money(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

/** Whole amounts without decimals ("0", "500"), otherwise two decimals. */
export function moneyShort(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function date(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function dateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return `${date(value)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Two-letter tile label for items without an image, e.g. "PUBG MOBILE" → "PU". */
export function initials(name: string): string {
  return name.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase();
}

export function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

export function whatsappUrl(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

type Labelled = { name: string; category?: { name: string } | null };

/** "PUBG GLOBAL AUTO" + "660 UC" → "PUBG GLOBAL 660", as product names are shown in the design. */
export function productLabel(product: Labelled | null | undefined): string {
  if (!product) return "—";
  const type = product.category?.name.replace(/\s+(AUTO|MAN|CODES)$/i, "") ?? "";
  return `${type} ${product.name.replace(/\s*UC$/i, "")}`.trim();
}

/** Name for the product's two-letter tile: its game/type, else the product itself. */
export function productTileName(product: Labelled | null | undefined): string {
  return product?.category?.name ?? product?.name ?? "?";
}
