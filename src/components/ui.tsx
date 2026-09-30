import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-stone-200/70 bg-white p-6 shadow-soft ${className}`}>{children}</div>;
}

export function Pill({ children, tone = "stone" }: { children: ReactNode; tone?: "stone" | "good" | "ok" | "focus" | "rose" }) {
  const t = {
    stone: "bg-stone-100 text-stone-700",
    good: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10",
    ok: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/10",
    focus: "bg-clay-50 text-clay-700 ring-1 ring-inset ring-clay-600/15",
    rose: "bg-clay-600 text-white",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${t}`}>{children}</span>;
}

export function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline" | "accent"; disabled?: boolean; className?: string; type?: "button" | "submit" }) {
  const v = {
    primary: "bg-ink text-white shadow-sm hover:bg-stone-800",
    accent: "bg-gradient-to-r from-clay-600 to-clay-500 text-white shadow-md shadow-clay-600/20 hover:from-clay-700 hover:to-clay-600",
    outline: "border border-stone-300 bg-white text-stone-800 hover:border-stone-400 hover:bg-stone-50",
    ghost: "text-stone-600 hover:bg-stone-100",
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}>
      {children}
    </button>
  );
}

export function ScoreRing({ value, size = 88, label, stroke = 7 }: { value: number; size?: number; label?: string; stroke?: number }) {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? "#059669" : value >= 65 ? "#d97706" : "#B9614A";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f0ebe6" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-medium leading-none text-ink" style={{ fontSize: size / 3.6 }}>
          {value}
        </div>
        {label && <div className="mt-1 text-[10px] font-medium uppercase tracking-widest text-stone-500">{label}</div>}
      </div>
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function SectionTitle({ eyebrow, title, sub, center }: { eyebrow?: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-medium text-ink sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base leading-relaxed text-stone-600">{sub}</p>}
    </div>
  );
}
