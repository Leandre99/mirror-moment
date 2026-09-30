type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

export const BoltIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>
);
export const BagIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const ChartIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M4 20V4" /><path d="M4 20h16" /><path d="m7 15 4-4 3 3 5-6" /></svg>
);
export const MirrorIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><ellipse cx="12" cy="10" rx="6" ry="8" /><path d="M12 18v4M8 22h8" /><path d="M9.5 7.5a3 3 0 0 1 2.5-1.5" /></svg>
);
export const SunIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const MoonIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
);
