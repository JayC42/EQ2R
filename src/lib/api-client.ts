/**
 * E2R — API Client
 * Typed fetch helpers for all API endpoints.
 */

import type { AnalysisResult, AnalyzeResponse, ProcessLessonResponse, LessonNode, GraphEdge } from "../types";

const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:5001";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/**
 * Upload an image and get physics analysis from Gemini 2.5 Pro.
 */
export async function analyzeImage(
  file: File,
  token?: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  const data: AnalyzeResponse = await res.json();
  return data.result;
}

/**
 * Save an analysis result to Firestore and generate the knowledge graph connections.
 */
export async function saveLessonToGraph(
  userId: string,
  rawAnalysisResult: AnalysisResult,
  token: string
): Promise<ProcessLessonResponse> {
  const res = await fetch(`${API_BASE}/process-lesson-completion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ userId, rawAnalysisResult }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch all lessons and connections for the authenticated user's graph.
 */
export async function fetchGraphData(
  token: string
): Promise<{ lessons: LessonNode[]; connections: GraphEdge[] }> {
  const res = await fetch(`${API_BASE}/graph-data`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }

  return res.json();
}
