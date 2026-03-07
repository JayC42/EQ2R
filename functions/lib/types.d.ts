/**
 * E2R — Shared TypeScript types
 * Derived from the Equation to Reality JSON schema (v2.0)
 */
import type { firestore } from "firebase-admin";
export interface LevelExplanation {
    /** Formatted explanation (may include bold, LaTeX, etc.) */
    text: string;
    /** TTS-ready plain text, 30–120 words, no LaTeX */
    transcript: string;
}
export type LevelAlias = "child" | "teen" | "college" | "grad" | "expert";
export type Levels = Record<LevelAlias, LevelExplanation>;
export interface VariableDefinition {
    /** Human-readable variable name */
    name: string;
    /** SI unit string */
    unit: string;
    /** Plain-English description */
    description: string;
}
export interface AnalysisResult {
    /** The identified physical principle — title case, concise */
    principle_name: string;
    /** The specific real-world object from the media */
    observed_object: string;
    /** 5-level explanations keyed by alias */
    levels: Levels;
    /** Core equation in LaTeX (double-backslash escaped). Null if too simple. */
    primary_formula: string | null;
    /** Human-readable formula name. Null if primary_formula is null. */
    formula_name: string | null;
    /** Maps each symbol to a plain-English definition + SI unit */
    variable_definitions: Record<string, VariableDefinition>;
    /** 3–5 PascalCase canonical physics terms for knowledge graph chaining */
    graph_metadata_tags: string[];
    /** Prompt for Nano Banana icon generation (40–80 words) */
    nanobanana_icon_prompt: string;
    /** Optional related real-world examples */
    related_examples?: string[];
}
export interface LessonData extends AnalysisResult {
    /** URL to the generated Nano Banana icon in Firebase Storage */
    iconUrl: string;
    /** Lesson status */
    status: "completed";
    /** Firestore server timestamp */
    createdAt: firestore.FieldValue;
}
export interface Connection {
    /** ID of the newly created lesson node */
    sourceId: string;
    /** ID of the existing lesson node */
    targetId: string;
    /** Tags shared between source and target */
    sharedTags: string[];
    /** Edge strength = number of shared tags */
    strength: number;
    /** Firestore server timestamp */
    createdAt: firestore.FieldValue;
}
export interface ProcessLessonRequest {
    userId: string;
    rawAnalysisResult: AnalysisResult;
}
export interface ProcessLessonResponse {
    nodeId: string;
    iconUrl: string;
    connectionsCreated: number;
    sharedTags: string[];
}
export interface AnalyzeResponse {
    result: AnalysisResult;
}
export interface ErrorResponse {
    error: string;
    details?: unknown;
}
//# sourceMappingURL=types.d.ts.map