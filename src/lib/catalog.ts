import type { ConcernKey, SkinType } from "./concerns";

export type Step = "cleanser" | "treatment" | "serum" | "moisturizer" | "spf" | "spot";

export type Product = {
  id: string;
  name: string;
  brand: string;
  step: Step;
  when: ("AM" | "PM")[];
  price: number;
  ingredients: string[];
  targets: Partial<Record<ConcernKey, number>>;
  skinTypes: SkinType[];
  blurb: string;
};

// Demo catalog (fictional brands) used by the recommendation agent.
export const PRODUCTS: Product[] = [
  { id: "c1", name: "Gentle Gel Cleanser", brand: "Dewline", step: "cleanser", when: ["AM", "PM"], price: 14, ingredients: ["glycerin", "panthenol", "allantoin"], targets: { redness: 0.6, moisture: 0.3 }, skinTypes: ["Normal", "Dry", "Sensitive", "Combination"], blurb: "Low-foam, no fragrance. Won't strip a stressed barrier." },
  { id: "c2", name: "Clarifying BHA Wash", brand: "Porecraft", step: "cleanser", when: ["PM"], price: 16, ingredients: ["salicylic acid", "zinc pca", "glycerin"], targets: { acne: 0.8, oiliness: 0.7, pore: 0.6 }, skinTypes: ["Oily", "Combination"], blurb: "2% salicylic acid gets into pores. Best at night." },
  { id: "c3", name: "Cream Milk Cleanser", brand: "Softwell", step: "cleanser", when: ["AM", "PM"], price: 18, ingredients: ["ceramides", "squalane", "glycerin"], targets: { moisture: 0.8, redness: 0.4 }, skinTypes: ["Dry", "Sensitive", "Normal"], blurb: "Cleans without the tight feeling." },

  { id: "s1", name: "10% Niacinamide Serum", brand: "Porecraft", step: "serum", when: ["AM", "PM"], price: 12, ingredients: ["niacinamide", "zinc pca"], targets: { oiliness: 0.8, pore: 0.7, redness: 0.4, acne: 0.4, age_spot: 0.3 }, skinTypes: ["Oily", "Combination", "Normal"], blurb: "Helps control oil and makes pores look smaller." },
  { id: "s2", name: "Hyaluronic Water Serum", brand: "Dewline", step: "serum", when: ["AM", "PM"], price: 15, ingredients: ["hyaluronic acid", "panthenol", "glycerin"], targets: { moisture: 0.9, wrinkle: 0.3, radiance: 0.3 }, skinTypes: ["Normal", "Dry", "Sensitive", "Combination", "Oily"], blurb: "Lightweight hydration that plumps skin. Works for every skin type." },
  { id: "s3", name: "Vitamin C 15% Glow Drops", brand: "Luma", step: "serum", when: ["AM"], price: 29, ingredients: ["ascorbic acid", "ferulic acid", "vitamin e"], targets: { radiance: 0.9, age_spot: 0.7, firmness: 0.3 }, skinTypes: ["Normal", "Oily", "Combination"], blurb: "Brightens and fades dark spots. Use in the morning under SPF." },
  { id: "s4", name: "Centella Calm Serum", brand: "Softwell", step: "serum", when: ["AM", "PM"], price: 22, ingredients: ["centella asiatica", "madecassoside", "panthenol"], targets: { redness: 0.9, acne: 0.3, moisture: 0.3 }, skinTypes: ["Sensitive", "Normal", "Dry", "Combination", "Oily"], blurb: "Calms redness and irritation fast." },
  { id: "s5", name: "Tranexamic Spot Fader", brand: "Luma", step: "serum", when: ["AM", "PM"], price: 26, ingredients: ["tranexamic acid", "niacinamide", "licorice root"], targets: { age_spot: 0.9, radiance: 0.5, redness: 0.2 }, skinTypes: ["Normal", "Oily", "Combination", "Sensitive", "Dry"], blurb: "Gently fades marks left by breakouts. Safe for sensitive skin." },
  { id: "s6", name: "Caffeine Eye Serum", brand: "Dewline", step: "serum", when: ["AM"], price: 11, ingredients: ["caffeine", "peptides", "hyaluronic acid"], targets: { eye_bag: 0.8, dark_circle: 0.6 }, skinTypes: ["Normal", "Oily", "Combination", "Sensitive", "Dry"], blurb: "Morning de-puffer for the under-eye area." },

  { id: "t1", name: "Retinal 0.05% Night Serum", brand: "Luma", step: "treatment", when: ["PM"], price: 34, ingredients: ["retinal", "squalane", "ceramides"], targets: { wrinkle: 0.9, texture: 0.8, firmness: 0.7, acne: 0.5, pore: 0.4 }, skinTypes: ["Normal", "Oily", "Combination"], blurb: "Retinoid for lines and texture. Start 2-3 nights a week." },
  { id: "t2", name: "Azelaic 10% Booster", brand: "Softwell", step: "treatment", when: ["PM"], price: 21, ingredients: ["azelaic acid", "allantoin"], targets: { acne: 0.7, redness: 0.7, age_spot: 0.6, texture: 0.4 }, skinTypes: ["Sensitive", "Normal", "Combination", "Oily", "Dry"], blurb: "Treats breakouts and redness at once. Gentle enough for reactive skin." },
  { id: "t3", name: "Lactic Acid 5% Resurfacer", brand: "Dewline", step: "treatment", when: ["PM"], price: 19, ingredients: ["lactic acid", "glycerin", "aloe"], targets: { texture: 0.8, radiance: 0.6, age_spot: 0.4, moisture: 0.2 }, skinTypes: ["Normal", "Dry", "Combination"], blurb: "Gentle exfoliating acid for smoother, brighter skin." },
  { id: "t4", name: "BHA 2% Pore Liquid", brand: "Porecraft", step: "treatment", when: ["PM"], price: 24, ingredients: ["salicylic acid", "green tea"], targets: { pore: 0.9, acne: 0.7, oiliness: 0.6, texture: 0.5 }, skinTypes: ["Oily", "Combination"], blurb: "Clears blackheads and clogged pores." },

  { id: "m1", name: "Barrier Ceramide Cream", brand: "Softwell", step: "moisturizer", when: ["AM", "PM"], price: 20, ingredients: ["ceramides", "cholesterol", "fatty acids", "niacinamide"], targets: { moisture: 0.9, redness: 0.6, firmness: 0.2 }, skinTypes: ["Dry", "Sensitive", "Normal", "Combination"], blurb: "Repairs the skin barrier. Works well with retinoids." },
  { id: "m2", name: "Oil-Free Gel Cream", brand: "Porecraft", step: "moisturizer", when: ["AM", "PM"], price: 17, ingredients: ["hyaluronic acid", "niacinamide", "glycerin"], targets: { moisture: 0.6, oiliness: 0.5, pore: 0.2 }, skinTypes: ["Oily", "Combination", "Normal"], blurb: "Hydrates without shine or clogged pores." },
  { id: "m3", name: "Peptide Firming Cream", brand: "Luma", step: "moisturizer", when: ["PM"], price: 38, ingredients: ["peptides", "squalane", "shea butter"], targets: { firmness: 0.8, wrinkle: 0.6, moisture: 0.6 }, skinTypes: ["Dry", "Normal"], blurb: "Rich night cream for bounce and elasticity." },

  { id: "f1", name: "Invisible Fluid SPF 50", brand: "Luma", step: "spf", when: ["AM"], price: 25, ingredients: ["zinc oxide", "niacinamide", "vitamin e"], targets: { age_spot: 0.7, redness: 0.3, wrinkle: 0.4, radiance: 0.2 }, skinTypes: ["Normal", "Oily", "Combination", "Sensitive", "Dry"], blurb: "Mineral SPF with no white cast. Stops dark spots from getting darker." },
  { id: "f2", name: "Matte Shield SPF 40", brand: "Porecraft", step: "spf", when: ["AM"], price: 22, ingredients: ["zinc oxide", "silica"], targets: { oiliness: 0.5, age_spot: 0.6 }, skinTypes: ["Oily", "Combination"], blurb: "Keeps shine down all day." },
  { id: "f3", name: "Dewy Moisture SPF 50", brand: "Dewline", step: "spf", when: ["AM"], price: 23, ingredients: ["hyaluronic acid", "squalane", "fragrance"], targets: { moisture: 0.5, age_spot: 0.6 }, skinTypes: ["Dry", "Normal"], blurb: "Hydrating finish, with a light scent." },

  { id: "p1", name: "Hydrocolloid Patch Dots", brand: "Porecraft", step: "spot", when: ["AM", "PM"], price: 9, ingredients: ["hydrocolloid", "tea tree"], targets: { acne: 0.8 }, skinTypes: ["Normal", "Oily", "Combination", "Sensitive", "Dry"], blurb: "Flattens a spot overnight and keeps you from picking it." },
];

