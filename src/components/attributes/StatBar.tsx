"use client";

interface StatBarProps {
  label: string;
  value: number;
}

export function StatBar({ label, value }: StatBarProps) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#444]">
          {label}
        </span>
        <span className="text-[11px] font-bold text-[#2e7d32]">{value}</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
