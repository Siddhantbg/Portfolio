"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { tabs, type TabId } from "@/data/portfolio";
import {
  activateFocusedTile,
  getNextTileIndex,
  TILE_COUNTS,
  type FocusZone,
  type NavDirection,
} from "@/lib/fifa-navigation";
import { playUiSelectSound } from "@/lib/sfx";

interface FifaNavigationContextValue {
  focusZone: FocusZone;
  tabIndex: number;
  tileIndex: number;
  isTileFocused: (index: number) => boolean;
  isTabFocused: (index: number) => boolean;
  setFocusToTab: (index: number) => void;
  setFocusToTile: (index: number) => void;
}

const FifaNavigationContext = createContext<FifaNavigationContextValue | null>(
  null,
);

export function useFifaNavigation() {
  const ctx = useContext(FifaNavigationContext);
  if (!ctx) {
    throw new Error("useFifaNavigation must be used within FifaNavigationProvider");
  }
  return ctx;
}

export function useFifaNavigationOptional() {
  return useContext(FifaNavigationContext);
}

interface FifaNavigationProviderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
}

export function FifaNavigationProvider({
  activeTab,
  onTabChange,
  children,
}: FifaNavigationProviderProps) {
  const [focusZone, setFocusZone] = useState<FocusZone>("tabs");
  const [tabIndex, setTabIndex] = useState(() =>
    tabs.findIndex((t) => t.id === activeTab),
  );
  const [tileIndex, setTileIndex] = useState(0);

  const focusZoneRef = useRef<FocusZone>("tabs");
  const tabIndexRef = useRef(tabIndex);
  const tileIndexRef = useRef(0);
  const activeTabRef = useRef(activeTab);
  const onTabChangeRef = useRef(onTabChange);

  useEffect(() => {
    onTabChangeRef.current = onTabChange;
  }, [onTabChange]);

  useEffect(() => {
    activeTabRef.current = activeTab;
    const idx = tabs.findIndex((t) => t.id === activeTab);
    if (idx >= 0) {
      tabIndexRef.current = idx;
      setTabIndex(idx);
    }
    tileIndexRef.current = 0;
    setTileIndex(0);
  }, [activeTab]);

  useEffect(() => {
    focusZoneRef.current = focusZone;
  }, [focusZone]);

  useEffect(() => {
    tabIndexRef.current = tabIndex;
  }, [tabIndex]);

  useEffect(() => {
    tileIndexRef.current = tileIndex;
  }, [tileIndex]);

  const switchTab = useCallback((next: number) => {
    if (next < 0 || next >= tabs.length || next === tabIndexRef.current) return;
    tabIndexRef.current = next;
    setTabIndex(next);
    tileIndexRef.current = 0;
    setTileIndex(0);
    onTabChangeRef.current(tabs[next].id);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    const directionMap: Partial<Record<string, NavDirection>> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };

    const direction = directionMap[event.key];
    if (!direction) {
      if (event.key === "Enter" && focusZoneRef.current === "tiles") {
        event.preventDefault();
        activateFocusedTile(tileIndexRef.current);
      }
      return;
    }

    event.preventDefault();

    if (focusZoneRef.current === "tabs") {
      if (direction === "down") {
        focusZoneRef.current = "tiles";
        setFocusZone("tiles");
        tileIndexRef.current = 0;
        setTileIndex(0);
        playUiSelectSound();
        return;
      }

      if (direction === "left") {
        switchTab(tabIndexRef.current - 1);
        return;
      }

      if (direction === "right") {
        switchTab(tabIndexRef.current + 1);
        return;
      }

      return;
    }

    const currentTab = activeTabRef.current;
    const currentTile = tileIndexRef.current;
    const nextTile = getNextTileIndex(currentTab, currentTile, direction);

    if (nextTile !== null) {
      tileIndexRef.current = nextTile;
      setTileIndex(nextTile);
      playUiSelectSound();
      return;
    }

    if (direction === "up") {
      focusZoneRef.current = "tabs";
      setFocusZone("tabs");
      const idx = tabs.findIndex((t) => t.id === currentTab);
      if (idx >= 0) {
        tabIndexRef.current = idx;
        setTabIndex(idx);
      }
      playUiSelectSound();
      return;
    }

    if (direction === "left") {
      switchTab(tabIndexRef.current - 1);
      return;
    }

    if (direction === "right") {
      switchTab(tabIndexRef.current + 1);
      return;
    }

    if (direction === "down") {
      const count = TILE_COUNTS[currentTab];
      const next = Math.min(count - 1, currentTile + 1);
      if (next !== currentTile) {
        tileIndexRef.current = next;
        setTileIndex(next);
        playUiSelectSound();
      }
    }
  }, [switchTab]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const setFocusToTab = useCallback((index: number) => {
    focusZoneRef.current = "tabs";
    setFocusZone("tabs");
    tabIndexRef.current = index;
    setTabIndex(index);
  }, []);

  const setFocusToTile = useCallback((index: number) => {
    const changed =
      focusZoneRef.current !== "tiles" || tileIndexRef.current !== index;
    focusZoneRef.current = "tiles";
    setFocusZone("tiles");
    tileIndexRef.current = index;
    setTileIndex(index);
    if (changed) playUiSelectSound();
  }, []);

  const value: FifaNavigationContextValue = {
    focusZone,
    tabIndex,
    tileIndex,
    isTileFocused: (index) => focusZone === "tiles" && tileIndex === index,
    isTabFocused: (index) => focusZone === "tabs" && tabIndex === index,
    setFocusToTab,
    setFocusToTile,
  };

  return (
    <FifaNavigationContext.Provider value={value}>
      {children}
    </FifaNavigationContext.Provider>
  );
}
