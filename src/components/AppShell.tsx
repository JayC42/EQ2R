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
// AuthBar has been extracted to its own component.

// ─── App Shell ───────────────────────────────────────────────────────────────

interface Props {
  page: "upload" | "graph";
}

export default function AppShell({ page }: Props) {
  return (
    <AuthProvider>
      <div className={page === "graph" ? "" : "page-container"}>
        {page === "upload" && <UploadPage />}
        {page === "graph" && <KnowledgeGraph />}
      </div>
    </AuthProvider>
  );
}
