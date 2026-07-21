const UI_SELECT_SRC = "/sfx/tabsswitch.wav";

let sharedAudio: HTMLAudioElement | null = null;
let lastPlayAt = 0;
let unlocked = false;

function getSharedAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(UI_SELECT_SRC);
    sharedAudio.preload = "auto";
    sharedAudio.volume = 0.7;
  }
  return sharedAudio;
}

/** Unlock / warm the audio element on first user gesture. */
export function unlockUiSelectSound() {
  const audio = getSharedAudio();
  if (!audio || unlocked) return;
  unlocked = true;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
    })
    .catch(() => {
      unlocked = false;
    });
}

/** Short UI select sound (tabs, tiles, menus). */
export function playUiSelectSound() {
  if (typeof window === "undefined") return;

  const now = performance.now();
  // Keep hover/arrow cycling responsive while preventing duplicate fires.
  if (now - lastPlayAt < 70) return;
  lastPlayAt = now;

  try {
    const audio = getSharedAudio();
    if (!audio) return;

    unlocked = true;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.7;
    void audio.play().catch(() => {
      // Fallback: fresh instance if shared element is busy/stuck.
      const fallback = new Audio(UI_SELECT_SRC);
      fallback.volume = 0.7;
      void fallback.play().catch(() => {});
    });
  } catch {
    // Ignore playback errors.
  }
}

/** @deprecated Use playUiSelectSound */
export const playTabSwitchSound = playUiSelectSound;
