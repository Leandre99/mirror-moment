"use client";
import { useState } from "react";
import type { Plan, ProductCheck } from "@/lib/agent";
import type { SkinScan } from "@/lib/concerns";
import { agent } from "@/lib/client";
import { Button, Card, Pill, Spinner } from "./ui";

const EXAMPLES = [
  { label: "Trendy glow toner", text: "Aqua, Glycolic Acid, Alcohol Denat., Witch Hazel, Parfum, Glycerin" },
  { label: "Barrier cream", text: "Aqua, Ceramide NP, Niacinamide, Cholesterol, Squalane, Panthenol" },
  { label: "Coconut body butter", text: "Cocos Nucifera Oil, Shea Butter, Isopropyl Myristate, Fragrance" },
];

export function ShopCheck({ scan, plan }: { scan: SkinScan; plan: Plan }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductCheck | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(text = input) {
    if (!text.trim()) return;
    setInput(text);
    setLoading(true);
    setErr(null);
    try {
      setResult(await agent<ProductCheck>({ action: "check", scan, input: text }));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const tone = result?.verdict === "great" ? "good" : result?.verdict === "skip" ? "focus" : "ok";

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h3 className="font-semibold text-stone-900">Should I buy this?</h3>
        <p className="mt-1 text-sm text-stone-500">Paste an ingredient list or a product name. I&apos;ll check it against today&apos;s scan.</p>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} placeholder="e.g. Aqua, Niacinamide, Salicylic Acid, Fragrance..." className="mt-3 w-full rounded-2xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-rose-300" />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button onClick={() => run()} disabled={loading || !input.trim()}>
            {loading ? <Spinner /> : null} Check it
          </Button>
          {EXAMPLES.map((e) => (
            <button key={e.label} onClick={() => run(e.text)} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600 hover:bg-stone-200">
              {e.label}
            </button>
          ))}
        </div>
        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}
        {result && (
          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2">
              <Pill tone={tone}>{result.verdict.toUpperCase()}</Pill>
              <span className="font-semibold text-stone-900">{result.title}</span>
            </div>
            <p className="mt-2 text-sm text-stone-600">{result.summary}</p>
            {result.helps.length > 0 && (
              <div className="mt-3 text-xs text-emerald-700">
                {result.helps.map((h) => (
                  <div key={h.ingredient}>
                    {"\u2713"} {h.ingredient} → {h.concerns.join(", ")}
                  </div>
                ))}
              </div>
            )}
            {result.cautions.length > 0 && (
              <div className="mt-2 text-xs text-rose-700">
                {result.cautions.map((c, i) => (
                  <div key={i}>
                    ! {c.ingredient}: {c.why}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-900">Picked for your skin</h3>
        <p className="mt-1 text-sm text-stone-500">Ranked by how well each one targets your focus areas, minus anything your skin should avoid today.</p>
        <ul className="mt-3 divide-y divide-stone-100">
          {plan.shortlist.map((s, i) => (
            <li key={s.product.id} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 text-sm font-semibold text-stone-400">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-stone-900">
                    {s.product.brand} {s.product.name}
                  </span>
                  <span className="text-sm text-stone-500">${s.product.price}</span>
                </div>
                <div className="text-xs text-stone-500">{s.reasons.join(" · ") || s.product.blurb}</div>
                {s.warnings.length > 0 && <div className="text-xs text-amber-700">Heads up: {s.warnings.join("; ")}</div>}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
