import { useState } from "react";
import type { AnalysisResult } from "../types";
import { useAuth } from "./AuthProvider";
import { saveLessonToGraph } from "../lib/api-client";
import ImageUploader from "./ImageUploader";
import LessonResult from "./LessonResult";

/**
 * Combined upload + result view with auth integration.
 * Auth gate: if user is not signed in, the drop zone is hidden and a sign-in prompt is shown.
 */
export default function UploadPage() {
  const { user, loading, error: authError, signIn, getIdToken } = useAuth();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveResult, setSaveResult] = useState<{ nodeId: string; connectionsCreated: number } | null>(null);

  const handleSave = async (analysisResult: AnalysisResult) => {
    if (!user) return;
    const token = await getIdToken();
    if (!token) return;

    const response = await saveLessonToGraph(user.uid, analysisResult, token);
    setSaved(true);
    setSaveResult({ nodeId: response.nodeId, connectionsCreated: response.connectionsCreated });
  };

  const handleNewUpload = () => {
    setResult(null);
    setSaved(false);
    setSaveResult(null);
  };

  // ─── Auth Loading State ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // ─── Auth Error State ───────────────────────────────────────────────────────

  if (authError) {
    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            📸 Analyze Physics
          </h1>
        </div>
        <div style={{
          padding: "1.5rem",
          background: "rgba(239, 83, 80, 0.1)",
          border: "1px solid rgba(239, 83, 80, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#EF5350",
        }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>⚠️ Authentication Error</p>
          <p style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>{authError}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Open your browser console (F12) for more details. Check that Google Sign-In is enabled in your Firebase Console.
          </p>
        </div>
      </div>
    );
  }

  // ─── Auth Gate: Not Signed In ───────────────────────────────────────────────

  if (!user) {
    return (
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            📸 Analyze Physics
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Upload an image of any real-world scene. E2R will identify the physics and explain it across 5 difficulty levels.
          </p>
        </div>

        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          border: "2px dashed var(--border-default)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🔐</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Sign in to analyze physics
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
            Sign in with your Google account to upload images and build your personal knowledge graph.
          </p>
          <button className="btn btn-primary" onClick={signIn} style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            🔐 Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // ─── Authenticated View ─────────────────────────────────────────────────────

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          📸 Analyze Physics
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Upload an image of any real-world scene. E2R will identify the physics and explain it across 5 difficulty levels.
        </p>
      </div>

      {!result && <ImageUploader onResult={setResult} />}

      {result && (
        <>
          <LessonResult
            result={result}
            onSave={handleSave}
            saved={saved}
          />

          {/* Save success banner */}
          {saved && saveResult && (
            <div style={{
              marginTop: "1rem",
              padding: "1rem 1.25rem",
              background: "rgba(77, 182, 172, 0.1)",
              border: "1px solid rgba(77, 182, 172, 0.3)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                  ✅ Saved to your knowledge graph!
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginLeft: "0.75rem" }}>
                  {saveResult.connectionsCreated} connection{saveResult.connectionsCreated !== 1 ? "s" : ""} created
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a href="/graph" className="btn btn-primary" style={{ fontSize: "0.8rem", textDecoration: "none" }}>
                  🔗 View Graph
                </a>
                <button className="btn btn-secondary" onClick={handleNewUpload} style={{ fontSize: "0.8rem" }}>
                  📸 New Upload
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
