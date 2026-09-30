"use client";
import { useState } from "react";
import { CONCERNS, scoreBand, type ConcernKey, type SkinScan } from "@/lib/concerns";
import { Card, Pill, ScoreRing } from "./ui";

const BAR = { good: "#059669", ok: "#d97706", focus: "#e11d48" };

export function SkinResults({ scan, image, focus }: { scan: SkinScan; image: string; focus: ConcernKey[] }) {
  const withMask = scan.concerns.filter((c) => c.maskUrl);
  const [active, setActive] = useState<ConcernKey | null>(withMask.find((c) => focus.includes(c.key))?.key ?? withMask[0]?.key ?? null);
  const [opacity, setOpacity] = useState(0.85);
  const activeC = scan.concerns.find((c) => c.key === active);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
      <Card className="p-3">
        <div className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Your selfie" className="block w-full" />
          {activeC?.maskUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeC.maskUrl} alt={`${CONCERNS[activeC.key].label} map`} className="absolute inset-0 h-full w-full object-fill" style={{ opacity }} />
          )}
        </div>
        {withMask.length > 0 ? (
          <div className="mt-3 space-y-2 px-1">
            <div className="flex flex-wrap gap-1.5">
              {withMask.map((c) => (
                <button key={c.key} onClick={() => setActive(active === c.key ? null : c.key)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${active === c.key ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
                  {CONCERNS[c.key].short}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-stone-500">
              Map opacity
              <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="flex-1 accent-rose-600" />
            </label>
          </div>
        ) : (
          <p className="mt-3 px-1 text-xs text-stone-500">{scan.mode === "mock" ? "Demo mode: detection maps appear when a YouCam API key is set." : "No detection maps were returned."}</p>
        )}
      </Card>

      <div className="space-y-5">
        <Card className="flex flex-wrap items-center gap-6">
          <ScoreRing value={scan.overall} size={104} label="overall" />
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <Pill>{scan.skinType} skin{scan.skinTypeSource === "derived" ? " (estimated)" : ""}</Pill>
              {scan.skinAge ? <Pill>Skin age ~{scan.skinAge}</Pill> : null}
              <Pill>{scan.quality} analysis</Pill>
              {scan.mode === "mock" && <Pill tone="ok">Demo data</Pill>}
            </div>
            <p className="max-w-md text-sm text-stone-600">Scores run from 1 to 100, and higher means healthier skin. Pink cards are what your plan focuses on.</p>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {scan.concerns.map((c) => {
            const band = scoreBand(c.ui);
            const isFocus = focus.includes(c.key);
            return (
              <button key={c.key} onClick={() => c.maskUrl && setActive(c.key)} className={`rounded-2xl border p-3 text-left transition ${isFocus ? "border-rose-200 bg-rose-50/70" : "border-stone-200 bg-white/80"} ${active === c.key ? "ring-2 ring-stone-900" : ""}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium text-stone-800">{CONCERNS[c.key].label}</span>
                  <Pill tone={band.tone}>{band.label}</Pill>
                </div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-2xl font-semibold text-stone-900">{c.ui}</span>
                  <span className="mb-1 text-xs text-stone-400">/100</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full" style={{ width: `${c.ui}%`, background: BAR[band.tone] }} />
                </div>
                {c.regions && c.regions.length > 0 && <div className="mt-2 text-[11px] text-stone-500">{c.regions.map((r) => `${r.region} ${r.ui}`).join(" · ")}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
