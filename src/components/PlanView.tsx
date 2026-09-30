"use client";
import type { Plan, RoutineStep } from "@/lib/agent";
import { Card, Pill } from "./ui";

const STEP_LABEL: Record<string, string> = { cleanser: "Cleanse", serum: "Serum", treatment: "Treat", moisturizer: "Moisturize", spf: "Protect", spot: "Spot" };

function Routine({ title, steps, icon }: { title: string; steps: RoutineStep[]; icon: string }) {
  return (
    <Card>
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-stone-900">
        <span>{icon}</span>
        {title}
      </h3>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">{i + 1}</span>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-rose-600">{STEP_LABEL[s.step]}</div>
              <div className="text-sm font-medium text-stone-900">
                {s.product.brand} {s.product.name} <span className="font-normal text-stone-400">${s.product.price}</span>
              </div>
              <div className="text-xs text-stone-500">{s.note ?? s.product.blurb}</div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function PlanView({ plan }: { plan: Plan }) {
  const ids = new Set([...plan.routine.AM, ...plan.routine.PM].map((s) => s.product.id));
  const total = [...plan.routine.AM, ...plan.routine.PM].filter((s, i, a) => a.findIndex((x) => x.product.id === s.product.id) === i).reduce((sum, s) => sum + s.product.price, 0);
  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-rose-50 to-white">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="rose">Your next move</Pill>
          <Pill>{plan.source === "llm" ? "AI coach" : "Rules engine"}</Pill>
          <Pill>Re-scan in {plan.nextScanDays} days</Pill>
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">{plan.headline}</h2>
        <p className="mt-2 max-w-2xl text-stone-600">{plan.summary}</p>
        {plan.coachNote && <p className="mt-3 max-w-2xl border-l-2 border-rose-300 pl-3 text-sm italic text-stone-700">{plan.coachNote}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {plan.priorities.map((p) => (
            <div key={p.key} className="rounded-2xl border border-rose-200 bg-white px-3 py-2">
              <div className="text-xs text-stone-500">Focus</div>
              <div className="text-sm font-semibold text-stone-900">
                {p.label} <span className="font-normal text-rose-600">{p.ui}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {plan.progress && (
        <Card>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900">Since your last scan</h3>
            <Pill tone={plan.progress.verdict === "improving" ? "good" : plan.progress.verdict === "slipping" ? "focus" : "ok"}>{plan.progress.verdict}</Pill>
          </div>
          <p className="mt-1 text-sm text-stone-600">{plan.progress.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.progress.deltas.map((d) => (
              <span key={d.key} className={`rounded-full px-2.5 py-1 text-xs font-medium ${d.delta > 0 ? "bg-emerald-50 text-emerald-700" : d.delta < 0 ? "bg-rose-50 text-rose-700" : "bg-stone-100 text-stone-600"}`}>
                {d.label} {d.delta > 0 ? "+" : ""}
                {d.delta}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Routine title="Morning" icon={"\u2600\uFE0F"} steps={plan.routine.AM} />
        <Routine title="Night" icon={"\u{1F319}"} steps={plan.routine.PM} />
      </div>
      <p className="text-xs text-stone-500">
        Full routine: {ids.size} products, ${total}. Brands are fictional demo items. Plug in any retailer catalog.
      </p>

      {plan.avoid.length > 0 && (
        <Card>
          <h3 className="mb-3 font-semibold text-stone-900">Avoid for now</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {plan.avoid.map((a) => (
              <li key={a.what} className="rounded-2xl bg-stone-50 p-3">
                <div className="text-sm font-medium text-stone-900">{"\u2715"} {a.what}</div>
                <div className="text-xs text-stone-500">{a.why}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
