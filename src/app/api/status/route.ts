import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/youcam";
import { llmEnabled } from "@/lib/llm";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ youcam: isMockMode() ? "mock" : "live", llm: llmEnabled() });
}
