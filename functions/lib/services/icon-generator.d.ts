/**
 * E2R — Nano Banana Icon Generator
 * Uses Gemini 2.5 Flash on Vertex AI to generate a minimalist 64×64 icon,
 * uploads it to Firebase Storage, and returns the download URL.
 */
/**
 * Generate a minimalist icon using Gemini 2.5 Flash and store it in Firebase Storage.
 *
 * @param prompt - The nanobanana_icon_prompt from the analysis result
 * @param userId - The user's ID (for storage path scoping)
 * @returns Public download URL for the generated icon
 */
export declare function generateAndStoreIcon(prompt: string, userId: string): Promise<string>;
//# sourceMappingURL=icon-generator.d.ts.map