"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioPlayerOptional } from "@/context/AudioPlayerContext";
import { AudioEqualizer } from "@/components/audio/AudioEqualizer";
import { AudioControlPanel } from "@/components/audio/AudioControlPanel";
import { cn } from "@/lib/cn";

export function HeaderAudio() {
  const audio = useAudioPlayerOptional();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!audio) {
    return (
      <div className="audio-trigger flex items-center gap-2 rounded-full px-3 py-2 md:px-4">
        <AudioEqualizer active={false} />
      </div>
    );
  }

  const { isPlaying, isMuted } = audio;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "audio-trigger flex items-center gap-2 rounded-full px-3 py-2 transition md:px-4",
          open && "audio-trigger-open",
        )}
        aria-label="Music player"
        aria-expanded={open}
      >
        <AudioEqualizer active={isPlaying && !isMuted} />
        <span className="hidden text-[10px] font-bold uppercase tracking-widest text-white/90 sm:inline">
          Now Playing
        </span>
      </button>

      <AudioControlPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
