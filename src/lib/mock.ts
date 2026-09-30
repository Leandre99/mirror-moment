import "server-only";
import { HD_ACTIONS } from "./concerns";

function seeded(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function mockTaskId(feature: string, fileId: string, extra = "") {
  return `mock.${feature}.${Date.now()}.${Buffer.from(fileId + "|" + extra).toString("base64url")}`;
}

export function mockTaskResult(taskId: string) {
  const [, feature, startedAt, payload] = taskId.split(".");
  if (Date.now() - Number(startedAt) < 2500) return { task_status: "running" };
  const [fileId, extra] = Buffer.from(payload, "base64url").toString().split("|");
  const rnd = seeded(fileId + extra);
  if (feature === "skin-analysis") {
    const output = HD_ACTIONS.filter((a) => a !== "hd_skin_type").map((type) => {
      const base = type === "hd_acne" || type === "hd_redness" ? 42 : type === "hd_oiliness" || type === "hd_pore" ? 50 : 62;
      const raw = Math.min(97, base + rnd() * 35);
      return { type, region: "whole", raw_score: +raw.toFixed(2), ui_score: Math.round(55 + raw * 0.4), mask_urls: [] };
    });
    output.push({ type: "all", region: "whole", raw_score: 0, ui_score: 0, mask_urls: [], score: 70 + rnd() * 12 } as never);
    output.push({ type: "skin_age", region: "whole", raw_score: 0, ui_score: 0, mask_urls: [], score: 24 + Math.round(rnd() * 12) } as never);
    return { task_status: "success", results: { output } };
  }
  if (feature === "skin-tone-analysis") {
    const tones = ["#e7c3a6", "#d6a886", "#c08a64", "#9a6a4a", "#6e4a33"];
    return { task_status: "success", results: { color: { skin_color: tones[Math.floor(rnd() * tones.length)], lip_color: "#b8636b", eye_color: "#4a3325", eye_color_name: "Brown", hair_color: "#2f2420", hair_color_name: "Black", eyebrow_color: "#3a2a22" } } };
  }
  return { task_status: "success", results: { url: null } };
}
