import "server-only";
import type { SkinScan } from "./concerns";
import { checkProduct, compareScans, searchCatalog, summarizeScan, type Plan } from "./agent";
import { CONCERNS } from "./concerns";

const BASE = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export function llmEnabled() {
  return Boolean(process.env.OPENAI_API_KEY);
}

type Msg = { role: "system" | "user" | "assistant" | "tool"; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string };
type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

async function chat(messages: Msg[], tools?: unknown[], json = false) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      ...(tools ? { tools } : {}),
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  return j.choices[0].message as Msg;
}

const SYSTEM = `You are Mirror Moment, a warm, no-nonsense skin coach. You only use facts from the user's YouCam AI skin scan and the tools provided. Never diagnose medical conditions; suggest a dermatologist for severe, painful or persistent acne. Recommend only products returned by tools. Keep answers under 120 words, in plain language, with concrete next steps.`;

export async function coachNote(scan: SkinScan, plan: Plan): Promise<string | undefined> {
  if (!llmEnabled()) return undefined;
  const msg = await chat(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Write a JSON object {"note": string} with a 2-3 sentence personal note for this moment ("${scan.moment}"). Speak directly to the user. Reference their specific scores. Scan: ${JSON.stringify(summarizeScan(scan))}. Plan priorities: ${plan.priorities.map((p) => `${p.label} ${p.ui}`).join(", ")}. Progress: ${plan.progress?.message ?? "none"}.`,
      },
    ],
    undefined,
    true,
  );
  try {
    return JSON.parse(msg.content || "{}").note;
  } catch {
    return undefined;
  }
}

const TOOLS = [
  { type: "function", function: { name: "get_scan", description: "Get the user's latest YouCam skin analysis scores (0-100, higher is healthier), skin type and moment.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "check_product", description: "Check a product name or pasted ingredient list against the user's current skin.", parameters: { type: "object", properties: { input: { type: "string" } }, required: ["input"] } } },
  { type: "function", function: { name: "search_catalog", description: "Search the store catalog.", parameters: { type: "object", properties: { concern: { type: "string", enum: Object.keys(CONCERNS) }, step: { type: "string", enum: ["cleanser", "treatment", "serum", "moisturizer", "spf", "spot"] } } } } },
  { type: "function", function: { name: "compare_progress", description: "Compare the latest scan with the previous scan to see if the routine is working.", parameters: { type: "object", properties: {} } } },
];

export async function runCoachAgent(question: string, scan: SkinScan, history: SkinScan[], chatHistory: { role: "user" | "assistant"; content: string }[]) {
  const trace: string[] = [];
  const messages: Msg[] = [{ role: "system", content: SYSTEM }, ...chatHistory.slice(-6), { role: "user", content: question }];
  for (let i = 0; i < 5; i++) {
    const msg = await chat(messages, TOOLS);
    messages.push(msg);
    if (!msg.tool_calls?.length) return { answer: msg.content ?? "", trace };
    for (const call of msg.tool_calls) {
      const args = JSON.parse(call.function.arguments || "{}");
      trace.push(call.function.name);
      let result: unknown;
      switch (call.function.name) {
        case "get_scan":
          result = summarizeScan(scan);
          break;
        case "check_product":
          result = checkProduct(String(args.input ?? ""), scan);
          break;
        case "search_catalog":
          result = searchCatalog(args.concern, args.step, scan.skinType).slice(0, 5);
          break;
        case "compare_progress": {
          const prev = history.filter((h) => h.id !== scan.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
          result = prev ? compareScans(prev, scan, []) : { note: "No previous scan yet." };
          break;
        }
        default:
          result = { error: "unknown tool" };
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }
  return { answer: "I couldn't finish that. Try asking in a simpler way.", trace };
}
