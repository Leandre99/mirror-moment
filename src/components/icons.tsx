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
export const SparkIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m12 8 1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z" /></svg>
);
export const CameraIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
export const UploadIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></svg>
);
export const ShieldIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const ChatIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M5 5h14v10H9l-4 4z" /><path d="M9 10h6" /></svg>
);
export const PaletteIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.2-1.6-1.2-2.8 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></svg>
);
export const ArrowIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const CheckIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="m5 12 4 4 10-10" /></svg>
);
