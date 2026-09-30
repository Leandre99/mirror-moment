import { NextResponse } from "next/server";
import { buildPlan, checkProduct, compareScans, searchCatalog } from "@/lib/agent";
import { CONCERNS, type ConcernKey, type SkinScan } from "@/lib/concerns";
import { matchIngredients } from "@/lib/catalog";
import { coachNote, llmEnabled, runCoachAgent } from "@/lib/llm";

export const runtime = "nodejs";

type Body =
  | { action: "plan"; scan: SkinScan; history?: SkinScan[] }
  | { action: "check"; scan: SkinScan; input: string }
  | { action: "chat"; scan: SkinScan; history?: SkinScan[]; question: string; chat?: { role: "user" | "assistant"; content: string }[] };

function rulesChat(question: string, scan: SkinScan, history: SkinScan[]) {
  const q = question.toLowerCase();
  const trace: string[] = [];
  if (/(working|progress|better|worse|improv)/.test(q)) {
    trace.push("compare_progress");
    const prev = history.filter((h) => h.id !== scan.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    return { answer: prev ? compareScans(prev, scan, []).message : "I only have one scan so far. Scan again in about 2 weeks, in the same lighting, and I'll compare them.", trace };
  }
  const ingredients = matchIngredients(question);
  if (ingredients.length && !q.includes(",")) {
    trace.push("get_scan", "check_product");
    const r = checkProduct(question, scan);
    const ok = r.verdict !== "skip";
    return { answer: `${ok ? "Yes" : "Not right now"}: ${r.summary}${ok ? " Start slowly: 2 to 3 nights a week, and patch test first." : " Rescan in 1 to 2 weeks and ask me again."}`, trace };
  }
  if (q.includes(",") || /(buy|should i|ingredient|contains|use this)/.test(q)) {
    trace.push("check_product");
    const r = checkProduct(question, scan);
    return { answer: `${r.title}. ${r.summary}`, trace };
  }
  const concern = (Object.keys(CONCERNS) as ConcernKey[]).find((k) => q.includes(k.replace("_", " ")) || q.includes(CONCERNS[k].label.toLowerCase()) || q.includes(CONCERNS[k].short.toLowerCase()));
  if (concern) {
    trace.push("get_scan", "search_catalog");
    const c = scan.concerns.find((x) => x.key === concern);
    const picks = searchCatalog(concern, undefined, scan.skinType).slice(0, 2);
    return { answer: `${CONCERNS[concern].label}: you scored ${c?.ui ?? "n/a"}/100. ${CONCERNS[concern].explain} For your ${scan.skinType.toLowerCase()} skin, try: ${picks.map((p) => `${p.name} (${p.blurb})`).join(" or ")}.`, trace };
  }
  const plan = buildPlan(scan, history);
  trace.push("get_scan");
  return { answer: `${plan.headline}. ${plan.summary}`, trace };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.scan?.concerns) return NextResponse.json({ error: "scan required" }, { status: 400 });
    if (body.action === "plan") {
      const plan = buildPlan(body.scan, body.history ?? []);
      try {
        const note = await coachNote(body.scan, plan);
        if (note) {
          plan.coachNote = note;
          plan.source = "llm";
        }
      } catch (e) {
        console.warn("coach note failed", e);
      }
      return NextResponse.json(plan);
    }
    if (body.action === "check") return NextResponse.json(checkProduct(body.input ?? "", body.scan));
    if (body.action === "chat") {
      if (llmEnabled()) {
        try {
          return NextResponse.json({ ...(await runCoachAgent(body.question, body.scan, body.history ?? [], body.chat ?? [])), source: "llm" });
        } catch (e) {
          console.warn("agent failed, falling back to rules", e);
        }
      }
      return NextResponse.json({ ...rulesChat(body.question, body.scan, body.history ?? []), source: "rules" });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
