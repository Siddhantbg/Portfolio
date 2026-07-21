import type { CareerStatistic } from "@/data/portfolio";

interface CareerStatisticsProps {
  stats: CareerStatistic[];
}

export function CareerStatistics({ stats }: CareerStatisticsProps) {
  return (
    <div className="career-statistics">
      {stats.map((stat) => (
        <div key={stat.label} className="career-statistics-row">
          <span className="career-statistics-label">{stat.label}</span>
          <span className="career-statistics-value">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
