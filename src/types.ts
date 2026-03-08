/**
 * E2R — Frontend Types
 * Mirrors functions/src/types.ts without firebase-admin dependency.
 */

// ─── Level Explanation ───────────────────────────────────────────────────────

export interface LevelExplanation {
  text: string;
  transcript: string;
}

export type LevelAlias = "child" | "teen" | "college" | "grad" | "expert";

export type Levels = Record<LevelAlias, LevelExplanation>;

// ─── Variable Definition ─────────────────────────────────────────────────────

export interface VariableDefinition {
  name: string;
  unit: string;
  description: string;
}

// ─── Analysis Result ─────────────────────────────────────────────────────────

export interface AnalysisResult {
  principle_name: string;
  observed_object: string;
  levels: Levels;
  primary_formula: string | null;
  formula_name: string | null;
  variable_definitions: Record<string, VariableDefinition>;
  graph_metadata_tags: string[];
  nanobanana_icon_prompt: string;
  related_examples?: string[];
}

// ─── Lesson (Firestore document, frontend view) ─────────────────────────────

export interface LessonNode extends AnalysisResult {
  id: string;
  iconUrl?: string;
  sourceImageUrl?: string;
  status: "completed";
  createdAt: string; // ISO string on frontend
}

// ─── Graph Types ─────────────────────────────────────────────────────────────

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sharedTags: string[];
  strength: number;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface AnalyzeResponse {
  result: AnalysisResult;
}

export interface ProcessLessonResponse {
  nodeId: string;
  sourceImageUrl?: string;
  connectionsCreated: number;
  sharedTags: string[];
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

// ─── Level Metadata ──────────────────────────────────────────────────────────

export const LEVEL_META: Record<LevelAlias, { label: string; emoji: string; description: string }> = {
  child:   { label: "Child",   emoji: "🧒", description: "What is happening?" },
  teen:    { label: "Teen",    emoji: "🎓", description: "Why is it happening?" },
  college: { label: "College", emoji: "📐", description: "How do we model it?" },
  grad:    { label: "Grad",    emoji: "🔬", description: "Where does the model break?" },
  expert:  { label: "Expert",  emoji: "🧠", description: "What is the deeper abstraction?" },
};
