"use client";
import { useEffect, useState } from "react";
import type { Plan } from "@/lib/agent";
import { MOMENTS, type Moment, type SkinScan } from "@/lib/concerns";
import { agent, clearHistory, estimateSkinHex, loadHistory, prepareImage, runTask, saveScan, uploadImage, type Prepared } from "@/lib/client";
import { MomentPicker } from "@/components/MomentPicker";
import { Capture } from "@/components/Capture";
import { SkinResults } from "@/components/SkinResults";
import { PlanView } from "@/components/PlanView";
import { ShopCheck } from "@/components/ShopCheck";
import { CoachChat } from "@/components/CoachChat";
import { ShadeStudio, type ToneResult } from "@/components/ShadeStudio";
import { ProgressView } from "@/components/ProgressView";
import { Button, Card, Pill, Spinner } from "@/components/ui";

type Stage = "moment" | "capture" | "analyzing" | "results";
type Tab = "plan" | "skin" | "shop" | "shade" | "progress";
const TABS: { id: Tab; label: string }[] = [
  { id: "plan", label: "Next steps" },
  { id: "skin", label: "Skin map" },
  { id: "shop", label: "Shop smart" },
  { id: "shade", label: "Shade match" },
  { id: "progress", label: "Progress" },
];

const STEPS = ["Uploading your selfie", "Running YouCam HD Skin Analysis", "Mapping 12 skin concerns", "Building your plan"];

export default function Home() {
  const [status, setStatus] = useState<{ youcam: string; llm: boolean } | null>(null);
  const [stage, setStage] = useState<Stage>("moment");
  const [moment, setMoment] = useState<Moment>("checkin");
  const [img, setImg] = useState<Prepared | null>(null);
  const [fileId, setFileId] = useState("");
  const [scan, setScan] = useState<SkinScan | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [history, setHistory] = useState<SkinScan[]>([]);
  const [tab, setTab] = useState<Tab>("plan");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<ToneResult | null>(null);
  const [toneError, setToneError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => {});
  }, []);

  async function analyze(src: string) {
    setStage("analyzing");
    setError(null);
    setStep(0);
    setTone(null);
    setToneError(null);
    try {
      const p = await prepareImage(src);
      setImg(p);
      const up = await uploadImage(p.blob);
      setFileId(up.fileId);
      setStep(1);
      const quality = Math.min(p.width, p.height) >= 1080 ? "HD" : "SD";
      runTask<{ color: ToneResult }>("skin-tone-analysis", { fileId: up.fileId })
        .then((r) => setTone(r.color))
        .catch(async (e) => {
          setToneError((e as Error).message);
          try {
            setTone({ skin_color: await estimateSkinHex(p.dataUrl), estimated: true });
          } catch {}
        });
      const r = await runTask<{ skin: Omit<SkinScan, "id" | "createdAt" | "moment" | "mode" | "quality" | "thumb"> }>("skin-analysis", { fileId: up.fileId, quality }, (n) => n === 1 && setStep(2));
      setStep(3);
      const s: SkinScan = { ...r.skin, id: crypto.randomUUID(), createdAt: new Date().toISOString(), moment, mode: up.mode, quality, thumb: p.thumb };
      const prior = loadHistory();
      const pl = await agent<Plan>({ action: "plan", scan: s, history: prior });
      setHistory(saveScan(s));
      setScan(s);
      setPlan(pl);
      setTab(moment === "buying" ? "shop" : "plan");
      setStage("results");
    } catch (e) {
      setError((e as Error).message);
      setStage("capture");
    }
  }

  function restart() {
    setStage("moment");
    setScan(null);
    setPlan(null);
    setImg(null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <header className="flex items-center justify-between">
        <button onClick={restart} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-lg text-white">{"\u25D0"}</span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">Mirror Moment</span>
        </button>
        <div className="flex items-center gap-2">
          {status && <Pill tone={status.youcam === "live" ? "good" : "ok"}>YouCam {status.youcam === "live" ? "live" : "demo mode"}</Pill>}
          {status && <Pill>{status.llm ? "LLM agent on" : "Rules agent"}</Pill>}
        </div>
      </header>

      {stage === "moment" && (
        <section className="mx-auto mt-14 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-rose-600">AI skin coach</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">What&apos;s happening in the mirror right now?</h1>
          <p className="mt-3 max-w-xl text-lg text-stone-600">One selfie. YouCam&apos;s HD Skin AI reads 12 skin concerns, then your coach tells you exactly what to do next, what to buy and what to skip.</p>
          <div className="mt-8">
            <MomentPicker
              hasHistory={history.length > 0}
              onPick={(m) => {
                setMoment(m);
                setStage("capture");
              }}
            />
          </div>
          {history.length > 0 && (
            <p className="mt-6 text-sm text-stone-500">
              {history.length} past scan{history.length > 1 ? "s" : ""} saved on this device. Last one: {new Date(history[0].createdAt).toLocaleDateString()}.
            </p>
          )}
        </section>
      )}

      {stage === "capture" && (
        <section className="mx-auto mt-10 max-w-xl text-center">
          <Pill tone="rose">{MOMENTS[moment].title}</Pill>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">Take a quick selfie</h2>
          <p className="mb-6 mt-2 text-stone-500">For HD analysis, use a sharp, well-lit photo where your face fills the frame.</p>
          {error && <Card className="mb-4 border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</Card>}
          <Capture onImage={analyze} />
          <Button variant="ghost" onClick={() => setStage("moment")} className="mt-4">
            {"\u2190"} Back
          </Button>
        </section>
      )}

      {stage === "analyzing" && (
        <section className="mx-auto mt-14 flex max-w-md flex-col items-center text-center">
          <div className="relative w-56 overflow-hidden rounded-[2rem] border border-stone-200">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.dataUrl} alt="" className="w-full" />
            ) : (
              <div className="aspect-[3/4] bg-stone-100" />
            )}
            <div className="scan-line absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-rose-400/40 to-transparent" />
          </div>
          <ul className="mt-8 space-y-2 text-left">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 text-sm ${i < step ? "text-stone-400" : i === step ? "font-medium text-stone-900" : "text-stone-300"}`}>
                {i < step ? "\u2713" : i === step ? <Spinner /> : "\u25CB"} {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {stage === "results" && scan && plan && img && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex flex-wrap gap-1 rounded-full border border-stone-200 bg-white/70 p-1">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
                  {t.label}
                </button>
              ))}
            </nav>
            <Button variant="outline" onClick={restart}>
              New scan
            </Button>
          </div>
          <div className="mt-6">
            {tab === "plan" && (
              <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <PlanView plan={plan} />
                <div className="xl:sticky xl:top-6 xl:self-start">
                  <CoachChat scan={scan} history={history} />
                </div>
              </div>
            )}
            {tab === "skin" && <SkinResults scan={scan} image={img.dataUrl} focus={plan.priorities.map((p) => p.key)} />}
            {tab === "shop" && <ShopCheck scan={scan} plan={plan} />}
            {tab === "shade" && <ShadeStudio scan={scan} image={img.dataUrl} fileId={fileId} tone={tone} toneError={toneError} />}
            {tab === "progress" && (
              <ProgressView
                history={history}
                focus={plan.priorities.map((p) => p.key)}
                onClear={() => {
                  clearHistory();
                  setHistory([]);
                }}
              />
            )}
          </div>
          <p className="mt-10 text-center text-xs text-stone-400">Cosmetic guidance, not medical advice. For painful, cystic or long-lasting acne, see a dermatologist.</p>
        </section>
      )}
    </main>
  );
}
