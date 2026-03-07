/**
 * E2R — Knowledge Graph Chaining Service
 * Creates Firestore connection documents between lessons that share tags.
 */

import * as admin from "firebase-admin";
import type { LessonData, Connection } from "../types.js";

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
export async function chainKnowledgeNodes(
  userId: string,
  newLesson: LessonData,
  newNodeId: string
): Promise<Connection[]> {
  const lessonsRef = db.collection("users").doc(userId).collection("lessons");
  const connectionsRef = db
    .collection("users")
    .doc(userId)
    .collection("connections");

  // Fetch all existing completed lessons for this user
  const existingLessons = await lessonsRef
    .where("status", "==", "completed")
    .get();

  const connections: Connection[] = [];

  for (const doc of existingLessons.docs) {
    // Skip the lesson we just created
    if (doc.id === newNodeId) continue;

    const existing = doc.data() as LessonData;

    // Find shared tags between the new lesson and the existing one
    const sharedTags = newLesson.graph_metadata_tags.filter(
      (tag) => existing.graph_metadata_tags?.includes(tag)
    );

    if (sharedTags.length > 0) {
      // Create a connection edge (bidirectional by convention)
      const connection: Connection = {
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
