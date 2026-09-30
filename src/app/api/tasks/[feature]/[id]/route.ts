import { NextResponse } from "next/server";
import { getTask, isFeature, YouCamError, type TaskStatus } from "@/lib/youcam";
import { mockTaskResult } from "@/lib/mock";
import { normalizeSkinOutput } from "@/lib/concerns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { feature: string; id: string } }) {
  const { feature, id } = params;
  if (!isFeature(feature)) return NextResponse.json({ error: "Unknown feature" }, { status: 400 });
  try {
    const t: TaskStatus = id.startsWith("mock.") ? (mockTaskResult(id) as TaskStatus) : await getTask(feature, id);
    if (t.task_status === "error") {
      return NextResponse.json({ status: "error", error: t.error_message || t.error || "Task failed", code: t.error });
    }
    if (t.task_status !== "success") return NextResponse.json({ status: "running" });

    const r = (t.results ?? {}) as Record<string, unknown>;
    if (feature === "skin-analysis") {
      const output = (r.output as never[]) ?? [];
      return NextResponse.json({ status: "success", skin: normalizeSkinOutput(output) });
    }
    if (feature === "skin-tone-analysis") {
      return NextResponse.json({ status: "success", color: r.color ?? r });
    }
    const url = (r.url as string | null | undefined) ?? (Array.isArray(t.results) ? (t.results[0] as { download_url?: string; url?: string })?.download_url ?? (t.results[0] as { url?: string })?.url : null);
    return NextResponse.json({ status: "success", url: url ?? null });
  } catch (e) {
    const err = e as YouCamError;
    return NextResponse.json({ status: "error", error: err.message, code: err.code }, { status: err.status || 500 });
  }
}
