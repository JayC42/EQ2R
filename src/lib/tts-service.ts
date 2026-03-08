/**
 * E2R — TTS Service Abstraction
 * Provides a swappable text-to-speech provider interface.
 * Default: Browser Web Speech API (free, no API keys).
 * Swap to Google Cloud TTS or ElevenLabs by implementing TTSProvider.
 */

// ─── Provider Interface ──────────────────────────────────────────────────────

export type TTSState = "idle" | "playing" | "paused";

export interface TTSProvider {
  speak(text: string): void;
  pause(): void;
  resume(): void;
  stop(): void;
  getState(): TTSState;
  onStateChange(callback: (state: TTSState) => void): void;
}

// ─── Browser Web Speech API Provider ─────────────────────────────────────────

class BrowserTTSProvider implements TTSProvider {
  private utterance: SpeechSynthesisUtterance | null = null;
  private state: TTSState = "idle";
  private stateCallback: ((state: TTSState) => void) | null = null;

  private setState(newState: TTSState) {
    this.state = newState;
    this.stateCallback?.(newState);
  }

  speak(text: string): void {
    // Stop any existing playback
    this.stop();

    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Web Speech API not available");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to pick a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Google")
    ) || voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => this.setState("playing");
    utterance.onpause = () => this.setState("paused");
    utterance.onresume = () => this.setState("playing");
    utterance.onend = () => {
      this.utterance = null;
      this.setState("idle");
    };
    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        console.warn("TTS error:", e.error);
      }
      this.utterance = null;
      this.setState("idle");
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
    this.setState("playing");
  }

  pause(): void {
    window.speechSynthesis?.pause();
    this.setState("paused");
  }

  resume(): void {
    window.speechSynthesis?.resume();
    this.setState("playing");
  }

  stop(): void {
    window.speechSynthesis?.cancel();
    this.utterance = null;
    this.setState("idle");
  }

  getState(): TTSState {
    return this.state;
  }

  onStateChange(callback: (state: TTSState) => void): void {
    this.stateCallback = callback;
  }
}

// ─── Singleton Export ────────────────────────────────────────────────────────
// Swap provider here to change TTS engine globally:

export const ttsService: TTSProvider = new BrowserTTSProvider();
