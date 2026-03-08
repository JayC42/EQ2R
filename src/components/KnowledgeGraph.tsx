import { useState, useCallback, useRef, useEffect } from "react";
import type { LessonNode, GraphEdge } from "../types";
import { getNodeColor, getAllDomainColors } from "../lib/domain-colors";
import { MOCK_LESSONS, MOCK_CONNECTIONS } from "../lib/mock-data";
import { fetchGraphData } from "../lib/api-client";
import { useAuth } from "./AuthProvider";
import LessonModal from "./LessonModal";

// ─── Types for react-force-graph ─────────────────────────────────────────────

interface GraphNode {
  id: string;
  name: string;
  color: string;
  lesson: LessonNode;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  sharedTags: string[];
  strength: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedLesson, setSelectedLesson] = useState<LessonNode | null>(null);
  const [ForceGraph, setForceGraph] = useState<any>(null);
  const [lessons, setLessons] = useState<LessonNode[]>(MOCK_LESSONS);
  const [connections, setConnections] = useState<GraphEdge[]>(MOCK_CONNECTIONS);
  const [dataSource, setDataSource] = useState<"mock" | "live">("mock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, getIdToken } = useAuth();

  // Fetch live data when authenticated
  useEffect(() => {
    if (!user) {
      setLessons(MOCK_LESSONS);
      setConnections(MOCK_CONNECTIONS);
      setDataSource("mock");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) return;
        const data = await fetchGraphData(token);
        setLessons(data.lessons);
        setConnections(data.connections);
        setDataSource("live");
      } catch (err) {
        console.error("Failed to load graph data:", err);
        setError("Failed to load graph data. Showing demo data.");
        setLessons(MOCK_LESSONS);
        setConnections(MOCK_CONNECTIONS);
        setDataSource("mock");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Dynamically import react-force-graph-2d
  useEffect(() => {
    import("react-force-graph-2d").then((mod) => {
      setForceGraph(() => mod.default);
    });
  }, []);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Build graph data
  const graphData = {
    nodes: lessons.map((lesson): GraphNode => ({
      id: lesson.id,
      name: lesson.principle_name,
      color: getNodeColor(lesson.graph_metadata_tags),
      lesson,
    })),
    links: connections.map((edge): GraphLink => ({
      source: edge.sourceId,
      target: edge.targetId,
      sharedTags: edge.sharedTags,
      strength: edge.strength,
    })),
  };

  // ─── Custom Node Renderer ─────────────────────────────────────────────────

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = Math.max(12 / globalScale, 3);
    const nodeRadius = 20 / globalScale;

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = node.color + "33";
    ctx.fill();
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius * 0.35, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();

    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#e8eaed";
    ctx.fillText(label, node.x, node.y + nodeRadius + 4 / globalScale);
  }, []);

  // ─── Custom Link Renderer ─────────────────────────────────────────────────

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source;
    const end = link.target;
    if (!start.x || !end.x) return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = Math.max(link.strength * 1.5 / globalScale, 0.5);
    ctx.stroke();

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const fontSize = Math.max(8 / globalScale, 2);
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText(link.sharedTags.join(", "), midX, midY);
  }, []);

  const domainColors = getAllDomainColors();

  return (
    <div ref={containerRef} className="graph-container">
      {loading ? (
        <div className="loading-state" style={{ paddingTop: "4rem" }}>
          <div className="spinner" />
          <p>Loading your knowledge graph...</p>
        </div>
      ) : ForceGraph ? (
        <ForceGraph
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#0f1117"
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const r = 20 / globalScale;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkCanvasObject={paintLink}
          linkWidth={(link: GraphLink) => link.strength * 1.5}
          onNodeClick={(node: GraphNode) => setSelectedLesson(node.lesson)}
          cooldownTicks={100}
          d3VelocityDecay={0.3}
          d3AlphaDecay={0.02}
        />
      ) : (
        <div className="loading-state" style={{ paddingTop: "4rem" }}>
          <div className="spinner" />
          <p>Loading graph engine...</p>
        </div>
      )}

      {/* Data source indicator */}
      <div style={{
        position: "absolute",
        top: "1rem",
        left: "1rem",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)",
        padding: "0.4rem 0.75rem",
        fontSize: "0.75rem",
        color: "var(--text-muted)",
        zIndex: 10,
      }}>
        {dataSource === "live" ? "🟢 Live data" : "🔵 Demo data"} · {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} · {connections.length} connection{connections.length !== 1 ? "s" : ""}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "rgba(239, 83, 80, 0.1)",
          border: "1px solid rgba(239, 83, 80, 0.3)",
          borderRadius: "var(--radius-sm)",
          padding: "0.4rem 0.75rem",
          fontSize: "0.75rem",
          color: "#EF5350",
          zIndex: 10,
        }}>
          {error}
        </div>
      )}

      {/* Legend */}
      <div className="graph-legend">
        <h4>Physics Domains</h4>
        {Object.entries(domainColors).map(([key, color]) => (
          <div className="graph-legend-item" key={key}>
            <div className="graph-legend-dot" style={{ background: color.primary }} />
            {color.label}
          </div>
        ))}
      </div>

      {/* Node Click Modal */}
      {selectedLesson && (
        <LessonModal
          result={selectedLesson}
          iconUrl={selectedLesson.iconUrl}
          sourceImageUrl={selectedLesson.sourceImageUrl}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
}
