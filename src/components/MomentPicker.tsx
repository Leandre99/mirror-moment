"use client";
import { MOMENTS, type Moment } from "@/lib/concerns";

const ICONS: Record<Moment, string> = { breakout: "\u{1F6A8}", buying: "\u{1F6CD}\uFE0F", working: "\u{1F4C8}", checkin: "\u{1FA9E}" };

export function MomentPicker({ onPick, hasHistory }: { onPick: (m: Moment) => void; hasHistory: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(MOMENTS) as Moment[]).map((m) => (
        <button key={m} onClick={() => onPick(m)} className="group flex items-start gap-4 rounded-3xl border border-stone-200 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md">
          <span className="text-3xl">{ICONS[m]}</span>
          <span>
            <span className="block font-semibold text-stone-900">{MOMENTS[m].title}</span>
            <span className="mt-0.5 block text-sm text-stone-500">
              {MOMENTS[m].sub}
              {m === "working" && !hasHistory ? " (your first scan becomes your baseline)" : ""}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
