import { FOUNDATION_SHADES, LIP_SHADES, type Shade } from "./catalog";
import type { SkinScan } from "./concerns";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexToLab(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  });
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return { L: 116 * f(y) - 16, a: 500 * (f(x) - f(y)), b: 200 * (f(y) - f(z)) };
}

export function deltaE(h1: string, h2: string) {
  const a = hexToLab(h1);
  const b = hexToLab(h2);
  return Math.sqrt((a.L - b.L) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);
}

export function undertoneOf(hex: string): Shade["undertone"] {
  const { a, b } = hexToLab(hex);
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  if (hue >= 60) return "warm";
  if (hue <= 50) return "cool";
  return "neutral";
}

export function matchFoundation(skinHex: string) {
  const undertone = undertoneOf(skinHex);
  const ranked = FOUNDATION_SHADES.map((s) => ({ shade: s, d: deltaE(skinHex, s.hex) + (s.undertone === undertone ? 0 : 3) })).sort((x, y) => x.d - y.d);
  return { undertone, best: ranked[0].shade, alternatives: ranked.slice(1, 3).map((r) => r.shade) };
}

export function suggestLips(skinHex: string) {
  const u = undertoneOf(skinHex);
  return LIP_SHADES.filter((l) => l.undertone === u || l.undertone === "neutral").slice(0, 4);
}

/** Uses the skin scan to pick foundation settings: more coverage for acne, redness and spots; less glow for oily skin. */
export function coverageFromScan(scan?: SkinScan) {
  if (!scan) return { coverage: 45, glow: 40, concealer: false, reason: "Balanced defaults" };
  const sev = (k: string) => 100 - (scan.concerns.find((c) => c.key === k)?.raw ?? 80);
  const need = Math.max(sev("acne"), sev("redness"), sev("age_spot"));
  const coverage = Math.round(Math.min(85, Math.max(25, 20 + need)));
  const oily = sev("oiliness");
  const dry = sev("moisture");
  const glow = oily > 45 ? 15 : dry > 45 ? 65 : 40;
  const concealer = sev("dark_circle") > 35;
  const parts: string[] = [];
  parts.push(coverage >= 60 ? "higher coverage for your breakouts and redness" : coverage <= 35 ? "sheer coverage, since your skin is even" : "medium coverage");
  parts.push(glow <= 20 ? "matte finish for oil control" : glow >= 60 ? "dewy finish for dry skin" : "natural finish");
  if (concealer) parts.push("under-eye concealer for dark circles");
  return { coverage, glow, concealer, reason: parts.join(", ") };
}

export function buildMakeupEffects(opts: { foundationHex: string; coverage: number; glow: number; concealer: boolean; lipHex?: string }) {
  const effects: Record<string, unknown>[] = [
    { category: "skin_smooth", skinSmoothStrength: 30, skinSmoothColorIntensity: 30 },
    { category: "foundation", palettes: [{ color: opts.foundationHex, colorIntensity: 55, glowIntensity: opts.glow, coverageIntensity: opts.coverage }] },
  ];
  if (opts.concealer) effects.push({ category: "concealer", palettes: [{ color: opts.foundationHex, colorIntensity: 50, colorUnderEyeIntensity: 60, coverageLevel: 60 }] });
  if (opts.lipHex) effects.push({ category: "lip_color", shape: { name: "original" }, palettes: [{ color: opts.lipHex, texture: "matte", colorIntensity: 65 }], style: { type: "full" } });
  return effects;
}
