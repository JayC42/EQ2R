/**
 * E2R — Zod validation schemas
 * Enforces the schema rules from equation-to-reality-prompt-v2.md
 */

import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Count words in a string (splits on whitespace) */
function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/** PascalCase validation: starts with uppercase, no spaces, only alphanumeric */
const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

// ─── Level Explanation ───────────────────────────────────────────────────────

const levelExplanationSchema = z.object({
  text: z.string().min(1, "Level text must not be empty"),
  transcript: z
    .string()
    .min(1, "Level transcript must not be empty")
    .refine(
      (val) => wordCount(val) >= 30,
      { message: "Transcript must be at least 30 words" }
    )
    .refine(
      (val) => wordCount(val) <= 120,
      { message: "Transcript must be at most 120 words" }
    ),
});

// ─── Levels ──────────────────────────────────────────────────────────────────

const levelsSchema = z.object({
  child: levelExplanationSchema,
  teen: levelExplanationSchema,
  college: levelExplanationSchema,
  grad: levelExplanationSchema,
  expert: levelExplanationSchema,
});

// ─── Variable Definition ─────────────────────────────────────────────────────

const variableDefinitionSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  description: z.string().min(1),
});

// ─── Graph Metadata Tags ────────────────────────────────────────────────────

const graphMetadataTagSchema = z
  .string()
  .regex(pascalCaseRegex, "Each tag must be PascalCase (e.g., SimpleHarmonicMotion)");

const graphMetadataTagsSchema = z
  .array(graphMetadataTagSchema)
  .min(3, "graph_metadata_tags must contain at least 3 items")
  .max(5, "graph_metadata_tags must contain at most 5 items");

// ─── Nano Banana Icon Prompt ─────────────────────────────────────────────────

const nanobananaIconPromptSchema = z
  .string()
  .min(1, "nanobanana_icon_prompt must not be empty")
  .refine(
    (val) => wordCount(val) >= 40,
    { message: "nanobanana_icon_prompt must be at least 40 words" }
  )
  .refine(
    (val) => wordCount(val) <= 80,
    { message: "nanobanana_icon_prompt must be at most 80 words" }
  );

// ─── Full Analysis Result Schema ─────────────────────────────────────────────

export const analysisResultSchema = z
  .object({
    principle_name: z.string().min(1, "principle_name is required"),
    observed_object: z.string().min(1, "observed_object is required"),
    levels: levelsSchema,
    primary_formula: z.string().nullable(),
    formula_name: z.string().nullable(),
    variable_definitions: z.record(variableDefinitionSchema).default({}),
    graph_metadata_tags: graphMetadataTagsSchema,
    nanobanana_icon_prompt: nanobananaIconPromptSchema,
    related_examples: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // formula_name must be non-null if primary_formula is non-null
      if (data.primary_formula !== null && data.formula_name === null) {
        return false;
      }
      return true;
    },
    { message: "formula_name is required when primary_formula is provided" }
  );

// ─── Process Lesson Request Schema ───────────────────────────────────────────

export const processLessonRequestSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  rawAnalysisResult: analysisResultSchema,
  sourceImageBase64: z.string().optional(),
  sourceImageMimeType: z.string().optional(),
});

// ─── Inferred Types (use for runtime-validated data) ─────────────────────────

export type ValidatedAnalysisResult = z.infer<typeof analysisResultSchema>;
export type ValidatedProcessLessonRequest = z.infer<typeof processLessonRequestSchema>;