type IngredientInfo = {
  helps?: ConcernKey[];
  caution?: { when: ConcernKey | SkinType; why: string }[];
  alias?: string[];
  active?: "retinoid" | "acid" | "vitc";
};

export const INGREDIENTS: Record<string, IngredientInfo> = {
  "salicylic acid": { helps: ["acne", "pore", "oiliness"], caution: [{ when: "Dry", why: "can be drying" }], alias: ["bha", "beta hydroxy acid"], active: "acid" },
  "glycolic acid": { helps: ["texture", "radiance", "age_spot"], caution: [{ when: "redness", why: "strong acid; can make redness worse" }, { when: "Sensitive", why: "often too strong for reactive skin" }], alias: ["aha"], active: "acid" },
  "lactic acid": { helps: ["texture", "radiance", "moisture"], caution: [{ when: "redness", why: "exfoliating acid; go slow while red" }], active: "acid" },
  "azelaic acid": { helps: ["acne", "redness", "age_spot"] },
  niacinamide: { helps: ["oiliness", "pore", "redness", "age_spot"] },
  "hyaluronic acid": { helps: ["moisture"], alias: ["sodium hyaluronate"] },
  ceramides: { helps: ["moisture", "redness"], alias: ["ceramide np", "ceramide ap", "ceramide eop"] },
  retinol: { helps: ["wrinkle", "texture", "acne", "firmness"], caution: [{ when: "redness", why: "retinoids can cause irritation while skin is red" }, { when: "Sensitive", why: "start slowly (2x a week)" }], active: "retinoid" },
  retinal: { helps: ["wrinkle", "texture", "acne", "firmness"], caution: [{ when: "redness", why: "retinoids can cause irritation while skin is red" }], alias: ["retinaldehyde"], active: "retinoid" },
  "ascorbic acid": { helps: ["radiance", "age_spot"], caution: [{ when: "Sensitive", why: "pure vitamin C can sting" }], alias: ["vitamin c", "l-ascorbic acid"], active: "vitc" },
  "tranexamic acid": { helps: ["age_spot"] },
  "centella asiatica": { helps: ["redness"], alias: ["cica", "madecassoside"] },
  panthenol: { helps: ["moisture", "redness"], alias: ["vitamin b5"] },
  peptides: { helps: ["firmness", "wrinkle"], alias: ["palmitoyl tripeptide", "matrixyl"] },
  caffeine: { helps: ["eye_bag", "dark_circle"] },
  "zinc oxide": { helps: ["age_spot", "redness"] },
  squalane: { helps: ["moisture"] },
  "benzoyl peroxide": { helps: ["acne"], caution: [{ when: "Dry", why: "very drying" }, { when: "redness", why: "can irritate red skin" }] },
  "tea tree": { helps: ["acne"], caution: [{ when: "Sensitive", why: "essential oil; common irritant" }], alias: ["melaleuca"] },
  fragrance: { caution: [{ when: "redness", why: "fragrance is a top trigger for irritation" }, { when: "Sensitive", why: "fragrance is a top trigger for irritation" }], alias: ["parfum", "perfume"] },
  "alcohol denat": { caution: [{ when: "moisture", why: "drying alcohol makes dehydration worse" }, { when: "redness", why: "can sting and redden" }], alias: ["denatured alcohol", "sd alcohol", "alcohol denat."] },
  "coconut oil": { caution: [{ when: "acne", why: "highly comedogenic (clogs pores)" }], alias: ["cocos nucifera oil"] },
  "isopropyl myristate": { caution: [{ when: "acne", why: "known pore-clogger" }] },
  "shea butter": { helps: ["moisture"], caution: [{ when: "Oily", why: "rich; may feel heavy on oily skin" }] },
  "essential oil": { caution: [{ when: "Sensitive", why: "common irritant" }], alias: ["lavender oil", "citrus oil", "peppermint oil", "eucalyptus oil"] },
  "witch hazel": { helps: ["oiliness"], caution: [{ when: "redness", why: "astringent; can irritate" }] },
};

