import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-stone-200/70 bg-white/80 p-5 shadow-sm backdrop-blur ${className}`}>{children}</div>;
}

export function Pill({ children, tone = "stone" }: { children: ReactNode; tone?: "stone" | "good" | "ok" | "focus" | "rose" }) {
  const t = {
    stone: "bg-stone-100 text-stone-700",
    good: "bg-emerald-50 text-emerald-700",
    ok: "bg-amber-50 text-amber-700",
    focus: "bg-rose-50 text-rose-700",
    rose: "bg-rose-600 text-white",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t}`}>{children}</span>;
}

export function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline"; disabled?: boolean; className?: string; type?: "button" | "submit" }) {
  const v = {
    primary: "bg-stone-900 text-white hover:bg-stone-800",
    outline: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50",
    ghost: "text-stone-600 hover:bg-stone-100",
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}>
      {children}
    </button>
  );
}

export function ScoreRing({ value, size = 88, label }: { value: number; size?: number; label?: string }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? "#059669" : value >= 65 ? "#d97706" : "#e11d48";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e7e5e4" strokeWidth={7} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-semibold text-stone-900">{value}</div>
        {label && <div className="text-[10px] uppercase tracking-wide text-stone-500">{label}</div>}
      </div>
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}
