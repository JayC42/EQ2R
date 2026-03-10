import { useState, useRef, useEffect } from "react";
import { AuthProvider, useAuth } from "./AuthProvider";

function AuthBarInner() {
  const { user, loading, signIn, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <button className="btn btn-primary" onClick={signIn} style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
        🔐 Sign in
      </button>
    );
  }

  return (
    <div className="auth-dropdown" ref={dropdownRef}>
      <button 
        className="auth-profile-trigger" 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="User Profile Menu"
        aria-expanded={dropdownOpen}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="auth-avatar"
            style={{ width: 40, height: 40, borderRadius: "50%", minWidth: 40, minHeight: 40, objectFit: "cover" }}
          />
        ) : (
          <div className="auth-avatar-fallback" style={{ width: 40, height: 40, borderRadius: "50%", minWidth: 40, minHeight: 40, overflow: "hidden" }}>
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </button>

      {dropdownOpen && (
        <div
          className="auth-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            backgroundColor: "#1e293b", // solid dark bg resembling var(--bg-surface)
            border: "1px solid #334155", // var(--border-subtle)
            borderRadius: "0.5rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)",
            minWidth: "240px",
            zIndex: 9999, // ultra high z-index
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="auth-dropdown-header"
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid #334155",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <strong style={{ fontSize: "0.95rem", color: "#f8fafc", lineHeight: 1.2 }}>
              {user.displayName || "User"}
            </strong>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", wordBreak: "break-all" }}>
              {user.email}
            </span>
          </div>
          <button
            className="auth-dropdown-item sign-out btn-primary"
            onClick={() => {
              setDropdownOpen(false);
              signOut();
            }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "0.85rem 1.25rem",
              backgroundColor: "transparent",
              border: "none",
              color: "#ffffffff", 
              fontSize: "0.9rem",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 1)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            ➡️ Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthBar() {
  return (
    <div className="auth-container">
      <AuthProvider>
        <AuthBarInner />
      </AuthProvider>
    </div>
  );
}
