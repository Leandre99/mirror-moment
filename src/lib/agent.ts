import { CONCERNS, type ConcernKey, type Moment, type SkinScan, type SkinType } from "./concerns";
import { INGREDIENTS, PRODUCTS, matchIngredients, type Product, type Step } from "./catalog";

const MOMENT_WEIGHTS: Record<Moment, Partial<Record<ConcernKey, number>>> = {
  breakout: { acne: 1.8, redness: 1.5, oiliness: 1.2, texture: 1.1, pore: 1.1 },
  buying: {},
  working: {},
  checkin: {},
};

export type Priority = { key: ConcernKey; label: string; ui: number; severity: number; why: string };
export type ScoredProduct = { product: Product; score: number; reasons: string[]; warnings: string[] };
export type RoutineStep = { step: Step; product: Product; note?: string };
export type ProgressReport = {
  days: number;
  overallDelta: number;
  deltas: { key: ConcernKey; label: string; before: number; after: number; delta: number }[];
  verdict: "improving" | "steady" | "slipping";
  message: string;
};
export type Plan = {
  headline: string;
  summary: string;
  priorities: Priority[];
  routine: { AM: RoutineStep[]; PM: RoutineStep[] };
  avoid: { what: string; why: string }[];
  shortlist: ScoredProduct[];
  nextScanDays: number;
  progress?: ProgressReport;
  coachNote?: string;
  source: "rules" | "llm";
};

type Ctx = { scan: SkinScan; sev: Record<ConcernKey, number>; weights: Partial<Record<ConcernKey, number>>; priorities: Priority[] };

function context(scan: SkinScan): Ctx {
  const sev = {} as Record<ConcernKey, number>;
  for (const c of scan.concerns) sev[c.key] = Math.max(0, 100 - c.raw);
  const weights = MOMENT_WEIGHTS[scan.moment];
  const ranked = scan.concerns
    .map((c) => ({ c, w: sev[c.key] * (weights[c.key] ?? 1) }))
    .sort((a, b) => b.w - a.w);
  let top = ranked.filter((r) => r.c.raw < 75).slice(0, 3);
  if (!top.length) top = ranked.slice(0, 1);
  const priorities = top.map(({ c }) => ({
    key: c.key,
    label: CONCERNS[c.key].label,
    ui: c.ui,
    severity: Math.round(sev[c.key]),
    why: CONCERNS[c.key].explain,
  }));
  return { scan, sev, weights, priorities };
}

const has = (p: Product, ing: string) => p.ingredients.includes(ing);
const isActive = (ing: string) => INGREDIENTS[ing]?.active;

function isRed(ctx: Ctx) {
  return (ctx.sev.redness ?? 0) > 45 || ctx.scan.skinType === "Sensitive";
}

export function ingredientIssues(ings: string[], ctx: Ctx) {
  const out: { ingredient: string; why: string }[] = [];
  for (const ing of ings) {
    for (const c of INGREDIENTS[ing]?.caution ?? []) {
      const applies =
        c.when === ctx.scan.skinType ||
        (c.when in CONCERNS && (ctx.sev[c.when as ConcernKey] ?? 0) > 40);
      if (applies) out.push({ ingredient: ing, why: c.why });
    }
  }
  return out;
}

