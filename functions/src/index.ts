/**
 * E2R — Hono API on Firebase Functions v2
 *
 * Endpoints:
 *   POST /analyze                    — Image upload → Gemini 2.5 Pro → structured JSON
 *   POST /process-lesson-completion  — JSON payload + userId → icon gen + Firestore + graph chaining
 *   GET  /graph-data                 — Returns all lessons + connections for the authenticated user
 */

import { onRequest } from "firebase-functions/v2/https";
import { Hono, type Context, type Next } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// ─── Hono Env Type ───────────────────────────────────────────────────────────

type Env = {
  Variables: {
    userId: string;
    userEmail: string;
  };
};
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import Busboy from "busboy";

import { analyzeImage } from "./services/gemini.js";

import { chainKnowledgeNodes } from "./services/graph-chaining.js";
import { analysisResultSchema, processLessonRequestSchema } from "./validation.js";
import type {
  LessonData,
  AnalyzeResponse,
  ProcessLessonResponse,
  ErrorResponse,
} from "./types.js";

// ─── Firebase Init ───────────────────────────────────────────────────────────

admin.initializeApp();
const db = admin.firestore();

// ─── Accepted Image Types ────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Auth Middleware ─────────────────────────────────────────────────────────

/**
 * Extract and verify Firebase ID token from Authorization header.
 * Stores userId in Hono context variables.
 */
async function verifyAuth(c: Context<Env>, next: Next) {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    return c.json({ error: "Missing authorization token" } satisfies ErrorResponse, 401);
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    c.set("userId", decoded.uid);
    c.set("userEmail", decoded.email || "");
    await next();
  } catch (err) {
    console.error("Auth verification failed:", err);
    return c.json({ error: "Invalid or expired token" } satisfies ErrorResponse, 401);
  }
}

/**
 * Optional auth — sets userId if token is present, but doesn't block.
 */
async function optionalAuth(c: Context<Env>, next: Next) {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (token) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      c.set("userId", decoded.uid);
    } catch {
      // Ignore — proceed without auth
    }
  }

  await next();
}

// ─── Multipart Parser ────────────────────────────────────────────────────────

interface ParsedFile {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

function parseMultipart(req: Request): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers.get("content-type") || "";
    const busboy = Busboy({ headers: { "content-type": contentType } });

    let fileFound = false;

    busboy.on(
      "file",
      (
        _fieldname: string,
        stream: NodeJS.ReadableStream,
        info: { filename: string; encoding: string; mimeType: string }
      ) => {
        if (fileFound) {
          stream.resume();
          return;
        }
        fileFound = true;

        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
          resolve({
            buffer: Buffer.concat(chunks),
            mimeType: info.mimeType,
            filename: info.filename,
          });
        });
        stream.on("error", reject);
      }
    );

    busboy.on("error", reject);
    busboy.on("finish", () => {
      if (!fileFound) reject(new Error("No file found in the multipart request"));
    });

    const reader = req.body?.getReader();
    if (!reader) {
      reject(new Error("Request body is empty"));
      return;
    }

    const nodeStream = new (require("stream").Readable)({
      async read() {
        const { done, value } = await reader.read();
        if (done) this.push(null);
        else this.push(Buffer.from(value));
      },
    });

    nodeStream.pipe(busboy);
  });
}

// ─── Hono App ────────────────────────────────────────────────────────────────

const app = new Hono<Env>();

app.use("*", cors());
app.use("*", logger());

// ─── Health Check ────────────────────────────────────────────────────────────

app.get("/", (c) => {
  return c.json({ status: "ok", service: "equation-to-reality-api", version: "1.0.0" });
});

// ─── POST /analyze ───────────────────────────────────────────────────────────

