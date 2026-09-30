"use client";
import type { SkinScan } from "./concerns";

export type Prepared = { blob: Blob; dataUrl: string; width: number; height: number; thumb: string };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = src;
  });
}

function draw(img: HTMLImageElement, maxLong: number, quality: number) {
  const scale = Math.min(1, maxLong / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return { canvas: c, w, h, dataUrl: c.toDataURL("image/jpeg", quality) };
}

/** JPEG, long side <= 1800px: fits HD skin analysis (short side >= 1080 when available), tone analysis (jpg) and makeup VTO (long side < 1920). */
export async function prepareImage(src: string): Promise<Prepared> {
  const img = await loadImage(src);
  const main = draw(img, 1800, 0.92);
  const thumb = draw(img, 240, 0.7).dataUrl;
  const blob = await new Promise<Blob>((res) => main.canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
  return { blob, dataUrl: main.dataUrl, width: main.w, height: main.h, thumb };
}

async function json<T>(res: Response): Promise<T> {
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(friendlyError(j.code, j.error || `Request failed (${res.status})`));
  return j as T;
}

export function friendlyError(code?: string, fallback = "Something went wrong") {
  const map: Record<string, string> = {
    error_no_face: "I couldn't find a face. Face the camera straight on in good light.",
    error_face_position_invalid: "Center your face in the frame, and make sure all of it is visible.",
    error_face_position_too_small: "Move closer. Your face should fill most of the frame.",
    error_face_not_forward_facing: "Look straight into the camera.",
    error_below_min_image_size: "That image is too small. Use a sharper photo.",
    InvalidApiKey: "The YouCam API key is missing or invalid.",
    CreditInsufficiency: "The YouCam account is out of units.",
  };
  return (code && map[code]) || fallback;
}

export async function uploadImage(blob: Blob) {
  const fd = new FormData();
  fd.append("file", blob, "selfie.jpg");
  return json<{ fileId: string; mode: "live" | "mock" }>(await fetch("/api/upload", { method: "POST", body: fd }));
}

export async function runTask<T>(feature: string, body: Record<string, unknown>, onTick?: (n: number) => void): Promise<T> {
  const { taskId } = await json<{ taskId: string }>(
    await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feature, ...body }) }),
  );
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, i === 0 ? 1500 : 3000));
    onTick?.(i);
    const r = await json<T & { status: string; error?: string; code?: string }>(await fetch(`/api/tasks/${feature}/${encodeURIComponent(taskId)}`, { cache: "no-store" }));
    if (r.status === "success") return r;
    if (r.status === "error") throw new Error(friendlyError(r.code, r.error));
  }
  throw new Error("The analysis timed out. Please try again.");
}

export async function agent<T>(body: Record<string, unknown>) {
  return json<T>(await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

const KEY = "mirror-moment:scans";
export function loadHistory(): SkinScan[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveScan(scan: SkinScan) {
  const all = [scan, ...loadHistory().filter((s) => s.id !== scan.id)].slice(0, 20);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    localStorage.setItem(KEY, JSON.stringify(all.map((s) => ({ ...s, thumb: undefined }))));
  }
  return all;
}
export function clearHistory() {
  localStorage.removeItem(KEY);
}
