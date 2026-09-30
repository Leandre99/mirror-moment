import { NextResponse } from "next/server";
import { isMockMode, uploadFile, YouCamError } from "@/lib/youcam";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
    if (isMockMode()) return NextResponse.json({ fileId: `mock-${Date.now()}-${file.size}`, mode: "mock" });
    const bytes = await file.arrayBuffer();
    const fileId = await uploadFile(bytes, file.type || "image/jpeg", "selfie.jpg");
    return NextResponse.json({ fileId, mode: "live" });
  } catch (e) {
    const err = e as YouCamError;
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status || 500 });
  }
}
