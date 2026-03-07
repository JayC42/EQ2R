/**
 * E2R — Knowledge Graph Chaining Service
 * Creates Firestore connection documents between lessons that share tags.
 */
import type { LessonData, Connection } from "../types.js";
/**
 * Find existing lesson nodes that share ≥1 graph_metadata_tag with the new lesson
 * and create bidirectional Connection documents.
 *
 * @param userId - The user's ID
 * @param newLesson - The newly created lesson data
 * @param newNodeId - The Firestore document ID of the new lesson
 * @returns Array of created connections
 */
export declare function chainKnowledgeNodes(userId: string, newLesson: LessonData, newNodeId: string): Promise<Connection[]>;
//# sourceMappingURL=graph-chaining.d.ts.map