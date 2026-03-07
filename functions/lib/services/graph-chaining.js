"use strict";
/**
 * E2R — Knowledge Graph Chaining Service
 * Creates Firestore connection documents between lessons that share tags.
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
exports.chainKnowledgeNodes = chainKnowledgeNodes;
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// ─── Service ─────────────────────────────────────────────────────────────────
/**
 * Find existing lesson nodes that share ≥1 graph_metadata_tag with the new lesson
 * and create bidirectional Connection documents.
 *
 * @param userId - The user's ID
 * @param newLesson - The newly created lesson data
 * @param newNodeId - The Firestore document ID of the new lesson
 * @returns Array of created connections
 */
async function chainKnowledgeNodes(userId, newLesson, newNodeId) {
    const lessonsRef = db.collection("users").doc(userId).collection("lessons");
    const connectionsRef = db
        .collection("users")
        .doc(userId)
        .collection("connections");
    // Fetch all existing completed lessons for this user
    const existingLessons = await lessonsRef
        .where("status", "==", "completed")
        .get();
    const connections = [];
    for (const doc of existingLessons.docs) {
        // Skip the lesson we just created
        if (doc.id === newNodeId)
            continue;
        const existing = doc.data();
        // Find shared tags between the new lesson and the existing one
        const sharedTags = newLesson.graph_metadata_tags.filter((tag) => existing.graph_metadata_tags?.includes(tag));
        if (sharedTags.length > 0) {
            // Create a connection edge (bidirectional by convention)
            const connection = {
                sourceId: newNodeId,
                targetId: doc.id,
                sharedTags,
                strength: sharedTags.length, // More shared tags = stronger connection
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await connectionsRef.add(connection);
            connections.push(connection);
        }
    }
    return connections;
}
//# sourceMappingURL=graph-chaining.js.map