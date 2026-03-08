import { useState, useEffect, useCallback, useRef } from "react";
import { ttsService, type TTSState } from "../lib/tts-service";

interface Props {
  text: string;
  accentColor?: string;
}

/**
 * TTS playback button with animated waveform indicator.
 * Manages play/pause/resume lifecycle and auto-stops on unmount.
 */
export default function TTSButton({ text, accentColor = "var(--accent-primary)" }: Props) {
  const [state, setState] = useState<TTSState>("idle");
  const isActiveRef = useRef(false);

  // Track whether THIS button instance is the active speaker
  useEffect(() => {
    const handleStateChange = (newState: TTSState) => {
      if (isActiveRef.current) {
        setState(newState);
      }
    };
    ttsService.onStateChange(handleStateChange);
    return () => {
      // Stop if this button's audio is playing when unmounting
      if (isActiveRef.current) {
        ttsService.stop();
        isActiveRef.current = false;
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    if (state === "playing") {
      ttsService.pause();
    } else if (state === "paused") {
      ttsService.resume();
    } else {
      // idle — start new playback
      isActiveRef.current = true;
      ttsService.speak(text);
    }
  }, [state, text]);

  const handleStop = useCallback(() => {
    ttsService.stop();
    isActiveRef.current = false;
    setState("idle");
  }, []);

  const isActive = state !== "idle";
  const isPaused = state === "paused";

  return (
    <div className="tts-controls">
      <button
        className={`tts-btn ${isActive ? "tts-btn--active" : ""}`}
        onClick={handleClick}
        title={state === "playing" ? "Pause" : state === "paused" ? "Resume" : "Listen"}
        style={{
          "--tts-accent": accentColor,
        } as React.CSSProperties}
      >
        {state === "playing" ? "⏸" : state === "paused" ? "▶" : "🔊"}
        <span className="tts-btn-label">
          {state === "playing" ? "Pause" : state === "paused" ? "Resume" : "Listen"}
        </span>
      </button>

      {isActive && (
        <>
          {/* Waveform indicator */}
          <div className={`waveform-bars ${isPaused ? "waveform-bars--paused" : ""}`}>
            <span style={{ animationDelay: "0ms" }} />
            <span style={{ animationDelay: "150ms" }} />
            <span style={{ animationDelay: "300ms" }} />
            <span style={{ animationDelay: "200ms" }} />
            <span style={{ animationDelay: "100ms" }} />
          </div>

          {/* Stop button */}
          <button className="tts-stop-btn" onClick={handleStop} title="Stop">
            ⏹
          </button>
        </>
      )}
    </div>
  );
}
