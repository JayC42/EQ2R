import { useState, useEffect, useRef } from "react";
import type { AnalysisResult, LevelAlias } from "../types";
import { LEVEL_META } from "../types";
import { getDomainColor } from "../lib/domain-colors";
import katex from "katex";

interface Props {
  result: AnalysisResult;
  iconUrl?: string;
  sourceImageUrl?: string;
  compact?: boolean;
  onSave?: (result: AnalysisResult) => Promise<void>;
  saved?: boolean;
}

const LEVEL_ORDER: LevelAlias[] = ["child", "teen", "college", "grad", "expert"];

// ─── LaTeX Renderer ──────────────────────────────────────────────────────────

function LatexBlock({ latex }: { latex: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && latex) {
      try {
        const cleaned = latex.replace(/\\\\/g, "\\");
        katex.render(cleaned, ref.current, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        });
      } catch {
        if (ref.current) ref.current.textContent = latex;
      }
    }
  }, [latex]);

  return <div ref={ref} className="formula-display" />;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LessonResult({ result, iconUrl, sourceImageUrl, compact, onSave, saved }: Props) {
  const [activeLevel, setActiveLevel] = useState<LevelAlias>("child");
  const [saving, setSaving] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const domainColor = getDomainColor(result.graph_metadata_tags);
  const level = result.levels[activeLevel];
  const meta = LEVEL_META[activeLevel];

  const hasFormula = result.primary_formula !== null;
  const hasVariables = Object.keys(result.variable_definitions).length > 0;
  const isObservation = result.principle_name === "Observation";

  const handleSave = async () => {
    if (!onSave || saving || saved) return;
    setSaving(true);
    try {
      await onSave(result);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={compact ? "" : "card"} style={{ marginTop: compact ? 0 : "1.5rem" }}>
      {/* Observation Fallback Banner */}
      {isObservation && (
        <div style={{
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          background: "rgba(255, 183, 77, 0.1)",
          border: "1px solid rgba(255, 183, 77, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "var(--accent-secondary)",
          fontSize: "0.85rem",
        }}>
          ⚠️ <strong>Observation Only</strong> — No dominant physics phenomenon identified. Showing qualitative descriptions.
        </div>
      )}

      {/* Header */}
      <div className="result-header">
        {iconUrl ? (
          <img src={iconUrl} alt={result.principle_name} className="result-icon" />
        ) : sourceImageUrl ? (
          <div
            className="result-icon"
            onClick={() => setShowImagePopup(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              overflow: "hidden",
              cursor: "pointer",
              background: `${domainColor.primary}22`,
              borderColor: domainColor.primary,
            }}
            title="Click to enlarge"
          >
            <img
              src={sourceImageUrl}
              alt={result.observed_object}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "inherit",
              }}
            />
          </div>
        ) : (
          <div
            className="result-icon"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              background: `${domainColor.primary}22`,
              borderColor: domainColor.primary,
            }}
          >
            {isObservation ? "👁️" : "⚛️"}
          </div>
        )}
        <div>
          <h2>{result.principle_name}</h2>
          <div className="observed-object">Observed: {result.observed_object}</div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
        {result.graph_metadata_tags.map((tag) => (
          <span
            key={tag}
            className="tag-pill"
            style={{ borderColor: `${domainColor.primary}44`, color: domainColor.primary }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Level Tabs */}
      <div className="tabs">
        {LEVEL_ORDER.map((key) => (
          <button
            key={key}
            className={`tab ${activeLevel === key ? "active" : ""}`}
            onClick={() => setActiveLevel(key)}
          >
            {LEVEL_META[key].emoji} {LEVEL_META[key].label}
          </button>
        ))}
      </div>

      {/* Active Level Content */}
      <div className="tab-content" key={activeLevel}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {meta.description}
        </div>
        <div className="level-text" dangerouslySetInnerHTML={{ __html: formatText(level.text) }} />
        <div className="level-transcript">
          <strong style={{ color: "var(--accent-primary)", fontStyle: "normal" }}>🎤 TTS Transcript:</strong>{" "}
          {level.transcript}
        </div>
      </div>

      {/* Formula (only if not null and not child level) */}
      {hasFormula && activeLevel !== "child" && (
        <div className="formula-section">
          <div className="formula-label">
            {result.formula_name || "Primary Formula"}
          </div>
          <LatexBlock latex={result.primary_formula!} />
        </div>
      )}

      {/* No Formula Notice (for observation/simple cases) */}
      {!hasFormula && !isObservation && activeLevel !== "child" && (
        <div style={{
          margin: "1.5rem 0",
          padding: "0.75rem 1rem",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          textAlign: "center",
        }}>
          This concept is best understood through intuition — no primary formula needed.
        </div>
      )}

      {/* Variable Definitions Table */}
      {hasVariables && activeLevel !== "child" && (
        <div style={{ marginTop: "1rem" }}>
          <table className="var-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.variable_definitions).map(([symbol, def]) => (
                <tr key={symbol}>
                  <td className="symbol">{symbol}</td>
                  <td>{def.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{def.unit}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{def.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Related Examples */}
      {result.related_examples && result.related_examples.length > 0 && (
        <div className="related-examples">
          <h4>See Also</h4>
          <ul>
            {result.related_examples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Save to Graph Button */}
      {onSave && !compact && (
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
          {saved ? (
            <div style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
              ✅ Saved to knowledge graph
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ fontSize: "0.9rem" }}
            >
              {saving ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0, display: "inline-block" }} />
                  Saving...
                </>
              ) : (
                "💾 Save to Knowledge Graph"
              )}
            </button>
          )}
        </div>
      )}

      {/* Image Popup */}
      {showImagePopup && sourceImageUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
          }}
          onClick={() => setShowImagePopup(false)}
        >
          <div
            style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImagePopup(false)}
              aria-label="Close image"
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              ✕
            </button>
            <img
              src={sourceImageUrl}
              alt={result.observed_object}
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                borderRadius: "var(--radius-lg, 12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, '<code style="background:var(--bg-elevated);padding:0.1em 0.3em;border-radius:3px;font-size:0.9em">$1</code>')
    .replace(/\n/g, "<br/>");
}
