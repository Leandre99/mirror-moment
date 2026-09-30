"use client";
import { useState } from "react";
import type { SkinScan } from "@/lib/concerns";
import { agent } from "@/lib/client";
import { Button, Card, Spinner } from "./ui";

type Msg = { role: "user" | "assistant"; content: string; trace?: string[] };

const SUGGESTIONS = ["Is my routine working?", "Can I use retinol right now?", "What should I do about my pores?", "Should I buy a vitamin C serum?"];

export function CoachChat({ scan, history }: { scan: SkinScan; history: SkinScan[] }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question = q) {
    if (!question.trim()) return;
    const next = [...msgs, { role: "user" as const, content: question }];
    setMsgs(next);
    setQ("");
    setLoading(true);
    try {
      const r = await agent<{ answer: string; trace: string[] }>({ action: "chat", scan, history, question, chat: msgs.map(({ role, content }) => ({ role, content })) });
      setMsgs([...next, { role: "assistant", content: r.answer, trace: r.trace }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: (e as Error).message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="font-semibold text-stone-900">Ask your coach</h3>
      <p className="mt-1 text-sm text-stone-500">The agent can look up your scan, check products, search the catalog and compare your progress.</p>
      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-800"}`}>
              {m.content}
              {m.trace && m.trace.length > 0 && <div className="mt-1.5 text-[10px] uppercase tracking-wide text-stone-400">tools: {m.trace.join(" → ")}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-stone-400">
            <Spinner />
          </div>
        )}
      </div>
      {msgs.length === 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} className="rounded-full bg-clay-50 px-3 py-1 text-xs text-clay-700 hover:bg-clay-100">
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about your skin..." className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-clay-300" />
        <Button type="submit" disabled={loading || !q.trim()}>
          Send
        </Button>
      </form>
    </Card>
  );
}
