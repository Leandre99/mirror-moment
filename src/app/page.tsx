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
import { HeroVisual } from "@/components/HeroVisual";
import { ArrowIcon, BagIcon, CameraIcon, ChartIcon, ChatIcon, CheckIcon, MirrorIcon, PaletteIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { Button, Card, Pill, ScoreRing, SectionTitle, Spinner } from "@/components/ui";

type Stage = "moment" | "capture" | "analyzing" | "results";
type Tab = "plan" | "skin" | "shop" | "shade" | "progress";
const TABS: { id: Tab; label: string }[] = [
  { id: "plan", label: "Next steps" },
  { id: "skin", label: "Skin map" },
  { id: "shop", label: "Shop smart" },
  { id: "shade", label: "Shade match" },
  { id: "progress", label: "Progress" },
];

const STEPS = ["Uploading your selfie securely", "Running YouCam HD Skin Analysis", "Mapping 12 skin concerns", "Your coach is building the plan"];

const TIPS = [
  { t: "Even, natural light", d: "Face a window. Avoid harsh overhead light and backlight." },
  { t: "Bare skin", d: "No makeup or filters, so every concern is read accurately." },
  { t: "Straight on", d: "Look into the camera, hair pulled back from your forehead." },
  { t: "Fill the frame", d: "Sharp photo, face centered. 1080px+ unlocks HD analysis." },
];

const FEATURES = [
  { icon: MirrorIcon, title: "Skin map", body: "HD analysis of 12 concerns with detection overlays drawn right on your face." },
  { icon: SparkIcon, title: "Agentic coach", body: "Turns scores and your moment into a verdict, an AM/PM routine and what to avoid." },
  { icon: BagIcon, title: "Shop smart", body: "Paste any ingredient list and get buy, okay or skip for your skin today." },
  { icon: PaletteIcon, title: "Shade match", body: "Skin tone analysis picks your foundation, and virtual try-on puts it on your selfie." },
  { icon: ChartIcon, title: "Progress", body: "Rescan in two weeks and see if your routine is actually working." },
  { icon: ChatIcon, title: "Ask anything", body: "\u201cCan I use retinol right now?\u201d answered with your scan in context." },
];

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

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

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

  const start = () => document.getElementById("start")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="bg-grain min-h-screen">
      <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button onClick={restart} className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink">
              <span className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-b from-clay-300 to-clay-500" />
            </span>
            <span className="font-display text-xl font-medium tracking-tight text-ink">Mirror Moment</span>
          </button>
          {stage === "moment" && (
            <nav className="hidden items-center gap-8 text-sm text-stone-600 md:flex">
              <a href="#how" className="hover:text-ink">How it works</a>
              <a href="#features" className="hover:text-ink">Features</a>
              <a href="#start" className="hover:text-ink">Start</a>
            </nav>
          )}
          <div className="flex items-center gap-2">
            {status && (
              <span className="hidden items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 sm:inline-flex">
                <span className={`h-1.5 w-1.5 rounded-full ${status.youcam === "live" ? "bg-emerald-500" : "bg-amber-500"}`} />
                YouCam {status.youcam === "live" ? "live" : "demo"}
                <span className="text-stone-300">|</span>
                {status.llm ? "LLM agent" : "Rules agent"}
              </span>
            )}
            {stage === "moment" ? (
              <Button onClick={start} className="!px-4 !py-2">
                Start scan
              </Button>
            ) : stage === "results" ? (
              <Button variant="outline" onClick={restart} className="!px-4 !py-2">
                New scan
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      {stage === "moment" && (
        <main>
          <section className="mx-auto grid max-w-6xl items-center gap-16 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
            <div className="fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/70 px-3 py-1 text-xs font-medium text-clay-700">
                <SparkIcon className="h-3.5 w-3.5" /> Powered by YouCam AI Skin Analysis
              </span>
              <h1 className="mt-6 text-5xl font-medium leading-[1.05] text-ink sm:text-6xl">
                Know exactly what your skin needs, <em className="font-normal text-clay-600">right now.</em>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">
                One selfie. Clinical-grade AI reads 12 skin concerns in seconds, then your personal coach tells you what to do next, what to buy, and what to skip.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="accent" onClick={start} className="!px-7 !py-3.5 !text-base">
                  Start my free skin scan <ArrowIcon />
                </Button>
                <a href="#how" className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-medium text-stone-700 hover:bg-white/60">
                  See how it works
                </a>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500">
                {["No sign-up", "Results in ~10 seconds", "History stays on your device"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 text-clay-500" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="fade-up px-6 [animation-delay:150ms] sm:px-10">
              <HeroVisual />
            </div>
          </section>

          <section className="border-y border-stone-200/70 bg-white/60">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4">
              {[
                ["12", "skin concerns analyzed"],
                ["HD", "pixel-level detection maps"],
                ["3", "YouCam AI APIs in one flow"],
                ["1", "clear next step, every time"],
              ].map(([n, l]) => (
                <div key={l} className="text-center md:text-left">
                  <div className="font-display text-3xl font-medium text-ink">{n}</div>
                  <div className="mt-1 text-sm text-stone-500">{l}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
            <SectionTitle center eyebrow="How it works" title="From mirror to plan in under a minute" sub="Built for the moments you actually wonder about your skin: after a breakout, before a purchase, or when you're unsure a product is working." />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                { icon: MirrorIcon, t: "Pick your moment", d: "Tell us why you're at the mirror. Your plan adapts to it." },
                { icon: CameraIcon, t: "Take one selfie", d: "YouCam HD Skin AI maps acne, redness, pores, hydration and 8 more." },
                { icon: SparkIcon, t: "Get your next move", d: "A focused routine, products ranked for you, and shades you can try on." },
              ].map((s, i) => (
                <Card key={s.t} className="relative !p-7">
                  <span className="absolute right-6 top-5 font-display text-5xl font-medium text-stone-100">0{i + 1}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-clay-50 text-clay-600">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.d}</p>
                </Card>
              ))}
            </div>
          </section>

          <section id="start" className="scroll-mt-16 bg-white/70 py-24">
            <div className="mx-auto max-w-4xl px-5 sm:px-8">
              <SectionTitle center eyebrow="Start here" title="What brings you to the mirror?" sub="Choose the moment you're in. It shapes what your coach prioritizes." />
              <div className="mt-12">
                <MomentPicker
                  hasHistory={history.length > 0}
                  onPick={(m) => {
                    setMoment(m);
                    setStage("capture");
                  }}
                />
              </div>
              {history.length > 0 && (
                <p className="mt-6 text-center text-sm text-stone-500">
                  {history.length} past scan{history.length > 1 ? "s" : ""} saved on this device. Last one: {new Date(history[0].createdAt).toLocaleDateString()}.
                </p>
              )}
            </div>
          </section>

          <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
            <SectionTitle eyebrow="Everything in one flow" title="More than a score. A decision." sub="Skin analysis, an agentic coach, ingredient checks and virtual try-on, working together." />
            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-stone-200/70 bg-stone-200/70 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white p-7 transition hover:bg-clay-50/40">
                  <f.icon className="h-6 w-6 text-clay-600" />
                  <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-14 text-center sm:px-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-clay-500/30 blur-3xl" />
              <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-clay-300/20 blur-3xl" />
              <h2 className="relative text-3xl font-medium text-white sm:text-4xl">Your mirror moment starts now.</h2>
              <p className="relative mx-auto mt-3 max-w-md text-stone-300">One selfie, a clear answer, and a plan you can follow tonight.</p>
              <Button variant="accent" onClick={start} className="relative mt-8 !px-7 !py-3.5 !text-base">
                Scan my skin <ArrowIcon />
              </Button>
            </div>
          </section>

          <footer className="border-t border-stone-200/70">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-stone-500 sm:flex-row sm:px-8">
              <span className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" /> Built with YouCam AI: Skin Analysis, Skin Tone Analysis, Makeup Virtual Try-On
              </span>
              <span>Cosmetic guidance, not medical advice.</span>
            </div>
          </footer>
        </main>
      )}

      {stage === "capture" && (
        <main className="mx-auto grid max-w-5xl items-start gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:py-16">
          <div className="fade-up">
            <Capture onImage={analyze} />
          </div>
          <div className="fade-up lg:pt-6">
            <Pill tone="focus">{MOMENTS[moment].title}</Pill>
            <h1 className="mt-4 text-4xl font-medium text-ink">Take a quick selfie</h1>
            <p className="mt-3 text-stone-600">A few seconds of prep gets you a much more accurate read.</p>
            {error && <div className="mt-6 rounded-2xl border border-clay-200 bg-clay-50 p-4 text-sm text-clay-800">{error}</div>}
            <ul className="mt-8 space-y-5">
              {TIPS.map((t, i) => (
                <li key={t.t} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-clay-200 bg-white font-display text-sm text-clay-600">{i + 1}</span>
                  <div>
                    <div className="font-medium text-ink">{t.t}</div>
                    <div className="text-sm text-stone-500">{t.d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 flex items-center gap-2 text-xs text-stone-500">
              <ShieldIcon className="h-4 w-4" /> Your photo is only sent to YouCam for analysis. Scan history stays in this browser.
            </p>
            <Button variant="ghost" onClick={() => setStage("moment")} className="mt-4 -ml-4">
              {"\u2190"} Choose a different moment
            </Button>
          </div>
        </main>
      )}

      {stage === "analyzing" && (
        <main className="mx-auto flex max-w-lg flex-col items-center px-5 py-16 text-center">
          <div className="relative w-64 overflow-hidden rounded-[2.5rem] border-4 border-white shadow-lift">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.dataUrl} alt="" className="w-full" />
            ) : (
              <div className="aspect-[3/4] bg-clay-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
            <div className="scan-line absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-clay-300/60 to-transparent" />
          </div>
          <h1 className="mt-10 text-3xl font-medium text-ink">Reading your skin</h1>
          <p className="mt-2 text-sm text-stone-500">This usually takes 10 to 20 seconds.</p>
          <Card className="mt-8 w-full !p-5 text-left">
            <ul className="space-y-3">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-sm ${i < step ? "text-stone-400" : i === step ? "font-medium text-ink" : "text-stone-300"}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${i < step ? "bg-emerald-50 text-emerald-600" : i === step ? "bg-clay-50 text-clay-600" : "bg-stone-50"}`}>
                    {i < step ? <CheckIcon className="h-3.5 w-3.5" /> : i === step ? <Spinner /> : null}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </main>
      )}

      {stage === "results" && scan && plan && img && (
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <div className="fade-up relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-lift sm:p-8">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-clay-500/30 blur-3xl" />
            <div className="relative flex flex-wrap items-center gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.thumb} alt="" className="h-20 w-20 rounded-2xl border-2 border-white/20 object-cover" />
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-200">{MOMENTS[moment].title}</div>
                <h1 className="mt-1 text-3xl font-medium sm:text-4xl">{plan.headline}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1">{scan.skinType} skin</span>
                  {scan.skinAge ? <span className="rounded-full bg-white/10 px-3 py-1">Skin age ~{scan.skinAge}</span> : null}
                  <span className="rounded-full bg-white/10 px-3 py-1">{scan.quality} analysis</span>
                  {scan.mode === "mock" && <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-200">Demo data</span>}
                </div>
              </div>
              <div className="rounded-full bg-white p-1.5">
                <ScoreRing value={scan.overall} size={96} label="score" />
              </div>
            </div>
          </div>

          <nav className="sticky top-16 z-20 -mx-5 mt-6 overflow-x-auto bg-cream/80 px-5 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
            <div className="inline-flex gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-soft">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${tab === t.id ? "bg-ink text-white shadow" : "text-stone-600 hover:text-ink"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </nav>

          <div key={tab} className="fade-up mt-4">
            {tab === "plan" && (
              <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <PlanView plan={plan} />
                <div className="xl:sticky xl:top-36 xl:self-start">
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
          <p className="mt-12 text-center text-xs text-stone-400">Cosmetic guidance, not medical advice. For painful, cystic or long-lasting acne, see a dermatologist.</p>
        </main>
      )}
    </div>
  );
}