function scoreProduct(p: Product, ctx: Ctx): ScoredProduct {
  let score = 0;
  const reasons: string[] = [];
  const prioKeys = new Set(ctx.priorities.map((x) => x.key));
  for (const [k, w] of Object.entries(p.targets) as [ConcernKey, number][]) {
    const s = (ctx.sev[k] ?? 0) / 100;
    const boost = (ctx.weights[k] ?? 1) * (prioKeys.has(k) ? 1.6 : 1);
    score += w * s * boost * 3;
    if (prioKeys.has(k) && w >= 0.5) reasons.push(`targets your ${CONCERNS[k].label.toLowerCase()}`);
  }
  if (p.skinTypes.includes(ctx.scan.skinType)) {
    score += 0.5;
    reasons.push(`suits ${ctx.scan.skinType.toLowerCase()} skin`);
  } else score -= 0.7;
  const issues = ingredientIssues(p.ingredients, ctx);
  score -= issues.length * 0.9;
  if (isRed(ctx) && p.ingredients.some((i) => isActive(i) === "retinoid" || (isActive(i) === "acid" && i !== "salicylic acid"))) score -= 1.2;
  if (ctx.scan.moment === "breakout" && isRed(ctx) && has(p, "salicylic acid") && p.step === "treatment") score -= 0.6;
  return { product: p, score, reasons: Array.from(new Set(reasons)).slice(0, 3), warnings: issues.map((i) => `${i.ingredient}: ${i.why}`) };
}

function best(ctx: Ctx, step: Step, when: "AM" | "PM", exclude: Set<string> = new Set()) {
  return PRODUCTS.filter((p) => p.step === step && p.when.includes(when) && !exclude.has(p.id))
    .map((p) => scoreProduct(p, ctx))
    .sort((a, b) => b.score - a.score)[0];
}

function buildRoutine(ctx: Ctx) {
  const AM: RoutineStep[] = [];
  const PM: RoutineStep[] = [];
  const prio = new Set(ctx.priorities.map((p) => p.key));

  const amClean = best(ctx, "cleanser", "AM")!;
  AM.push({ step: "cleanser", product: amClean.product });
  const amSerum = best(ctx, "serum", "AM", new Set(["s6"]));
  if (amSerum) AM.push({ step: "serum", product: amSerum.product });
  if (prio.has("eye_bag") || prio.has("dark_circle")) AM.push({ step: "serum", product: PRODUCTS.find((p) => p.id === "s6")!, note: "Tap it around your eyes." });
  const amMoist = best(ctx, "moisturizer", "AM")!;
  AM.push({ step: "moisturizer", product: amMoist.product });
  AM.push({ step: "spf", product: best(ctx, "spf", "AM")!.product, note: "Use every day. Without SPF, dark spots and marks get darker." });

  const pmClean = best(ctx, "cleanser", "PM")!;
  PM.push({ step: "cleanser", product: pmClean.product });
  const treat = best(ctx, "treatment", "PM");
  if (treat && treat.score > 0.8) {
    const retinoid = treat.product.ingredients.some((i) => isActive(i) === "retinoid");
    PM.push({ step: "treatment", product: treat.product, note: retinoid ? "Start 2-3 nights a week, then build up." : "Start every other night." });
  }
  const pmSerum = best(ctx, "serum", "PM", new Set(["s6", amSerum?.product.id ?? ""]));
  if (pmSerum && pmSerum.score > 0.6) PM.push({ step: "serum", product: pmSerum.product });
  PM.push({ step: "moisturizer", product: best(ctx, "moisturizer", "PM")!.product });
  if (prio.has("acne")) PM.push({ step: "spot", product: PRODUCTS.find((p) => p.id === "p1")!, note: "Only on active spots." });
  return { AM, PM };
}

function buildAvoid(ctx: Ctx) {
  const a: { what: string; why: string }[] = [];
  const s = ctx.sev;
  if ((s.acne ?? 0) > 35 || ctx.scan.moment === "breakout") {
    a.push({ what: "Picking or harsh scrubs", why: "Spreads bacteria and leaves marks that take weeks to fade." });
    a.push({ what: "Coconut oil and heavy butters", why: "Clog pores on breakout-prone skin." });
  }
  if (isRed(ctx)) {
    a.push({ what: "Fragrance and essential oils", why: "Among the most common triggers for redness." });
    a.push({ what: "Stacking strong acids with retinoids", why: "Too much at once weakens your skin barrier." });
  }
  if ((s.moisture ?? 0) > 45) a.push({ what: "Drying alcohol (alcohol denat.)", why: "Pulls water out of already dehydrated skin." });
  if ((s.oiliness ?? 0) > 45) a.push({ what: "Skipping moisturizer", why: "Dehydrated skin can make even more oil." });
  if ((s.age_spot ?? 0) > 35) a.push({ what: "Going out without SPF", why: "UV makes dark spots and post-acne marks darker." });
  return a.slice(0, 4);
}

