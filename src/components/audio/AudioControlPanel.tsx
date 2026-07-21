"use client";

import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { cn } from "@/lib/cn";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface AudioControlPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AudioControlPanel({ open, onClose }: AudioControlPanelProps) {
  const {
    currentTrack,
    isPlaying,
    isMuted,
    autoplayBlocked,
    progress,
    duration,
    togglePlay,
    toggleMute,
    nextTrack,
    prevTrack,
    startPlayback,
  } = useAudioPlayer();

  if (!open) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="audio-panel absolute right-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-md border border-white/20 bg-[#121212]/95 shadow-2xl backdrop-blur-xl">
      <div className="audio-panel-accent" />

      <div className="relative p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="audio-panel-art">
            <span>♫</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {currentTrack.title}
            </p>
            <p className="truncate text-xs text-white/55">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {autoplayBlocked && (
          <button
            type="button"
            onClick={startPlayback}
            className="mb-3 w-full rounded-sm bg-[#1db954] px-3 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-[#1ed760]"
          >
            Tap to unmute
          </button>
        )}

        <div className="mb-3">
          <div className="audio-panel-progress">
            <div
              className="audio-panel-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-white/45">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prevTrack}
            className="audio-panel-btn"
            aria-label="Previous track"
          >
            ⏮
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="audio-panel-btn audio-panel-btn-main"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            className="audio-panel-btn"
            aria-label="Next track"
          >
            ⏭
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className={cn(
              "audio-panel-btn",
              isMuted && "audio-panel-btn-muted",
            )}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-center text-[10px] uppercase tracking-widest text-white/35 transition hover:text-white/60"
        >
          Close
        </button>
      </div>
    </div>
  );
}
