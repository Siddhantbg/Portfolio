"use client";

import { careerAttributes, careerStatistics } from "@/data/portfolio";
import { useFifaNavigationOptional } from "@/context/FifaNavigationContext";
import { HireMeCard } from "@/components/career/HireMeCard";
import { CareerStatistics } from "@/components/career/CareerStatistics";
import { CareerStatBar } from "@/components/career/CareerStatBar";
import { CareerProfileInfo } from "@/components/career/CareerProfileInfo";
import { CareerModelPanel } from "@/components/career/CareerModelPanel";
import { playUiSelectSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

export function CareerPanel() {
  const nav = useFifaNavigationOptional();
  const isFocused = (index: number) => nav?.isTileFocused(index) ?? false;

  return (
    <div className="career-pro-board tile-board">
      <div className="career-pro-grid fifa-tile-grid">
        <div className="career-left-half">
          <HireMeCard navIndex={0} focused={isFocused(0)} />

          <div className="career-left-lower">
            <section
              data-fifa-tile-index={1}
              className={cn(
                "career-panel career-panel-statistics",
                isFocused(1) && "fifa-tile-keyboard-focused",
              )}
              onMouseEnter={() => nav?.setFocusToTile(1)}
              onClick={() => playUiSelectSound()}
            >
              <h3 className="career-panel-title">STATISTICS</h3>
              <CareerStatistics stats={careerStatistics} />
            </section>

            <section
              data-fifa-tile-index={2}
              className={cn(
                "career-panel career-panel-attributes",
                isFocused(2) && "fifa-tile-keyboard-focused",
              )}
              onMouseEnter={() => nav?.setFocusToTile(2)}
              onClick={() => playUiSelectSound()}
            >
              <h3 className="career-panel-title">ATTRIBUTES</h3>
              <div className="career-attributes-list">
                {careerAttributes.map((attr) => (
                  <CareerStatBar
                    key={attr.label}
                    label={attr.label}
                    value={attr.value}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        <div
          className="career-right-half"
          onMouseEnter={() => nav?.setFocusToTile(3)}
          onClick={() => playUiSelectSound()}
        >
          <CareerProfileInfo navIndex={3} focused={isFocused(3)} />
          <CareerModelPanel />
        </div>
      </div>
    </div>
  );
}
