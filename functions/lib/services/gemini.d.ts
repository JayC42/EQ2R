/**
 * E2R — Gemini 2.5 Pro Analysis Service
 * Sends an image to Gemini with the E2R system prompt and returns a structured AnalysisResult.
 */
import type { AnalysisResult } from "../types.js";
/**
 * Analyze an image using Gemini 2.5 Pro with the E2R system prompt.
 *
 * @param imageBuffer - Raw image bytes
 * @param mimeType - MIME type of the image (e.g., "image/jpeg")
 * @returns Parsed AnalysisResult
 */
export declare function analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<AnalysisResult>;
//# sourceMappingURL=gemini.d.ts.map