import { useEffect, useCallback } from "react";
import type { AnalysisResult } from "../types";
import LessonResult from "./LessonResult";

interface Props {
  result: AnalysisResult;
  iconUrl?: string;
  onClose: () => void;
}

export default function LessonModal({ result, iconUrl, onClose }: Props) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <LessonResult result={result} iconUrl={iconUrl} compact />
      </div>
    </div>
  );
}
