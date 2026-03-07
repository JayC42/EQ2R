/**
 * E2R — Nano Banana Icon Generator
 * Uses Gemini 2.5 Flash on Vertex AI to generate a minimalist 64×64 icon,
 * uploads it to Firebase Storage, and returns the download URL.
 */

import { VertexAI } from "@google-cloud/vertexai";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

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
export async function generateAndStoreIcon(
  prompt: string,
  userId: string
): Promise<string> {
  const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

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
  const imagePart = candidate?.content?.parts?.find(
    (part) => part.inlineData?.mimeType?.startsWith("image/")
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini did not return an image for the icon prompt");
  }

  // Decode base64 image data
  const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  const mimeType = imagePart.inlineData.mimeType || "image/png";
  const extension = mimeType === "image/png" ? "png" : "webp";

  // Upload to Firebase Storage
  const bucket = admin.storage().bucket(STORAGE_BUCKET);
  const fileName = `users/${userId}/icons/${uuidv4()}.${extension}`;
  const file = bucket.file(fileName);

  await file.save(imageBuffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(),
      },
    },
  });

  // Make the file publicly readable
  await file.makePublic();

  // Return the public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return publicUrl;
}
