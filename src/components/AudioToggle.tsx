"use client";

import { useState, useEffect, useRef } from "react";
import { Music, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper: Get and set persisted audio state in localStorage
const AUDIO_KEY = "audio-playing";

function getPersistedAudio(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(AUDIO_KEY) === "true";
  } catch {
    return false;
  }
}

function setPersistedAudio(val: boolean) {
  try {
    localStorage.setItem(AUDIO_KEY, val ? "true" : "false");
  } catch {
    // ignore
  }
}

export function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // On mount: restore playing state
  useEffect(() => {
    audioRef.current = new Audio("/sound/background.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    // Restore playing state from localStorage
    if (getPersistedAudio()) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // When isPlaying changes, persist and play/pause
  useEffect(() => {
    setPersistedAudio(isPlaying);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current
        .play()
        .catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <button
      type="button"
      onClick={toggleAudio}
      className={cn(
        "relative inline-flex h-10 w-[50px] items-center rounded-full border-2 border-border transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isPlaying ? "bg-primary" : "bg-muted"
      )}
      aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
      aria-pressed={isPlaying}
    >
      {/* Toggle Switch Circle */}
      <span
        className={cn(
          "absolute flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-md transition-all duration-300 ease-in-out",
          isPlaying ? "translate-x-[22px]" : "translate-x-1"    
        )}
      >
        {isPlaying ? (
          <Music className="h-4 w-4 text-primary" aria-hidden="true" />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
