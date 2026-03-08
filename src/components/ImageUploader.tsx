import { useState, useRef, useCallback } from "react";
import type { AnalysisResult } from "../types";
import { useAuth } from "./AuthProvider";
import { analyzeImage } from "../lib/api-client";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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
          <p>Analyzing image with Gemini 2.5 Pro...</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem", color: "var(--text-muted)" }}>
            Identifying physics, building 5-level explanations
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
