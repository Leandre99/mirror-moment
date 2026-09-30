export type ConcernKey =
  | "acne"
  | "redness"
  | "oiliness"
  | "moisture"
  | "pore"
  | "texture"
  | "radiance"
  | "age_spot"
  | "wrinkle"
  | "dark_circle"
  | "eye_bag"
  | "firmness";

export const CONCERNS: Record<ConcernKey, { label: string; short: string; explain: string }> = {
  acne: { label: "Breakouts", short: "Acne", explain: "Active blemishes and inflamed spots." },
  redness: { label: "Redness", short: "Redness", explain: "Visible irritation or sensitivity, often a sign your barrier is stressed." },
  oiliness: { label: "Oil balance", short: "Oil", explain: "Shine and excess sebum, usually strongest in the T-zone." },
  moisture: { label: "Hydration", short: "Hydration", explain: "How well your skin holds water. Low hydration makes lines and flakes show more." },
  pore: { label: "Pores", short: "Pores", explain: "How visible and congested pores are." },
  texture: { label: "Texture", short: "Texture", explain: "Smoothness of the skin surface: bumps, roughness, uneven spots." },
  radiance: { label: "Radiance", short: "Glow", explain: "How bright and even your skin looks in light." },
  age_spot: { label: "Dark spots", short: "Spots", explain: "Pigmentation, sun spots and post-breakout marks." },
  wrinkle: { label: "Fine lines", short: "Lines", explain: "Lines and wrinkles across forehead, eyes and smile area." },
  dark_circle: { label: "Dark circles", short: "Circles", explain: "Darkness in the under-eye area." },
  eye_bag: { label: "Puffiness", short: "Puffiness", explain: "Under-eye bags and puffiness." },
  firmness: { label: "Firmness", short: "Firmness", explain: "Elasticity and bounce of the skin." },
};

export const CONCERN_KEYS = Object.keys(CONCERNS) as ConcernKey[];

export const HD_ACTIONS = [
  "hd_acne", "hd_redness", "hd_oiliness", "hd_moisture", "hd_pore", "hd_texture",
  "hd_radiance", "hd_age_spot", "hd_wrinkle", "hd_dark_circle", "hd_eye_bag", "hd_firmness", "hd_skin_type",
];
export const SD_ACTIONS = [
  "acne", "redness", "oiliness", "moisture", "pore", "texture",
  "radiance", "age_spot", "wrinkle", "dark_circle_v2", "eye_bag", "firmness", "skin_type",
];

export type SkinType = "Normal" | "Oily" | "Dry" | "Combination" | "Sensitive";

export type ConcernScore = {
  key: ConcernKey;
  ui: number;
  raw: number;
  maskUrl?: string;
  regions?: { region: string; ui: number; raw: number; maskUrl?: string }[];
};

export type SkinScan = {
  id: string;
  createdAt: string;
  moment: Moment;
  mode: "live" | "mock";
  quality: "HD" | "SD";
  overall: number;
  skinAge?: number;
  skinType: SkinType;
  skinTypeSource: "ai" | "derived";
  concerns: ConcernScore[];
  thumb?: string;
};

export type Moment = "breakout" | "buying" | "working" | "checkin";

export const MOMENTS: Record<Moment, { title: string; sub: string; emoji: string }> = {
  breakout: { title: "I just broke out", sub: "Calm it down fast without making it worse", emoji: "!" },
  buying: { title: "I'm about to buy something", sub: "Check if it actually fits my skin", emoji: "$" },
  working: { title: "Is my routine working?", sub: "Compare against my last scan", emoji: "~" },
  checkin: { title: "Just a mirror check-in", sub: "Tell me what my skin needs today", emoji: "*" },
};

type RawItem = {
  type?: string;
  region?: string;
  ui_score?: number;
  raw_score?: number;
  score?: number;
  mask_urls?: string[];
  [k: string]: unknown;
};

function baseKey(type: string): string {
  return type.replace(/^hd_/, "").replace(/_v2$/, "");
}

/** Normalizes the `results.output` array of a skin-analysis task (format=json). */
export function normalizeSkinOutput(output: RawItem[]) {
  const map = new Map<ConcernKey, ConcernScore>();
  let overall: number | undefined;
  let skinAge: number | undefined;
  let aiSkinType: SkinType | undefined;

  for (const item of output) {
    const type = item.type ? baseKey(item.type) : "";
    if (type === "all") {
      overall = item.score ?? item.ui_score ?? item.raw_score;
      continue;
    }
    if (type === "skin_age") {
      skinAge = item.score ?? item.ui_score ?? item.raw_score;
      continue;
    }
    if (type === "skin_type") {
      const label = [item.skin_type, item.label, item.result, item.value].find((v) => typeof v === "string") as string | undefined;
      if (label && (!item.region || item.region === "whole")) aiSkinType = mapSkinType(label);
      continue;
    }
    if (!(type in CONCERNS)) continue;
    const key = type as ConcernKey;
    const ui = Math.round(item.ui_score ?? item.raw_score ?? 0);
    const raw = item.raw_score ?? item.ui_score ?? 0;
    const maskUrl = item.mask_urls?.[0];
    const region = item.region;
    const existing = map.get(key);
    if (region && region !== "whole") {
      const c = existing ?? { key, ui, raw, maskUrl };
      c.regions = [...(c.regions ?? []), { region, ui, raw, maskUrl }];
      map.set(key, c);
    } else {
      map.set(key, { ...(existing ?? {}), key, ui, raw, maskUrl });
    }
  }

  const concerns = CONCERN_KEYS.filter((k) => map.has(k)).map((k) => map.get(k)!);
  if (overall === undefined && concerns.length) {
    overall = concerns.reduce((s, c) => s + c.ui, 0) / concerns.length;
  }
  const derived = deriveSkinType(concerns);
  return {
    overall: Math.round(overall ?? 0),
    skinAge: skinAge !== undefined ? Math.round(skinAge) : undefined,
    skinType: aiSkinType ?? derived,
    skinTypeSource: (aiSkinType ? "ai" : "derived") as "ai" | "derived",
    concerns,
  };
}

function mapSkinType(label: string): SkinType {
  const l = label.toLowerCase();
  if (l.includes("redness")) return "Sensitive";
  if (l.includes("combination")) return "Combination";
  if (l.includes("oily")) return "Oily";
  if (l.includes("dry")) return "Dry";
  return "Normal";
}

export function deriveSkinType(concerns: ConcernScore[]): SkinType {
  const s = (k: ConcernKey) => concerns.find((c) => c.key === k)?.raw ?? 70;
  if (s("redness") < 50) return "Sensitive";
  const oily = s("oiliness") < 55;
  const dry = s("moisture") < 55;
  if (oily && dry) return "Combination";
  if (oily) return "Oily";
  if (dry) return "Dry";
  return "Normal";
}

export function scoreBand(ui: number): { label: string; tone: "good" | "ok" | "focus" } {
  if (ui >= 80) return { label: "Great", tone: "good" };
  if (ui >= 65) return { label: "Okay", tone: "ok" };
  return { label: "Focus", tone: "focus" };
}
