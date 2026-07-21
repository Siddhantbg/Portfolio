import type { RoleBreakdown } from "@/data/portfolio";

interface RoleDonutChartProps {
  segments: RoleBreakdown[];
  centerLabel?: string;
  variant?: "default" | "fifa";
}

export function RoleDonutChart({
  segments,
  centerLabel,
  variant = "default",
}: RoleDonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.percent, 0) || 100;
  const dominant = segments.reduce((best, item) =>
    item.percent > best.percent ? item : best,
  );
  let cumulative = 0;

  const slices = segments.map((segment) => {
    const start = (cumulative / total) * 360;
    cumulative += segment.percent;
    const end = (cumulative / total) * 360;
    return { ...segment, start, end };
  });

  function polar(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  }

  function arcPath(start: number, end: number, outerR: number, innerR: number) {
    const largeArc = end - start > 180 ? 1 : 0;
    const oStart = polar(start, outerR);
    const oEnd = polar(end, outerR);
    const iEnd = polar(end, innerR);
    const iStart = polar(start, innerR);

    return [
      `M ${oStart.x} ${oStart.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oEnd.x} ${oEnd.y}`,
      `L ${iEnd.x} ${iEnd.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
      "Z",
    ].join(" ");
  }

  const centerPrimary =
    centerLabel ?? dominant.label.split(" / ")[0]?.toUpperCase() ?? "MLE";
  const centerSecondary = `${dominant.percent}%`;

  if (variant === "fifa") {
    return (
      <div className="career-donut-fifa">
        <p className="career-donut-fifa-heading">Roles Focus</p>
        <svg viewBox="0 0 100 100" className="career-donut-fifa-chart" aria-hidden>
          {slices.map((slice) => (
            <path
              key={slice.label}
              d={arcPath(slice.start, slice.end, 44, 30)}
              fill={slice.color}
            />
          ))}
          <circle cx="50" cy="50" r="26" fill="rgba(255,255,255,0.96)" />
          <text
            x="50"
            y="47"
            textAnchor="middle"
            className="career-donut-fifa-center-main"
          >
            {centerPrimary}
          </text>
          <text
            x="50"
            y="58"
            textAnchor="middle"
            className="career-donut-fifa-center-sub"
          >
            {centerSecondary}
          </text>
        </svg>
        <ul className="career-donut-fifa-legend">
          {segments.map((segment) => (
            <li key={segment.label}>
              <span
                className="career-donut-swatch"
                style={{ backgroundColor: segment.color }}
              />
              <span>{segment.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="career-donut-wrap">
      <p className="career-donut-heading">Roles Focus</p>
      <div className="career-donut-layout">
        <svg viewBox="0 0 100 100" className="career-donut-chart" aria-hidden>
          {slices.map((slice) => (
            <path
              key={slice.label}
              d={arcPath(slice.start, slice.end, 42, 28)}
              fill={slice.color}
            />
          ))}
          <circle cx="50" cy="50" r="24" fill="rgba(255,255,255,0.92)" />
          <text
            x="50"
            y="48"
            textAnchor="middle"
            className="career-donut-center-label"
          >
            {centerPrimary}
          </text>
          <text
            x="50"
            y="58"
            textAnchor="middle"
            className="career-donut-center-sub"
          >
            {centerSecondary}
          </text>
        </svg>
        <ul className="career-donut-legend">
          {segments.map((segment) => (
            <li key={segment.label}>
              <span
                className="career-donut-swatch"
                style={{ backgroundColor: segment.color }}
              />
              <span className="career-donut-legend-label">{segment.label}</span>
              <span className="career-donut-legend-pct">{segment.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
