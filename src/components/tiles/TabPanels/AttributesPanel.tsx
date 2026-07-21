"use client";

import {
  skillCategories,
  radarSkills,
  certifications,
  tools,
  languages,
} from "@/data/portfolio";
import { Tile } from "@/components/tiles/Tile";
import { TileGrid } from "@/components/tiles/TileGrid";
import { StatBar } from "@/components/attributes/StatBar";
import { SkillRadar } from "@/components/attributes/SkillRadar";

export function AttributesPanel() {
  return (
    <TileGrid variant="attributes">
      <Tile
        title="PLAYER STATS"
        variant="panel"
        className="tile-area-radar h-full min-h-0"
        navIndex={0}
        watermark="STATS"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SkillRadar data={radarSkills} />
        </div>
      </Tile>

      <div className="tile-area-stats">
          {skillCategories.map((category, catIndex) => (
          <Tile
            key={category.id}
            title={category.name}
            variant="card"
            className="min-h-0"
            navIndex={catIndex + 1}
          >
            {category.stats.slice(0, 3).map((stat) => (
              <StatBar
                key={stat.label}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </Tile>
        ))}
      </div>

      <Tile
        title="CERTIFICATIONS"
        variant="panel"
        className="tile-area-certs"
        navIndex={5}
      >
        <div className="grid gap-2 md:grid-cols-2">
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className="border border-black/8 bg-white/45 p-3"
            >
              <p className="text-sm font-bold text-[#222]">{cert.name}</p>
              <p className="text-xs text-[#555]">
                {cert.issuer} · {cert.date}
              </p>
            </div>
          ))}
        </div>
      </Tile>

      <Tile
        title="TOOLS & LANGUAGES"
        variant="panel"
        className="tile-area-tools"
        navIndex={6}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#666]">
              Tools
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t) => (
                <span key={t} className="fifa-link-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#666]">
              Languages
            </p>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <span
                  key={l}
                  className="fifa-link-chip bg-[#1e5a9e]/12 text-[#1e5a9e]"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Tile>
    </TileGrid>
  );
}
