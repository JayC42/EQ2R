/**
 * E2R — Hono API on Firebase Functions v2
 *
 * Endpoints:
 *   POST /analyze                    — Image upload → Gemini 2.5 Pro → structured JSON
 *   POST /process-lesson-completion  — JSON payload + userId → icon gen + Firestore + graph chaining
 *   GET  /graph-data                 — Returns all lessons + connections for the authenticated user
 */
export declare const api: import("firebase-functions/v2/https").HttpsFunction;
//# sourceMappingURL=index.d.ts.map