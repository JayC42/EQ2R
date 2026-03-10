import { useState, useRef, useCallback, useEffect } from "react";
import type { AnalysisResult } from "../types";
import { useAuth } from "./AuthProvider";
import { analyzeImage } from "../lib/api-client";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const LOADING_QUOTES = [
  "Converting confusion into clarity at the speed of light",
  "Scanning for equations, preparing analogies",
  "Detecting concepts, calibrating complexity levels",
  "Finding where this concept lives in the bigger picture of physics",
  "Asking Newton to hold on a second... or 9.8 m/s²",
  "Applying 3 laws of motion to your learning curve",
  "Consulting Feynman's ghost for the best analogy",
  "Running Schrödinger's explanation — both simple and complex until you read it",
  "Our rubber duck debugging session with quantum mechanics is wrapping up",
  "Technically by the time you read this, time has already passed. You're welcome.",
  "404: Intuition not found. Rebuilding from first principles.",
  "Borrowing a few joules of energy to power this explanation",
  "Normalizing the vector of your understanding to unit length",
  "Checking if your question violates conservation of energy... Negative proceeding.",
  "The Higgs field is giving your confusion some mass right now",
  "The math checks out. The intuition is still having an existential crisis.",
  "This explanation passed the 'explain it to a golden retriever' test. Mostly.",
  "Warning: this concept caused arguments at CERN. We've taken a side.",
  "Mapping concept to Feynman diagrams",
  "Calibrating explanation depth to your curiosity",
  "Untangling quantum superpositions, please hold",
  "Converting math into human intuition",
  "Simulating 1,000 thought experiments",
  "Cross-referencing Feynman, Einstein, and Hawking",
  "Bridging the gap between equations and reality",
];

interface Props {
  onResult: (result: AnalysisResult, imageUrl: string, imageFile: File) => void;
}

export default function ImageUploader({ onResult }: Props) {
  const { getIdToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [activeQuotes, setActiveQuotes] = useState<string[]>([]);

  useEffect(() => {
    if (status === "uploading") {
      const shuffled = [...LOADING_QUOTES].sort(() => 0.5 - Math.random());
      setActiveQuotes(shuffled);
      setQuoteIndex(0);

      const interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % shuffled.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const handleFile = useCallback((f: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError(`Unsupported file type: ${f.type}. Use JPEG, PNG, WebP, or GIF.`);
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  // ─── Drag & Drop Handlers ──────────────────────────────────────────────────
  // CRITICAL: Both onDragOver AND onDrop need preventDefault or the browser
  // will navigate to the file instead of allowing the drop.

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  // ─── Click to Browse ────────────────────────────────────────────────────────

  const handleZoneClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  // ─── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setError(null);

    try {
      const token = await getIdToken();
      const result = await analyzeImage(file, token || undefined);
      onResult(result, preview!, file!);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {/* Hidden file input — must be OUTSIDE the conditionally-rendered block
          so it persists and the ref is always valid */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, overflow: "hidden", pointerEvents: "none" }}
        onChange={handleInputChange}
        tabIndex={-1}
      />

      {!preview && (
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleZoneClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleZoneClick(); }}
        >
          {/* pointer-events: none on children so they don't steal drag events */}
          <div style={{ pointerEvents: "none" }}>
            <div className="icon">📸</div>
            <h3>Drop an image here</h3>
            <p>or click to browse — JPEG, PNG, WebP, GIF — max 10 MB</p>
          </div>
        </div>
      )}

      {preview && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <img src={preview} alt="Preview" className="image-preview" />
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.5rem 0" }}>
            {file?.name} ({((file?.size || 0) / 1024).toFixed(0)} KB)
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1rem" }}>
            {status !== "uploading" && (
              <>
                <button className="btn btn-primary" onClick={handleUpload}>
                  🔬 Analyze Physics
                </button>
                <button className="btn btn-secondary" onClick={reset}>
                  ✕ Clear
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {status === "uploading" && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Analyzing image with Gemini 3.1 Pro...</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem", color: "var(--text-muted)", minHeight: "2.4rem", transition: "opacity 0.3s ease" }}>
            {activeQuotes[quoteIndex] || "Identifying physics, building 5-level explanations"}
          </p>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem 1rem",
          background: "rgba(239, 83, 80, 0.1)",
          border: "1px solid rgba(239, 83, 80, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#EF5350",
          fontSize: "0.85rem"
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
