"use client";
import type { FaceDetector } from "@mediapipe/tasks-vision";

// WASM runtime and model are fetched from public CDNs at first use, so nothing heavy ships in the bundle.
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

/** YouCam rejects faces narrower than 60% of the image width; aim for a safe margin above that. */
const TARGET_FACE_RATIO = 0.7;
const SKIP_IF_RATIO_AT_LEAST = 0.62;
/** Upscale tiny crops so they are not rejected as "below minimum size". Kept under 1080 so the scan is not labelled HD. */
const MIN_SHORT_SIDE = 720;

let detectorPromise: Promise<FaceDetector> | null = null;

function getDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      return FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.6,
      });
    })().catch((e) => {
      detectorPromise = null;
      throw e;
    });
  }
  return detectorPromise;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = src;
  });
}

export type Framing = { src: string; cropped: boolean };

/**
 * Finds the largest face and, when it is too small in the frame, crops a portrait window around it.
 * Never throws: if detection is unavailable (offline, unsupported browser) the original photo is returned.
 */
export async function autoFrame(src: string): Promise<Framing> {
  try {
    const img = await loadImage(src);
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const detector = await getDetector();
    const { detections } = detector.detect(img);
    const face = detections
      .map((d) => d.boundingBox)
      .filter((b): b is NonNullable<typeof b> => !!b)
      .sort((a, b) => b.width * b.height - a.width * a.height)[0];
    if (!face || face.width / W >= SKIP_IF_RATIO_AT_LEAST) return { src, cropped: false };

    let cw = Math.min(W, face.width / TARGET_FACE_RATIO);
    const ch = Math.min(H, cw * 1.25);
    cw = Math.min(cw, ch / 1.25);
    const cx = face.originX + face.width / 2;
    const cy = face.originY + face.height / 2;
    const x = Math.max(0, Math.min(W - cw, cx - cw / 2));
    const y = Math.max(0, Math.min(H - ch, cy - ch / 2));

    const short = Math.min(cw, ch);
    const scale = short < MIN_SHORT_SIDE ? MIN_SHORT_SIDE / short : 1;
    const c = document.createElement("canvas");
    c.width = Math.round(cw * scale);
    c.height = Math.round(ch * scale);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, cw, ch, 0, 0, c.width, c.height);
    return { src: c.toDataURL("image/jpeg", 0.95), cropped: true };
  } catch {
    return { src, cropped: false };
  }
}
