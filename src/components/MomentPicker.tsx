"use client";
import { MOMENTS, type Moment } from "@/lib/concerns";
import { BagIcon, BoltIcon, ChartIcon, MirrorIcon } from "./icons";

const ICONS: Record<Moment, (p: { className?: string }) => JSX.Element> = { breakout: BoltIcon, buying: BagIcon, working: ChartIcon, checkin: MirrorIcon };

export function MomentPicker({ onPick, hasHistory }: { onPick: (m: Moment) => void; hasHistory: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(MOMENTS) as Moment[]).map((m) => (
        <button key={m} onClick={() => onPick(m)} className="group flex items-start gap-4 rounded-3xl border border-stone-200 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">{ICONS[m]({ className: "h-5 w-5" })}</span>
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
