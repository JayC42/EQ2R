/**
 * E2R — App Shell
 * Root component that wraps page content with AuthProvider.
 *
 * IMPORTANT: In Astro, children passed via slots are rendered as server HTML,
 * NOT as React children. This means they can't access React context (like AuthProvider).
 * To fix this, AppShell renders the page component INTERNALLY via the `page` prop,
 * so everything lives in the same React tree and shares context.
 */

import { type ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthProvider";
import UploadPage from "./UploadPage";
import KnowledgeGraph from "./KnowledgeGraph";

// ─── Auth Bar ────────────────────────────────────────────────────────────────

function AuthBar() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0",
        color: "var(--text-muted)",
        fontSize: "0.85rem",
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <button className="btn btn-primary" onClick={signIn} style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
        🔐 Sign in with Google
      </button>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    }}>
      {user.photoURL && (
        <img
          src={user.photoURL}
          alt={user.displayName || "User"}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid var(--border-default)",
          }}
        />
      )}
      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        {user.displayName || user.email}
      </span>
      <button
        className="btn btn-secondary"
        onClick={signOut}
        style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}
      >
        Sign out
      </button>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────

interface Props {
  page: "upload" | "graph";
}

export default function AppShell({ page }: Props) {
  return (
    <AuthProvider>
      <div className="auth-bar-container">
        <AuthBar />
      </div>
      <div className={page === "graph" ? "" : "page-container"}>
        {page === "upload" && <UploadPage />}
        {page === "graph" && <KnowledgeGraph />}
      </div>
    </AuthProvider>
  );
}
