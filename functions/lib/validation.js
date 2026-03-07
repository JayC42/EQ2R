"use strict";
/**
 * E2R — Zod validation schemas
 * Enforces the schema rules from equation-to-reality-prompt-v2.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLessonRequestSchema = exports.analysisResultSchema = void 0;
const zod_1 = require("zod");
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Count words in a string (splits on whitespace) */
function wordCount(s) {
    return s.trim().split(/\s+/).filter(Boolean).length;
}
/** PascalCase validation: starts with uppercase, no spaces, only alphanumeric */
const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
// ─── Level Explanation ───────────────────────────────────────────────────────
const levelExplanationSchema = zod_1.z.object({
    text: zod_1.z.string().min(1, "Level text must not be empty"),
    transcript: zod_1.z
        .string()
        .min(1, "Level transcript must not be empty")
        .refine((val) => wordCount(val) >= 30, { message: "Transcript must be at least 30 words" })
        .refine((val) => wordCount(val) <= 120, { message: "Transcript must be at most 120 words" }),
});
// ─── Levels ──────────────────────────────────────────────────────────────────
const levelsSchema = zod_1.z.object({
    child: levelExplanationSchema,
    teen: levelExplanationSchema,
    college: levelExplanationSchema,
    grad: levelExplanationSchema,
    expert: levelExplanationSchema,
});
// ─── Variable Definition ─────────────────────────────────────────────────────
const variableDefinitionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    unit: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
});
// ─── Graph Metadata Tags ────────────────────────────────────────────────────
const graphMetadataTagSchema = zod_1.z
    .string()
    .regex(pascalCaseRegex, "Each tag must be PascalCase (e.g., SimpleHarmonicMotion)");
const graphMetadataTagsSchema = zod_1.z
    .array(graphMetadataTagSchema)
    .min(3, "graph_metadata_tags must contain at least 3 items")
    .max(5, "graph_metadata_tags must contain at most 5 items");
// ─── Nano Banana Icon Prompt ─────────────────────────────────────────────────
const nanobananaIconPromptSchema = zod_1.z
    .string()
    .min(1, "nanobanana_icon_prompt must not be empty")
    .refine((val) => wordCount(val) >= 40, { message: "nanobanana_icon_prompt must be at least 40 words" })
    .refine((val) => wordCount(val) <= 80, { message: "nanobanana_icon_prompt must be at most 80 words" });
// ─── Full Analysis Result Schema ─────────────────────────────────────────────
exports.analysisResultSchema = zod_1.z
    .object({
    principle_name: zod_1.z.string().min(1, "principle_name is required"),
    observed_object: zod_1.z.string().min(1, "observed_object is required"),
    levels: levelsSchema,
    primary_formula: zod_1.z.string().nullable(),
    formula_name: zod_1.z.string().nullable(),
    variable_definitions: zod_1.z.record(variableDefinitionSchema).default({}),
    graph_metadata_tags: graphMetadataTagsSchema,
    nanobanana_icon_prompt: nanobananaIconPromptSchema,
    related_examples: zod_1.z.array(zod_1.z.string()).optional(),
})
    .refine((data) => {
    // formula_name must be non-null if primary_formula is non-null
    if (data.primary_formula !== null && data.formula_name === null) {
        return false;
    }
    return true;
}, { message: "formula_name is required when primary_formula is provided" });
// ─── Process Lesson Request Schema ───────────────────────────────────────────
exports.processLessonRequestSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "userId is required"),
    rawAnalysisResult: exports.analysisResultSchema,
});
//# sourceMappingURL=validation.js.map