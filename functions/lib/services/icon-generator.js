"use strict";
/**
 * E2R — Nano Banana Icon Generator
 * Uses Gemini 2.5 Flash on Vertex AI to generate a minimalist 64×64 icon,
 * uploads it to Firebase Storage, and returns the download URL.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndStoreIcon = generateAndStoreIcon;
const vertexai_1 = require("@google-cloud/vertexai");
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
// ─── Configuration ───────────────────────────────────────────────────────────
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "";
const LOCATION = process.env.VERTEX_AI_LOCATION || "us-central1";
const MODEL_ID = "gemini-2.5-flash";
const STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`;
// ─── Service ─────────────────────────────────────────────────────────────────
/**
 * Generate a minimalist icon using Gemini 2.5 Flash and store it in Firebase Storage.
 *
 * @param prompt - The nanobanana_icon_prompt from the analysis result
 * @param userId - The user's ID (for storage path scoping)
 * @returns Public download URL for the generated icon
 */
async function generateAndStoreIcon(prompt, userId) {
    const vertexAI = new vertexai_1.VertexAI({ project: PROJECT_ID, location: LOCATION });
    const model = vertexAI.getGenerativeModel({
        model: MODEL_ID,
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096,
            responseMimeType: "image/png",
        },
    });
    // Generate the icon image
    const response = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `Generate a 64x64 pixel icon image based on this description: ${prompt}`,
                    },
                ],
            },
        ],
    });
    const candidate = response.response?.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find((part) => part.inlineData?.mimeType?.startsWith("image/"));
    if (!imagePart?.inlineData?.data) {
        throw new Error("Gemini did not return an image for the icon prompt");
    }
    // Decode base64 image data
    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const extension = mimeType === "image/png" ? "png" : "webp";
    // Upload to Firebase Storage
    const bucket = admin.storage().bucket(STORAGE_BUCKET);
    const fileName = `users/${userId}/icons/${(0, uuid_1.v4)()}.${extension}`;
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
        metadata: {
            contentType: mimeType,
            metadata: {
                firebaseStorageDownloadTokens: (0, uuid_1.v4)(),
            },
        },
    });
    // Make the file publicly readable
    await file.makePublic();
    // Return the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return publicUrl;
}
//# sourceMappingURL=icon-generator.js.map