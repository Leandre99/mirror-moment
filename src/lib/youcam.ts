import "server-only";

const API_BASE = process.env.YOUCAM_API_BASE || "https://yce-api-01.makeupar.com";

export const FEATURES = {
  "skin-analysis": { path: "/s2s/v2.1/task/skin-analysis" },
  "skin-tone-analysis": { path: "/s2s/v2.0/task/skin-tone-analysis" },
  "makeup-vto": { path: "/s2s/v2.0/task/makeup-vto" },
} as const;

export type Feature = keyof typeof FEATURES;

export function isFeature(x: string): x is Feature {
  return x in FEATURES;
}

export function isMockMode() {
  return !process.env.YOUCAM_API_KEY || process.env.YOUCAM_MOCK === "1";
}

export class YouCamError extends Error {
  constructor(message: string, public status = 500, public code?: string) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(API_BASE + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.YOUCAM_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new YouCamError(`YouCam returned non-JSON (${res.status})`, res.status);
  }
  if (!res.ok || (typeof json.status === "number" && json.status >= 400)) {
    const code = (json.error_code as string) || undefined;
    const msg = (json.error as string) || code || `YouCam request failed (${res.status})`;
    throw new YouCamError(msg, res.status, code);
  }
  return json as T;
}

type FileResp = {
  data: {
    files: {
      file_id: string;
      requests: { url: string; method: string; headers: Record<string, string> }[];
    }[];
  };
};

/** File API: register the file, then PUT the bytes to the pre-signed URL. */
export async function uploadFile(bytes: ArrayBuffer, contentType: string, fileName: string) {
  const reg = await call<FileResp>("/s2s/v2.0/file", {
    method: "POST",
    body: JSON.stringify({
      files: [{ content_type: contentType, file_name: fileName, file_size: bytes.byteLength }],
    }),
  });
  const file = reg.data.files[0];
  const req = file.requests[0];
  const put = await fetch(req.url, {
    method: req.method || "PUT",
    headers: { ...req.headers, "Content-Type": contentType },
    body: bytes,
  });
  if (!put.ok) throw new YouCamError(`Upload to storage failed (${put.status})`, 502);
  return file.file_id;
}

export async function startTask(feature: Feature, payload: Record<string, unknown>) {
  const r = await call<{ data: { task_id: string } }>(FEATURES[feature].path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return r.data.task_id;
}

export type TaskStatus = {
  task_status: "running" | "success" | "error" | string;
  results?: unknown;
  error?: string | null;
  error_message?: string;
};

export async function getTask(feature: Feature, taskId: string) {
  const r = await call<{ data: TaskStatus }>(
    `${FEATURES[feature].path}/${encodeURIComponent(taskId)}`,
    { method: "GET" },
  );
  return r.data;
}
