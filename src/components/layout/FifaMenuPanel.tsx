"use client";

import type { ReactNode } from "react";
import { FifaNavigationProvider } from "@/context/FifaNavigationContext";
import { NavTabs } from "@/components/layout/NavTabs";
import { TileSelectSfx } from "@/components/audio/TileSelectSfx";
import type { TabId } from "@/data/portfolio";

interface FifaMenuPanelProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
}

export function FifaMenuPanel({
  activeTab,
  onTabChange,
  children,
}: FifaMenuPanelProps) {
  return (
    <FifaNavigationProvider activeTab={activeTab} onTabChange={onTabChange}>
      <TileSelectSfx />
      <div className="fifa-menu-panel">
        <NavTabs activeTab={activeTab} onTabChange={onTabChange} />
        <div className="fifa-menu-content min-h-0 flex-1">{children}</div>
      </div>
    </FifaNavigationProvider>
  );
}