export function compareScans(prev: SkinScan, curr: SkinScan, focus: ConcernKey[]): ProgressReport {
  const days = Math.max(0, Math.round((+new Date(curr.createdAt) - +new Date(prev.createdAt)) / 86400000));
  const deltas = curr.concerns
    .map((c) => {
      const b = prev.concerns.find((p) => p.key === c.key);
      return b ? { key: c.key, label: CONCERNS[c.key].label, before: b.ui, after: c.ui, delta: c.ui - b.ui } : null;
    })
    .filter(Boolean) as ProgressReport["deltas"];
  const focusDeltas = deltas.filter((d) => focus.includes(d.key));
  const pool = focusDeltas.length ? focusDeltas : deltas;
  const avg = pool.reduce((s, d) => s + d.delta, 0) / Math.max(1, pool.length);
  const verdict = avg >= 2 ? "improving" : avg <= -2 ? "slipping" : "steady";
  const best = [...deltas].sort((a, b) => b.delta - a.delta)[0];
  const worst = [...deltas].sort((a, b) => a.delta - b.delta)[0];
  const message =
    verdict === "improving"
      ? `Yes, it's working. ${best ? `${best.label} is up ${best.delta} points` : "Your focus areas are up"} in ${days || "under 1"} day${days === 1 ? "" : "s"}. Keep going.`
      : verdict === "slipping"
        ? `Not yet. ${worst ? `${worst.label} dropped ${Math.abs(worst.delta)} points.` : ""} If you started something new in the last 2 weeks, it may be irritating you. Go back to the basics below.`
        : days < 14
          ? `Too early to tell (${days} day${days === 1 ? "" : "s"}). Most actives take 4-8 weeks. Stick with it and scan again in the same lighting.`
          : `Holding steady. If you've been on this routine for 6+ weeks with no change, switch the treatment step.`;
  return { days, overallDelta: curr.overall - prev.overall, deltas, verdict, message };
}

export function buildPlan(scan: SkinScan, history: SkinScan[] = []): Plan {
  const ctx = context(scan);
  const top = ctx.priorities[0];
  const prev = history.filter((h) => h.id !== scan.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
  const progress = prev ? compareScans(prev, scan, ctx.priorities.map((p) => p.key)) : undefined;

  let headline = "";
  let summary = "";
  const acne = scan.concerns.find((c) => c.key === "acne");
  switch (scan.moment) {
    case "breakout":
      headline = isRed(ctx) ? "Calm it down first, then treat" : "Treat the breakout, keep the rest simple";
      summary = `Breakout score is ${acne?.ui ?? "n/a"}/100${isRed(ctx) ? " and your skin is showing redness" : ""}. For the next 7 days, use fewer products, not more: a gentle cleanser, one targeted treatment, a barrier moisturizer, and patches on the spots.`;
      break;
    case "buying":
      headline = `Spend on ${top.label.toLowerCase()} first`;
      summary = `${top.label} is your biggest gap (${top.ui}/100). Everything in your cart should help with it, or at least not make it worse. Paste any product below to check.`;
      break;
    case "working":
      headline = progress ? { improving: "It's working", steady: "Holding steady", slipping: "Something's off" }[progress.verdict] : "Baseline saved";
      summary = progress ? progress.message : "This is your first scan, so it's your baseline. Scan again in 2 weeks in the same spot and lighting, and I'll tell you if your routine is working.";
      break;
    default:
      headline = `Today's focus: ${top.label.toLowerCase()}`;
      summary = `Your skin scores ${scan.overall}/100 overall${scan.skinAge ? ` and looks about ${scan.skinAge} years old` : ""}. Skin type: ${scan.skinType.toLowerCase()}. Your routine below is built around ${ctx.priorities.map((p) => p.label.toLowerCase()).join(", ")}.`;
  }

  const routine = buildRoutine(ctx);
  const shortlist = PRODUCTS.map((p) => scoreProduct(p, ctx))
    .filter((s) => s.product.step !== "cleanser")
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    headline,
    summary,
    priorities: ctx.priorities,
    routine,
    avoid: buildAvoid(ctx),
    shortlist,
    nextScanDays: { breakout: 7, working: 14, buying: 28, checkin: 14 }[scan.moment],
    progress,
    source: "rules",
  };
}

