"use strict";
/**
 * E2R — Hono API on Firebase Functions v2
 *
 * Endpoints:
 *   POST /analyze                    — Image upload → Gemini 2.5 Pro → structured JSON
 *   POST /process-lesson-completion  — JSON payload + userId → icon gen + Firestore + graph chaining
 *   GET  /graph-data                 — Returns all lessons + connections for the authenticated user
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const logger_1 = require("hono/logger");
const admin = __importStar(require("firebase-admin"));
const busboy_1 = __importDefault(require("busboy"));
const gemini_js_1 = require("./services/gemini.js");
const icon_generator_js_1 = require("./services/icon-generator.js");
const graph_chaining_js_1 = require("./services/graph-chaining.js");
const validation_js_1 = require("./validation.js");
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
async function verifyAuth(c, next) {
    const authHeader = c.req.header("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
        return c.json({ error: "Missing authorization token" }, 401);
    }
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        c.set("userId", decoded.uid);
        c.set("userEmail", decoded.email || "");
        await next();
    }
    catch (err) {
        console.error("Auth verification failed:", err);
        return c.json({ error: "Invalid or expired token" }, 401);
    }
}
/**
 * Optional auth — sets userId if token is present, but doesn't block.
 */
async function optionalAuth(c, next) {
    const authHeader = c.req.header("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token) {
        try {
            const decoded = await admin.auth().verifyIdToken(token);
            c.set("userId", decoded.uid);
        }
        catch {
            // Ignore — proceed without auth
        }
    }
    await next();
}
function parseMultipart(req) {
    return new Promise((resolve, reject) => {
        const contentType = req.headers.get("content-type") || "";
        const busboy = (0, busboy_1.default)({ headers: { "content-type": contentType } });
        let fileFound = false;
        busboy.on("file", (_fieldname, stream, info) => {
            if (fileFound) {
                stream.resume();
                return;
            }
            fileFound = true;
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => {
                resolve({
                    buffer: Buffer.concat(chunks),
                    mimeType: info.mimeType,
                    filename: info.filename,
                });
            });
            stream.on("error", reject);
        });
        busboy.on("error", reject);
        busboy.on("finish", () => {
            if (!fileFound)
                reject(new Error("No file found in the multipart request"));
        });
        const reader = req.body?.getReader();
        if (!reader) {
            reject(new Error("Request body is empty"));
            return;
        }
        const nodeStream = new (require("stream").Readable)({
            async read() {
                const { done, value } = await reader.read();
                if (done)
                    this.push(null);
                else
                    this.push(Buffer.from(value));
            },
        });
        nodeStream.pipe(busboy);
    });
}
// ─── Hono App ────────────────────────────────────────────────────────────────
const app = new hono_1.Hono();
app.use("*", (0, cors_1.cors)());
app.use("*", (0, logger_1.logger)());
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
            return c.json({ error: `Unsupported image type: ${parsed.mimeType}. Accepted: ${[...ACCEPTED_MIME_TYPES].join(", ")}` }, 400);
        }
        if (parsed.buffer.length > MAX_IMAGE_SIZE) {
            return c.json({ error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` }, 400);
        }
        const analysisResult = await (0, gemini_js_1.analyzeImage)(parsed.buffer, parsed.mimeType);
        const validation = validation_js_1.analysisResultSchema.safeParse(analysisResult);
        if (!validation.success) {
            return c.json({ error: "AI response did not match expected schema. Please try again.", details: validation.error.flatten() }, 502);
        }
        return c.json({ result: validation.data }, 200);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("POST /analyze error:", err);
        return c.json({ error: message }, 500);
    }
});
// ─── POST /process-lesson-completion ─────────────────────────────────────────
app.post("/process-lesson-completion", verifyAuth, async (c) => {
    try {
        const body = await c.req.json();
        const validation = validation_js_1.processLessonRequestSchema.safeParse(body);
        if (!validation.success) {
            return c.json({ error: "Invalid request body", details: validation.error.flatten() }, 400);
        }
        const { userId, rawAnalysisResult } = validation.data;
        // Verify the userId matches the authenticated user
        const authUserId = c.get("userId");
        if (userId !== authUserId) {
            return c.json({ error: "userId does not match authenticated user" }, 403);
        }
        // Generate icon
        const iconUrl = await (0, icon_generator_js_1.generateAndStoreIcon)(rawAnalysisResult.nanobanana_icon_prompt, userId);
        // Write lesson to Firestore
        const lessonData = {
            ...rawAnalysisResult,
            iconUrl,
            status: "completed",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const nodeRef = db.collection("users").doc(userId).collection("lessons").doc();
        await nodeRef.set(lessonData);
        // Chain knowledge nodes
        const connections = await (0, graph_chaining_js_1.chainKnowledgeNodes)(userId, lessonData, nodeRef.id);
        return c.json({
            nodeId: nodeRef.id,
            iconUrl,
            connectionsCreated: connections.length,
            sharedTags: rawAnalysisResult.graph_metadata_tags,
        }, 201);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("POST /process-lesson-completion error:", err);
        return c.json({ error: message }, 500);
    }
});
// ─── GET /graph-data ─────────────────────────────────────────────────────────
// Returns all lessons + connections for the authenticated user.
app.get("/graph-data", verifyAuth, async (c) => {
    try {
        const userId = c.get("userId");
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("GET /graph-data error:", err);
        return c.json({ error: message }, 500);
    }
});
// ─── Export as Firebase Function ──────────────────────────────────────────────
exports.api = (0, https_1.onRequest)({
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 120,
    cors: true,
}, app.fetch);
//# sourceMappingURL=index.js.map