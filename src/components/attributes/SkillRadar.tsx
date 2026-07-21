"use client";

import type { RadarSkill } from "@/data/portfolio";

interface SkillRadarProps {
  data: RadarSkill[];
}

export function SkillRadar({ data }: SkillRadarProps) {
  const size = 220;
  const center = size / 2;
  const radius = size * 0.34;
  const maxValue = data[0]?.fullMark ?? 99;
  const levels = [0.25, 0.5, 0.75, 1];

  const angleFor = (index: number) =>
    (Math.PI * 2 * index) / data.length - Math.PI / 2;

  const pointAt = (index: number, value: number) => {
    const angle = angleFor(index);
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = data
    .map((item, index) => {
      const { x, y } = pointAt(index, item.value);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full max-h-[200px] w-full max-w-[220px]"
        role="img"
        aria-label="Skill radar chart"
      >
        {levels.map((level) => (
          <polygon
            key={level}
            points={data
              .map((_, index) => {
                const { x, y } = pointAt(index, maxValue * level);
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="1"
          />
        ))}

        {data.map((item, index) => {
          const outer = pointAt(index, maxValue);
          return (
            <line
              key={item.subject}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={dataPoints}
          fill="rgba(76, 175, 80, 0.45)"
          stroke="#2e7d32"
          strokeWidth="2"
        />

        {data.map((item, index) => {
          const label = pointAt(index, maxValue * 1.18);
          return (
            <text
              key={item.subject}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#444"
              fontSize="10"
              fontWeight="600"
            >
              {item.subject}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
