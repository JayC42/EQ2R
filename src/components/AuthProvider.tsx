/**
 * E2R — Auth Provider
 * React context providing Firebase Auth state and Google sign-in.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase-config";

// ─── Context Types ───────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[AuthProvider] Setting up onAuthStateChanged listener...");
    console.log("[AuthProvider] auth object:", auth ? "exists" : "null/undefined");

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          console.log("[AuthProvider] Auth state changed:", u ? `User: ${u.email}` : "No user");
          setUser(u);
          setLoading(false);
          setError(null);
        },
        (err) => {
          // Error callback — fires if the listener encounters an error
          console.error("[AuthProvider] onAuthStateChanged error:", err);
          setLoading(false);
          setError(err.message);
        }
      );
    } catch (err) {
      // Catch synchronous errors during listener setup
      console.error("[AuthProvider] Failed to set up auth listener:", err);
      setLoading(false);
      setError(err instanceof Error ? err.message : "Auth initialization failed");
    }

    // Safety timeout: if onAuthStateChanged never fires, stop loading after 5s
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("[AuthProvider] Auth loading timed out after 5s, forcing loading=false");
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      unsubscribe?.();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err instanceof Error ? err.message : "Sign-in failed");
    }
  };

  const signOutFn = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signOut: signOutFn, getIdToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
