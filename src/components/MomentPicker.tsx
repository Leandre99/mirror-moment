"use client";
import { MOMENTS, type Moment } from "@/lib/concerns";
import { ArrowIcon, BagIcon, BoltIcon, ChartIcon, MirrorIcon } from "./icons";

const ICONS: Record<Moment, (p: { className?: string }) => JSX.Element> = { breakout: BoltIcon, buying: BagIcon, working: ChartIcon, checkin: MirrorIcon };
const TAGS: Record<Moment, string> = { breakout: "Calm plan in 7 days", buying: "Buy / skip verdict", working: "Before vs. after", checkin: "Full skin read" };

export function MomentPicker({ onPick, hasHistory }: { onPick: (m: Moment) => void; hasHistory: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(Object.keys(MOMENTS) as Moment[]).map((m) => {
        const Icon = ICONS[m];
        return (
          <button key={m} onClick={() => onPick(m)} className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-6 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:border-clay-200 hover:shadow-lift">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay-50 text-clay-600 transition group-hover:bg-clay-600 group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-lg font-semibold text-ink">{MOMENTS[m].title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-stone-500">
                {MOMENTS[m].sub}
                {m === "working" && !hasHistory ? ". Your first scan becomes your baseline." : ""}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-clay-600">
                {TAGS[m]} <ArrowIcon className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
