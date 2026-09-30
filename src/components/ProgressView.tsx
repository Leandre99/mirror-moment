"use client";
import { CONCERNS, type ConcernKey, type SkinScan } from "@/lib/concerns";
import { Card, Pill } from "./ui";

export function ProgressView({ history, focus, onClear }: { history: SkinScan[]; focus: ConcernKey[]; onClear: () => void }) {
  const sorted = [...history].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const keys: ConcernKey[] = focus.length ? focus : (["acne", "redness", "moisture"] as ConcernKey[]);
  const W = 560;
  const H = 180;
  const x = (i: number) => (sorted.length === 1 ? W / 2 : 30 + (i * (W - 60)) / (sorted.length - 1));
  const y = (v: number) => H - 20 - ((v - 30) / 70) * (H - 40);
  const colors = ["#e11d48", "#d97706", "#0891b2", "#7c3aed"];

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-900">Your skin over time</h3>
          {history.length > 0 && (
            <button onClick={onClear} className="text-xs text-stone-400 hover:text-rose-600">
              Clear history
            </button>
          )}
        </div>
        {sorted.length < 2 ? (
          <p className="mt-2 text-sm text-stone-500">You have {sorted.length} scan{sorted.length === 1 ? "" : "s"}. Scan again in 1-2 weeks, same spot and lighting, and your trend will show here.</p>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
            {[40, 60, 80, 100].map((v) => (
              <g key={v}>
                <line x1={20} x2={W - 10} y1={y(v)} y2={y(v)} stroke="#f5f5f4" />
                <text x={0} y={y(v) + 3} fontSize={9} fill="#a8a29e">
                  {v}
                </text>
              </g>
            ))}
            {keys.map((k, ki) => {
              const pts = sorted.map((s, i) => [x(i), y(s.concerns.find((c) => c.key === k)?.ui ?? 0)] as const);
              return (
                <g key={k}>
                  <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={colors[ki]} strokeWidth={2.5} strokeLinecap="round" />
                  {pts.map((p, i) => (
                    <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={colors[ki]} />
                  ))}
                </g>
              );
            })}
          </svg>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {keys.map((k, i) => (
            <span key={k} className="flex items-center gap-1.5 text-stone-600">
              <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
              {CONCERNS[k].label}
            </span>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...sorted].reverse().map((s) => (
          <Card key={s.id} className="p-3">
            {s.thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.thumb} alt="" className="aspect-square w-full rounded-xl object-cover" />
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-stone-500">{new Date(s.createdAt).toLocaleDateString()}</span>
              <Pill>{s.overall}</Pill>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