app.post("/analyze", optionalAuth, async (c) => {
  try {
    const rawRequest = c.req.raw;
    const parsed = await parseMultipart(rawRequest);

    if (!ACCEPTED_MIME_TYPES.has(parsed.mimeType)) {
      return c.json<ErrorResponse>(
        { error: `Unsupported image type: ${parsed.mimeType}. Accepted: ${[...ACCEPTED_MIME_TYPES].join(", ")}` },
        400
      );
    }

    if (parsed.buffer.length > MAX_IMAGE_SIZE) {
      return c.json<ErrorResponse>(
        { error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
        400
      );
    }

    const analysisResult = await analyzeImage(parsed.buffer, parsed.mimeType);

    const validation = analysisResultSchema.safeParse(analysisResult);
    if (!validation.success) {
      return c.json<ErrorResponse>(
        { error: "AI response did not match expected schema. Please try again.", details: validation.error.flatten() },
        502
      );
    }

    return c.json<AnalyzeResponse>({ result: validation.data }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /analyze error:", err);
    return c.json<ErrorResponse>({ error: message }, 500);
  }
});

// ─── POST /process-lesson-completion ─────────────────────────────────────────

app.post("/process-lesson-completion", verifyAuth, async (c) => {
  try {
    const body = await c.req.json();
    const validation = processLessonRequestSchema.safeParse(body);

    if (!validation.success) {
      return c.json<ErrorResponse>(
        { error: "Invalid request body", details: validation.error.flatten() },
        400
      );
    }

    const { userId, rawAnalysisResult, sourceImageBase64, sourceImageMimeType } = validation.data;

    // Verify the userId matches the authenticated user
    const authUserId = c.get("userId");
    if (userId !== authUserId) {
      return c.json<ErrorResponse>({ error: "userId does not match authenticated user" }, 403);
    }

    // Upload source image to Firebase Storage if provided
    let sourceImageUrl: string | undefined;
    if (sourceImageBase64 && sourceImageMimeType) {
      try {
        const imageBuffer = Buffer.from(sourceImageBase64, "base64");
        const extension = sourceImageMimeType.split("/")[1] || "png";
        const bucket = admin.storage().bucket();
        const fileName = `users/${userId}/source-images/${Date.now()}.${extension}`;
        const file = bucket.file(fileName);

        await file.save(imageBuffer, {
          metadata: { contentType: sourceImageMimeType },
        });

        // Use emulator URL when running locally, production URL otherwise
        const storageEmulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
        if (storageEmulatorHost) {
          sourceImageUrl = `http://${storageEmulatorHost}/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
        } else {
          await file.makePublic();
          sourceImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        }
      } catch (imgErr) {
        console.warn("Failed to upload source image, continuing without it:", imgErr);
      }
    }

    // Write lesson to Firestore
    const lessonData: LessonData = {
      ...rawAnalysisResult,
      ...(sourceImageUrl && { sourceImageUrl }),
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
    };

    const nodeRef = db.collection("users").doc(userId).collection("lessons").doc();
    await nodeRef.set(lessonData);

    // Chain knowledge nodes
    const connections = await chainKnowledgeNodes(userId, lessonData, nodeRef.id);

    return c.json<ProcessLessonResponse>(
      {
        nodeId: nodeRef.id,
        sourceImageUrl,
        connectionsCreated: connections.length,
        sharedTags: rawAnalysisResult.graph_metadata_tags,
      },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /process-lesson-completion error:", err);
    return c.json<ErrorResponse>({ error: message }, 500);
  }
});

// ─── GET /graph-data ─────────────────────────────────────────────────────────
// Returns all lessons + connections for the authenticated user.

app.get("/graph-data", verifyAuth, async (c) => {
  try {
    const userId = c.get("userId") as string;

    // Fetch all completed lessons
    const lessonsSnap = await db
      .collection("users")
      .doc(userId)
      .collection("lessons")
      .where("status", "==", "completed")
      .orderBy("createdAt", "desc")
      .get();

    const lessons = lessonsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    // Fetch all connections
    const connectionsSnap = await db
      .collection("users")
      .doc(userId)
      .collection("connections")
      .get();

    const connections = connectionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return c.json({ lessons, connections }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /graph-data error:", err);
    return c.json<ErrorResponse>({ error: message }, 500);
  }
});

import { getRequestListener } from "@hono/node-server";

// ─── Export as Firebase Function ──────────────────────────────────────────────

export const api = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
    cors: true,
  },
  getRequestListener(app.fetch)
);
