"use client";

import { AppShell } from "@/components/shell";
import { Spinner } from "@/components/ui";
import { usePage, useSettings } from "@/lib/queries";

type Block = { title: string; items: string[] };

/**
 * The policy is edited from the admin settings as light markup:
 * "## " starts a section, "- " a bullet, other lines are paragraphs (the first ones form the intro).
 */
function parse(content: string): { intro: string[]; blocks: Block[] } {
  const intro: string[] = [];
  const blocks: Block[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) blocks.push({ title: line.slice(3), items: [] });
    else if (blocks.length) blocks[blocks.length - 1].items.push(line.replace(/^-\s*/, ""));
    else intro.push(line);
  }
  return { intro, blocks };
}

export default function PrivacyPage() {
  const page = usePage("privacy");
  const { data: settings } = useSettings();
  const { intro, blocks } = parse(page.data?.content ?? "");
  const contactIndex = blocks.length + 1;

  return (
    <AppShell title="سياسة الخصوصية">
      <h1 className="hidden text-5xl font-bold md:block">سياسة الخصوصية</h1>
      {page.isPending ? (
        <Spinner />
      ) : (
        <>
          {intro.map((p, i) => (
            <p key={i} className="mt-4 max-w-3xl leading-relaxed text-ink/85">
              {p}
            </p>
          ))}

          <div className="mt-10 grid items-start gap-10 md:grid-cols-[1fr_240px]">
            <div className="space-y-9">
              {blocks.map((b, i) => (
                <section key={b.title} id={`s${i + 1}`} className="scroll-mt-28">
                  <h2 className="text-xl font-bold">
                    <span className="text-brand-300">{i + 1}.</span> {b.title}
                  </h2>
                  <ul className="mt-4 list-disc space-y-2 pr-5 text-sm leading-relaxed text-ink/85">
                    {b.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}

              <section id={`s${contactIndex}`} className="scroll-mt-28 rounded-3xl border border-line bg-surface p-5 md:p-6">
                <h2 className="text-xl font-bold">
                  <span className="text-brand-300">{contactIndex}.</span> التواصل معنا
                </h2>
                <p className="mt-3 text-sm text-ink/85">للاستفسار عن أي بند في هذه السياسة، يمكنك التواصل معنا عبر:</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {settings?.admin_email && (
                    <a href={`mailto:${settings.admin_email}`} className="rounded-2xl bg-surface-2 p-4">
                      <p className="text-xs text-muted">البريد الإلكتروني</p>
                      <p className="ltr mt-1 text-right font-bold">{settings.admin_email}</p>
                    </a>
                  )}
                  {settings?.admin_whatsapp && (
                    <div className="rounded-2xl bg-surface-2 p-4">
                      <p className="text-xs text-muted">واتساب</p>
                      <p className="ltr mt-1 text-right font-bold">{settings.admin_whatsapp}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <nav className="sticky top-28 hidden rounded-2xl border border-line bg-surface p-5 md:block">
              <p className="mb-3 text-xs text-muted">المحتويات</p>
              {[...blocks.map((b) => b.title), "التواصل معنا"].map((t, i) => (
                <a key={t} href={`#s${i + 1}`} className="block py-1.5 text-sm text-ink/85 hover:text-ink">
                  {i + 1}. {t}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </AppShell>
  );
}
