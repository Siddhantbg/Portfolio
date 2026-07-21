"use client";

function barColor(value: number) {
  if (value >= 90) return "#4caf50";
  if (value >= 80) return "#8bc34a";
  if (value >= 70) return "#ffc107";
  return "#ff9800";
}

interface CareerStatBarProps {
  label: string;
  value: number;
}

export function CareerStatBar({ label, value }: CareerStatBarProps) {
  const color = barColor(value);

  return (
    <div className="career-stat-row">
      <div className="career-stat-row-head">
        <span className="career-stat-label">{label}</span>
        <span className="career-stat-value" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="career-stat-track">
        <div
          className="career-stat-fill"
          style={{ backgroundColor: color, width: `${value}%` }}
        />
      </div>
    </div>
  );
}
