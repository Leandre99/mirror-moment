import { NextResponse } from "next/server";
import { isFeature, isMockMode, startTask, YouCamError } from "@/lib/youcam";
import { HD_ACTIONS, SD_ACTIONS } from "@/lib/concerns";
import { mockTaskId } from "@/lib/mock";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { feature, fileId, quality, effects } = await req.json();
    if (typeof feature !== "string" || !isFeature(feature)) return NextResponse.json({ error: "Unknown feature" }, { status: 400 });
    if (typeof fileId !== "string" || !fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });

    let payload: Record<string, unknown>;
    if (feature === "skin-analysis") {
      payload = {
        src_file_id: fileId,
        dst_actions: quality === "HD" ? HD_ACTIONS : SD_ACTIONS,
        miniserver_args: { enable_mask_overlay: false },
        format: "json",
      };
    } else if (feature === "skin-tone-analysis") {
      payload = { src_file_id: fileId, face_angle_strictness_level: "medium" };
    } else {
      if (!Array.isArray(effects) || !effects.length) return NextResponse.json({ error: "effects required" }, { status: 400 });
      payload = { src_file_id: fileId, effects, version: "1.0" };
    }

    if (isMockMode()) return NextResponse.json({ taskId: mockTaskId(feature, fileId, JSON.stringify(effects ?? quality ?? "")) });
    const taskId = await startTask(feature, payload);
    return NextResponse.json({ taskId });
  } catch (e) {
    const err = e as YouCamError;
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status || 500 });
  }
}
