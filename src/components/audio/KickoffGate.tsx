"use client";

import { useCallback, useEffect, useState } from "react";
import { useAudioPlayerOptional } from "@/context/AudioPlayerContext";
import { unlockUiSelectSound } from "@/lib/sfx";

const KICKOFF_KEY = "portfolio-kickoff";

/** Survives React Strict Mode remounts within the same page session. */
let kickoffDismissedInMemory = false;

function hasCompletedKickoff() {
  if (kickoffDismissedInMemory) return true;
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(KICKOFF_KEY) === "1";
  } catch {
    return false;
  }
}

export function KickoffGate() {
  const audio = useAudioPlayerOptional();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleStart = useCallback(() => {
    // Always hide first — never early-return while still covering the UI.
    kickoffDismissedInMemory = true;
    setVisible(false);
    unlockUiSelectSound();
    audio?.startWithUserGesture();
  }, [audio]);

  useEffect(() => {
    setMounted(true);
    if (hasCompletedKickoff()) {
      kickoffDismissedInMemory = true;
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !visible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      handleStart();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [handleStart, mounted, visible]);

  if (!mounted || !visible) return null;

  return (
    <button
      type="button"
      className="kickoff-gate"
      onClick={handleStart}
      aria-label="Press to start"
    >
      <div className="kickoff-gate-inner">
        <p className="kickoff-gate-eyebrow">FIFA 14</p>
        <h2 className="kickoff-gate-title">Siddhant Bhagat</h2>
        <p className="kickoff-gate-prompt">Press Enter or Click to Start</p>
        <span className="kickoff-gate-pulse" aria-hidden />
      </div>
    </button>
  );
}
