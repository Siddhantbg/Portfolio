"use client";

import { tabs, type TabId } from "@/data/portfolio";
import { useFifaNavigation } from "@/context/FifaNavigationContext";
import { cn } from "@/lib/cn";

interface NavTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  const { isTabFocused, setFocusToTab } = useFifaNavigation();

  return (
    <nav className="nav-bar" aria-label="Portfolio sections">
      <div className="nav-tabs-row">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isKeyboardFocused = isTabFocused(index);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFocusToTab(index);
                onTabChange(tab.id);
              }}
              className={cn(
                "nav-tab",
                isActive ? "nav-tab-active" : "nav-tab-inactive",
                isKeyboardFocused && "nav-tab-keyboard-focused",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