export type ProductCheck = {
  verdict: "great" | "okay" | "skip";
  title: string;
  matched: string[];
  helps: { ingredient: string; concerns: string[] }[];
  cautions: { ingredient: string; why: string }[];
  summary: string;
  catalogMatch?: Product;
};

export function checkProduct(input: string, scan: SkinScan): ProductCheck {
  const ctx = context(scan);
  const lower = input.toLowerCase();
  const catalogMatch = PRODUCTS.find((p) => lower.includes(p.name.toLowerCase()));
  const matched = catalogMatch ? catalogMatch.ingredients : matchIngredients(input);
  const needs = new Set(scan.concerns.filter((c) => c.raw < 70).map((c) => c.key));
  ctx.priorities.forEach((p) => needs.add(p.key));
  const helps = matched
    .map((ing) => ({ ingredient: ing, concerns: (INGREDIENTS[ing]?.helps ?? []).filter((k) => needs.has(k)).map((k) => CONCERNS[k].label) }))
    .filter((h) => h.concerns.length);
  const cautions = ingredientIssues(matched, ctx).filter((c, i, a) => a.findIndex((x) => x.ingredient === c.ingredient) === i);
  const hitsPriority = matched.some((ing) => (INGREDIENTS[ing]?.helps ?? []).some((k) => ctx.priorities.some((p) => p.key === k)));
  let verdict: ProductCheck["verdict"] = "okay";
  if (cautions.length >= 2 || (cautions.length && !helps.length)) verdict = "skip";
  else if (hitsPriority && !cautions.length) verdict = "great";
  const title = { great: "Good match, buy it", okay: "Fine, but not a priority", skip: "Skip this one for now" }[verdict];
  let summary: string;
  if (!matched.length) summary = "I didn't recognize any key ingredients. Paste the full INCI list from the back of the pack for a real verdict.";
  else if (verdict === "great") summary = `It has ${helps.map((h) => h.ingredient).join(", ")}, which targets ${ctx.priorities[0].label.toLowerCase()}, your top focus. Nothing in it conflicts with your skin right now.`;
  else if (verdict === "skip") summary = `Your skin today makes these a problem: ${cautions.map((c) => `${c.ingredient} (${c.why})`).join("; ")}.`;
  else summary = cautions.length ? `It could help, but watch out: ${cautions.map((c) => `${c.ingredient}: ${c.why}`).join("; ")}.` : `Safe for your skin, but it doesn't target ${ctx.priorities[0].label.toLowerCase()}, your top focus.`;
  return { verdict, title, matched, helps, cautions, summary, catalogMatch };
}

export function summarizeScan(scan: SkinScan) {
  return {
    moment: scan.moment,
    overall: scan.overall,
    skinAge: scan.skinAge,
    skinType: scan.skinType,
    scores: Object.fromEntries(scan.concerns.map((c) => [c.key, c.ui])),
  };
}

export function searchCatalog(concern?: string, step?: string, skinType?: SkinType) {
  return PRODUCTS.filter((p) => (!step || p.step === step) && (!concern || (p.targets as Record<string, number>)[concern]) && (!skinType || p.skinTypes.includes(skinType)))
    .map((p) => ({ id: p.id, name: `${p.brand} ${p.name}`, step: p.step, price: p.price, ingredients: p.ingredients, blurb: p.blurb }));
}
