"use client";
import { useMemo, useState } from "react";
import type { SkinScan } from "@/lib/concerns";
import { buildMakeupEffects, coverageFromScan, matchFoundation, suggestLips } from "@/lib/color";
import { runTask } from "@/lib/client";
import { Button, Card, Pill, Spinner } from "./ui";

export type ToneResult = { estimated?: boolean; skin_color: string; lip_color?: string; eye_color_name?: string; hair_color_name?: string };

export function ShadeStudio({ scan, image, fileId, tone, toneError }: { scan: SkinScan; image: string; fileId: string; tone: ToneResult | null; toneError: string | null }) {
  const match = useMemo(() => (tone ? matchFoundation(tone.skin_color) : null), [tone]);
  const lips = useMemo(() => (tone ? suggestLips(tone.skin_color) : []), [tone]);
  const cov = useMemo(() => coverageFromScan(scan), [scan]);
  const [shade, setShade] = useState<string | null>(null);
  const [lip, setLip] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [demoNote, setDemoNote] = useState(false);

  const shadeHex = shade ?? match?.best.hex;

  async function tryOn() {
    if (!shadeHex) return;
    setLoading(true);
    setErr(null);
    try {
      const effects = buildMakeupEffects({ foundationHex: shadeHex, coverage: cov.coverage, glow: cov.glow, concealer: cov.concealer, lipHex: lip ?? undefined });
      const r = await runTask<{ url: string | null }>("makeup-vto", { fileId, effects });
      setResult(r.url);
      setDemoNote(!r.url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!tone) {
    return (
      <Card className="text-center text-sm text-stone-500">
        {toneError ? <span className="text-rose-600">Tone analysis failed: {toneError}</span> : (
          <span className="inline-flex items-center gap-2">
            <Spinner /> Reading your skin tone...
          </span>
        )}
      </Card>
    );
  }

  const all = match ? [match.best, ...match.alternatives] : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
      <Card className="p-3">
        <div className="grid grid-cols-2 gap-2">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Before" className="w-full rounded-2xl" />
            <figcaption className="mt-1 text-center text-xs text-stone-500">Before</figcaption>
          </figure>
          <figure>
            {result ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result} alt="Try-on result" className="w-full rounded-2xl" />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-stone-100 p-3 text-center text-xs text-stone-500">
                {loading ? <Spinner /> : demoNote ? "Demo mode: the YouCam Makeup VTO result shows here when an API key is set." : "Your try-on will show here"}
              </div>
            )}
            <figcaption className="mt-1 text-center text-xs text-stone-500">With your match</figcaption>
          </figure>
        </div>
      </Card>

      <div className="space-y-5">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-10 w-10 rounded-full border border-white shadow" style={{ background: tone.skin_color }} />
            <div>
              <div className="text-sm font-semibold text-stone-900">Your skin tone {tone.skin_color}</div>
              {tone.estimated && <div className="text-xs text-amber-700">Estimated from your photo{toneError ? ` (YouCam tone analysis unavailable: ${toneError})` : ""}</div>}
              <div className="text-xs text-stone-500">
                {match?.undertone} undertone{tone.eye_color_name ? ` · ${tone.eye_color_name} eyes` : ""}
                {tone.hair_color_name ? ` · ${tone.hair_color_name} hair` : ""}
              </div>
            </div>
          </div>
          <h4 className="mt-4 text-sm font-semibold text-stone-900">Foundation match</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {all.map((s, i) => (
              <button key={s.name} onClick={() => setShade(s.hex)} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${shadeHex === s.hex ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700"}`}>
                <span className="h-4 w-4 rounded-full border border-white/60" style={{ background: s.hex }} />
                {s.name}
                {i === 0 && <Pill tone="good">best</Pill>}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-rose-50/70 p-3 text-xs text-stone-700">
            <span className="font-semibold">Formula from your skin scan:</span> {cov.reason} (coverage {cov.coverage}, glow {cov.glow}).
          </div>
          <h4 className="mt-4 text-sm font-semibold text-stone-900">Add a lip (optional)</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {lips.map((l) => (
              <button key={l.name} onClick={() => setLip(lip === l.hex ? null : l.hex)} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${lip === l.hex ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700"}`}>
                <span className="h-4 w-4 rounded-full" style={{ background: l.hex }} />
                {l.name}
              </button>
            ))}
          </div>
          <Button onClick={tryOn} disabled={loading} className="mt-5">
            {loading ? <Spinner /> : null} Try it on my face
          </Button>
          {err && <p className="mt-2 text-sm text-rose-600">{err}</p>}
        </Card>
      </div>
    </div>
  );
}
