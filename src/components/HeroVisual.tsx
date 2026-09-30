import { ScoreRing } from "./ui";

function Mesh() {
  const pts: [number, number][] = [];
  for (let row = 0; row < 11; row++) {
    const y = 60 + row * 26;
    const half = Math.sin((Math.PI * (row + 0.6)) / 11.5) * 92;
    const n = 5 + Math.round(half / 22);
    for (let i = 0; i < n; i++) pts.push([160 - half + (2 * half * i) / (n - 1), y]);
  }
  return (
    <svg viewBox="0 0 320 400" className="absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="face" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#f6dccf" />
          <stop offset="100%" stopColor="#e2b7a2" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="190" rx="102" ry="134" fill="url(#face)" opacity="0.9" />
      <ellipse cx="160" cy="190" rx="102" ry="134" fill="none" stroke="#fff" strokeOpacity="0.7" strokeDasharray="3 6" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6} fill="#fff" opacity={0.75} />
      ))}
      <path d="M118 170 q14 -10 28 0 M174 170 q14 -10 28 0" stroke="#9C4B38" strokeOpacity="0.45" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M160 190 v28 q-8 4 -2 8" stroke="#9C4B38" strokeOpacity="0.3" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M138 258 q22 14 44 0" stroke="#9C4B38" strokeOpacity="0.5" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="122" cy="224" r="14" fill="#B9614A" opacity="0.18" />
      <circle cx="204" cy="118" r="10" fill="#B9614A" opacity="0.18" />
      <circle cx="122" cy="224" r="20" fill="none" stroke="#B9614A" strokeOpacity="0.6" strokeDasharray="2 3" />
    </svg>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-clay-200/50 via-transparent to-clay-100/60 blur-2xl" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-[#f3e3da] via-[#ecd4c7] to-[#d8b09c] shadow-lift">
        <Mesh />
        <div className="scan-line absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-700 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> HD skin scan
        </div>
      </div>

      <div className="float absolute -left-6 top-24 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-3 pr-5 shadow-lift backdrop-blur sm:-left-10">
        <ScoreRing value={91} size={56} stroke={5} />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Skin score</div>
          <div className="text-sm font-semibold text-ink">Skin age 28</div>
        </div>
      </div>

      <div className="float-delay absolute -right-4 top-10 w-44 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lift backdrop-blur sm:-right-10">
        {[
          ["Hydration", 82, "#d97706"],
          ["Redness", 94, "#059669"],
          ["Pores", 98, "#059669"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="py-1">
            <div className="flex justify-between text-[11px] font-medium text-stone-600">
              <span>{l}</span>
              <span className="text-ink">{v}</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-stone-100">
              <div className="h-full rounded-full" style={{ width: `${v}%`, background: c as string }} />
            </div>
          </div>
        ))}
      </div>

      <div className="float absolute -right-2 bottom-24 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lift backdrop-blur sm:-right-8">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Shade match</div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full border-2 border-white shadow" style={{ background: "#E2BD9A" }} />
          <span className="text-sm font-semibold text-ink">220 Light Sand</span>
        </div>
      </div>

      <div className="float-delay absolute -left-4 bottom-10 max-w-[15rem] rounded-2xl bg-ink p-4 text-white shadow-lift sm:-left-10">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-clay-200">Your coach</div>
        <p className="mt-1 text-sm leading-snug">Skip the glycolic toner this week. Your barrier needs ceramides first.</p>
      </div>
    </div>
  );
}
