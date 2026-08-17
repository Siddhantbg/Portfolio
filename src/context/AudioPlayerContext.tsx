"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { playlist, type PlaylistTrack } from "@/data/playlist";
import { shuffleCycle } from "@/lib/shuffle";

const KICKOFF_KEY = "portfolio-kickoff";

interface AudioPlayerContextValue {
  currentTrack: PlaylistTrack;
  trackIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  autoplayBlocked: boolean;
  progress: number;
  duration: number;
  audioRef: RefObject<HTMLAudioElement | null>;
  togglePlay: () => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  startPlayback: () => void;
  startWithUserGesture: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return ctx;
}

export function useAudioPlayerOptional() {
  return useContext(AudioPlayerContext);
}

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const playOrderRef = useRef<number[]>([]);
  const orderPosRef = useRef(0);
  const initRef = useRef(false);
  const kickoffCompleteRef = useRef(false);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [initialSrc, setInitialSrc] = useState(playlist[0]?.src ?? "");

  const currentTrack = playlist[trackIndex];

  const markPlaying = useCallback(() => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    setAutoplayBlocked(false);
  }, []);

  const markPaused = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, []);

  const playFromGesture = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return false;

    audio.muted = false;
    setIsMuted(false);

    const result = audio.play();
    if (result !== undefined) {
      result
        .then(() => markPlaying())
        .catch(() => {
          setAutoplayBlocked(true);
          markPaused();
        });
    }
    return true;
  }, [markPaused, markPlaying]);

  const attemptAutoplay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = false;
    setIsMuted(false);

    try {
      await audio.play();
      markPlaying();
      return;
    } catch {
      audio.muted = true;
      setIsMuted(true);
    }

    try {
      await audio.play();
      markPlaying();
      setAutoplayBlocked(true);
    } catch {
      setAutoplayBlocked(true);
      markPaused();
    }
  }, [markPaused, markPlaying]);

  const startWithUserGesture = useCallback(() => {
    kickoffCompleteRef.current = true;
    sessionStorage.setItem(KICKOFF_KEY, "1");
    playFromGesture();
  }, [playFromGesture]);

  const startPlayback = useCallback(() => {
    playFromGesture();
  }, [playFromGesture]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    markPaused();
  }, [markPaused]);

  const loadTrackAt = useCallback(
    (index: number, shouldPlay: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;
      const track = playlist[index];
      if (!track) return;

      trackIndexRef.current = index;
      setTrackIndex(index);
      setProgress(0);
      audio.src = track.src;
      audio.load();

      if (shouldPlay) {
        if (!kickoffCompleteRef.current) return;
        void attemptAutoplay();
      } else {
        pause();
      }
    },
    [attemptAutoplay, pause],
  );

  const advancePlayOrder = useCallback((direction: 1 | -1) => {
    const length = playlist.length;
    if (length === 0) return trackIndexRef.current;

    if (playOrderRef.current.length !== length) {
      playOrderRef.current = shuffleCycle(length);
      orderPosRef.current = 0;
    }

    const currentIndex = playOrderRef.current[orderPosRef.current];
    let nextPos = orderPosRef.current + direction;

    if (nextPos >= length) {
      // Full cycle done — new shuffle, never start with the song just played.
      playOrderRef.current = shuffleCycle(length, currentIndex);
      nextPos = 0;
    } else if (nextPos < 0) {
      nextPos = length - 1;
    }

    orderPosRef.current = nextPos;
    return playOrderRef.current[nextPos];
  }, []);

  const nextTrack = useCallback(() => {
    const next = advancePlayOrder(1);
    loadTrackAt(next, isPlayingRef.current);
  }, [advancePlayOrder, loadTrackAt]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = advancePlayOrder(-1);
    loadTrackAt(prev, isPlayingRef.current);
  }, [advancePlayOrder, loadTrackAt]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) pause();
    else playFromGesture();
  }, [pause, playFromGesture]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
    if (!audio.muted) setAutoplayBlocked(false);
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    kickoffCompleteRef.current =
      typeof window !== "undefined" &&
      sessionStorage.getItem(KICKOFF_KEY) === "1";

    const order = shuffleCycle(playlist.length);
    playOrderRef.current = order;
    orderPosRef.current = 0;
    const firstTrackIndex = order[0];

    trackIndexRef.current = firstTrackIndex;
    setTrackIndex(firstTrackIndex);
    setInitialSrc(playlist[firstTrackIndex].src);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !initialSrc) return;

    audio.volume = 0.55;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => nextTrack();
    const onPlay = () => markPlaying();
    const onPause = () => markPaused();
    const onCanPlay = () => {
      if (kickoffCompleteRef.current) void attemptAutoplay();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplay", onCanPlay);

    if (
      kickoffCompleteRef.current &&
      audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
    ) {
      void attemptAutoplay();
    }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [attemptAutoplay, initialSrc, markPaused, markPlaying, nextTrack]);

  const value: AudioPlayerContextValue = {
    currentTrack,
    trackIndex,
    isPlaying,
    isMuted,
    autoplayBlocked,
    progress,
    duration,
    audioRef,
    togglePlay,
    toggleMute,
    nextTrack,
    prevTrack,
    startPlayback,
    startWithUserGesture,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={initialSrc}
        preload="auto"
        playsInline
        className="hidden"
        onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
      />
      {children}
    </AudioPlayerContext.Provider>
  );
}
