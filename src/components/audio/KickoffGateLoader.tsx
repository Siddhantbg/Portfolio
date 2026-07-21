"use client";

import dynamic from "next/dynamic";

const KickoffGate = dynamic(
  () => import("./KickoffGate").then((mod) => mod.KickoffGate),
  { ssr: false },
);

export function KickoffGateLoader() {
  return <KickoffGate />;
}
