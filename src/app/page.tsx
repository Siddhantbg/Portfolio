"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FifaMenuPanel } from "@/components/layout/FifaMenuPanel";
import { StadiumBackground } from "@/components/layout/StadiumBackground";
import { HomePanel } from "@/components/tiles/TabPanels/HomePanel";
import { CareerPanel } from "@/components/tiles/TabPanels/CareerPanel";
import { ProjectsPanel } from "@/components/tiles/TabPanels/ProjectsPanel";
import { AttributesPanel } from "@/components/tiles/TabPanels/AttributesPanel";
import { ClientAudioShell } from "@/components/audio/ClientAudioShell";
import { KickoffGateLoader } from "@/components/audio/KickoffGateLoader";
import { tabs, type TabId } from "@/data/portfolio";
import { playTabSwitchSound } from "@/lib/sfx";

const validTabs = new Set<TabId>(tabs.map((t) => t.id));

function isValidTab(value: string | null): value is TabId {
  return value !== null && validTabs.has(value as TabId);
}

function PortfolioShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<TabId>(
    isValidTab(tabParam) ? tabParam : "home",
  );
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const urlTab: TabId = isValidTab(tabParam) ? tabParam : "home";
    setActiveTab((prev) => (prev === urlTab ? prev : urlTab));
  }, [tabParam]);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (tab !== activeTabRef.current) {
        playTabSwitchSound();
      }
      activeTabRef.current = tab;
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "home") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="app-shell relative flex h-dvh max-h-dvh flex-col overflow-hidden">
      <StadiumBackground />

      <ClientAudioShell>
        <KickoffGateLoader />
        <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
          <Header />

          <main className="fifa-stage min-h-0 flex-1 overflow-hidden">
            <FifaMenuPanel activeTab={activeTab} onTabChange={handleTabChange}>
              <div className="flex min-h-0 flex-1 flex-col">
                {activeTab === "home" && (
                  <HomePanel onNavigate={handleTabChange} />
                )}
                {activeTab === "career" && <CareerPanel />}
                {activeTab === "projects" && <ProjectsPanel />}
                {activeTab === "attributes" && <AttributesPanel />}
              </div>
            </FifaMenuPanel>
          </main>
        </div>
      </ClientAudioShell>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center overflow-hidden bg-[#0a1628] text-white">
          Loading...
        </div>
      }
    >
      <PortfolioShell />
    </Suspense>
  );
}