export function matchIngredients(text: string): string[] {
  const t = " " + text.toLowerCase().replace(/[\n;|/]/g, ",") + " ";
  const found: string[] = [];
  for (const [name, info] of Object.entries(INGREDIENTS)) {
    const names = [name, ...(info.alias ?? [])];
    if (names.some((n) => t.includes(n))) found.push(name);
  }
  return found;
}

export type Shade = { name: string; hex: string; undertone: "cool" | "neutral" | "warm" };

export const FOUNDATION_SHADES: Shade[] = [
  { name: "110 Porcelain", hex: "#F3D9C6", undertone: "cool" },
  { name: "120 Ivory", hex: "#EFD2B6", undertone: "neutral" },
  { name: "130 Buff", hex: "#EACBA6", undertone: "warm" },
  { name: "210 Light Rose", hex: "#E6C1AA", undertone: "cool" },
  { name: "220 Light Sand", hex: "#E2BD9A", undertone: "neutral" },
  { name: "230 Light Honey", hex: "#DDB58B", undertone: "warm" },
  { name: "310 Medium Rose", hex: "#D2A48A", undertone: "cool" },
  { name: "320 Medium Beige", hex: "#CFA07E", undertone: "neutral" },
  { name: "330 Golden", hex: "#C9975F", undertone: "warm" },
  { name: "410 Tan Rose", hex: "#B7866C", undertone: "cool" },
  { name: "420 Tan", hex: "#B3825F", undertone: "neutral" },
  { name: "430 Caramel", hex: "#AD7A4C", undertone: "warm" },
  { name: "510 Deep Rose", hex: "#8E614D", undertone: "cool" },
  { name: "520 Mocha", hex: "#895D44", undertone: "neutral" },
  { name: "530 Chestnut", hex: "#835634", undertone: "warm" },
  { name: "610 Espresso", hex: "#5E3E30", undertone: "cool" },
  { name: "620 Cocoa", hex: "#5A3B2A", undertone: "neutral" },
  { name: "630 Ebony", hex: "#4A2F1F", undertone: "warm" },
];

export const LIP_SHADES: (Shade & { vibe: string })[] = [
  { name: "Berry Crush", hex: "#8C2A4B", undertone: "cool", vibe: "Bold" },
  { name: "Blue Red", hex: "#B0182F", undertone: "cool", vibe: "Classic" },
  { name: "Mauve Mood", hex: "#A6606F", undertone: "cool", vibe: "Everyday" },
  { name: "Rosewood", hex: "#A5544F", undertone: "neutral", vibe: "Everyday" },
  { name: "True Nude", hex: "#B97A6A", undertone: "neutral", vibe: "Soft" },
  { name: "Brick", hex: "#9E3B2B", undertone: "warm", vibe: "Bold" },
  { name: "Coral Pop", hex: "#E0584A", undertone: "warm", vibe: "Fresh" },
  { name: "Terracotta", hex: "#B85C3E", undertone: "warm", vibe: "Everyday" },
];
