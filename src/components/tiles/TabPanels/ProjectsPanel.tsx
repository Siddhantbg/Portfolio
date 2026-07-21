"use client";

import { projects } from "@/data/portfolio";
import { Tile } from "@/components/tiles/Tile";
import { TileGrid } from "@/components/tiles/TileGrid";

export function ProjectsPanel() {
  return (
    <TileGrid variant="projects">
      {projects.map((project, index) => (
        <Tile
          key={project.id}
          navIndex={index}
          title={project.title}
          variant="panel"
          subtitle={`${project.period} · ${project.stack.slice(0, 3).join(" · ")}`}
          description={project.highlights[0]}
          href={project.links.github ?? project.links.paper}
        >
          {project.metrics && (
            <div className="flex flex-wrap gap-1.5">
              {project.metrics.map((m) => (
                <span
                  key={m}
                  className="fifa-link-chip bg-[#1e5a9e]/12 text-[#1e5a9e]"
                >
                  {m}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#1e5a9e]">
            {project.links.github ? "View on GitHub →" : "View Paper →"}
          </p>
        </Tile>
      ))}
    </TileGrid>
  );
}
