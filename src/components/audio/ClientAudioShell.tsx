"use client";

import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import type { ReactNode } from "react";

interface ClientAudioShellProps {
  children: ReactNode;
}

export function ClientAudioShell({ children }: ClientAudioShellProps) {
  return <AudioPlayerProvider>{children}</AudioPlayerProvider>;
}
