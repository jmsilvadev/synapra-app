import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import { extractErrorMessage, setAdminToken } from "../services/apiClient";
import {
  getClients,
  getCurrentAdminSession,
  loginAdminWithFirebase,
  logoutAdmin,
} from "../services/adminService";
import type { AdminSession, Client } from "../types/admin";

type AuthUser = AdminSession["user"];

type AuthContextType = {
  user: AuthUser | null;
  session: AdminSession | null;
  currentOrganizationId: string | null;
  initializing: boolean;
  loginError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setCurrentOrganizationId: (organizationId: string | null) => void;
  getOrganizationMembership: (organizationId: string) => AdminSession["memberships"][number] | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "adminAuthToken";
const SESSION_KEY = "adminSession";
const ORGANIZATION_KEY = "adminCurrentOrganizationId";
const SIGNUP_CONTEXT_KEY = "pendingSignupContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

function persistSession(session: AdminSession) {
  if (session.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadStoredSession() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const rawSession = localStorage.getItem(SESSION_KEY);
  if (!token || !rawSession) {
    return null;
  }
  try {
    const session = JSON.parse(rawSession) as AdminSession;
    session.token = token;
    return session;
  } catch {
    return null;
  }
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ORGANIZATION_KEY);
}

function persistSignupContext(payload: { email?: string | null; name?: string | null }) {
  sessionStorage.setItem(SIGNUP_CONTEXT_KEY, JSON.stringify(payload));
}

export function loadPendingSignupContext(): { email?: string; name?: string } | null {
  const raw = sessionStorage.getItem(SIGNUP_CONTEXT_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as { email?: string; name?: string };
  } catch {
    return null;
  }
}

export function clearPendingSignupContext() {
  sessionStorage.removeItem(SIGNUP_CONTEXT_KEY);
}

function normalizeSession(session: AdminSession): AdminSession {
  return {
    ...session,
    memberships: Array.isArray(session.memberships) ? session.memberships : [],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [currentOrganizationId, setCurrentOrganizationIdState] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const setCurrentOrganizationId = useCallback((organizationId: string | null) => {
    setCurrentOrganizationIdState(organizationId);
    if (organizationId) {
      localStorage.setItem(ORGANIZATION_KEY, organizationId);
      return;
    }
    localStorage.removeItem(ORGANIZATION_KEY);
  }, []);

  const applySession = useCallback(
    (nextSession: AdminSession | null) => {
      if (!nextSession) {
        setSession(null);
        setAdminToken(null);
        clearStoredSession();
        setCurrentOrganizationIdState(null);
        return;
      }

      const normalizedSession = normalizeSession(nextSession);
      setSession(normalizedSession);

      if (normalizedSession.token) {
        setAdminToken(normalizedSession.token);
      }
      persistSession(normalizedSession);

      const storedOrganizationId = localStorage.getItem(ORGANIZATION_KEY);
      const firstMembership = normalizedSession.memberships.find((membership) => membership.active);
      const validStoredMembership = normalizedSession.memberships.find(
        (membership) => membership.organization_id === storedOrganizationId && membership.active
      );
      const nextOrganizationId =
        validStoredMembership?.organization_id || firstMembership?.organization_id || null;
      setCurrentOrganizationIdState(nextOrganizationId);
      if (nextOrganizationId) {
        localStorage.setItem(ORGANIZATION_KEY, nextOrganizationId);
      }
    },
    []
  );

  useEffect(() => {
    const bootstrap = async () => {
      const storedSession = loadStoredSession();
      if (!storedSession?.token) {
        setInitializing(false);
        return;
      }

      setAdminToken(storedSession.token);
      try {
        const freshSession = await getCurrentAdminSession();
        freshSession.token = storedSession.token;
        applySession(freshSession);
      } catch {
        applySession(null);
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [applySession]);

  useEffect(() => {
    if (!session || currentOrganizationId) {
      return;
    }

    let cancelled = false;

    const ensureOrganizationContext = async () => {
      try {
        const organizations = await getClients();
        if (cancelled || !organizations[0]) {
          return;
        }
        setCurrentOrganizationId(organizations[0].id);
      } catch {
        // Some pages can still render without a selected organization; this fallback is best-effort.
      }
    };

    void ensureOrganizationContext();

    return () => {
      cancelled = true;
    };
  }, [currentOrganizationId, session, setCurrentOrganizationId]);

  const loginWithGoogle = useCallback(async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    let authResult:
      | {
          user: {
            email: string | null;
            displayName: string | null;
          };
        }
      | undefined;

    try {
      const result = await signInWithPopup(auth, provider);
      authResult = result;
      const firebaseIdToken = await result.user.getIdToken(true);
      const adminSession = await loginAdminWithFirebase({
        provider: "firebase",
        id_token: firebaseIdToken,
        email: result.user.email,
        name: result.user.displayName,
        picture_url: result.user.photoURL,
      });
      applySession(adminSession);
    } catch (error) {
      await signOut(auth).catch(() => undefined);
      applySession(null);
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 403 &&
        String((error.response?.data as { error?: string } | undefined)?.error || "").includes("organization membership")
      ) {
        persistSignupContext({
          email: authResult?.user?.email,
          name: authResult?.user?.displayName,
        });
        window.location.assign("/signup");
        return;
      }
      setLoginError(extractErrorMessage(error, "Falha ao autenticar com Google"));
    }
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // Backend session cleanup is best-effort from the client perspective.
    }
    await signOut(auth).catch(() => undefined);
    applySession(null);
  }, [applySession]);

  const getOrganizationMembership = useCallback(
    (organizationId: string) =>
      (session?.memberships ?? []).find((membership) => membership.organization_id === organizationId),
    [session]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user || null,
      session,
      currentOrganizationId,
      initializing,
      loginError,
      loginWithGoogle,
      logout,
      setCurrentOrganizationId,
      getOrganizationMembership,
    }),
    [
      currentOrganizationId,
      getOrganizationMembership,
      initializing,
      loginError,
      loginWithGoogle,
      logout,
      session,
      setCurrentOrganizationId,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useCurrentOrganization() {
  const { currentOrganizationId, setCurrentOrganizationId } = useAuth();
  return { currentOrganizationId, setCurrentOrganizationId };
}

export function getClientLabel(client: Client) {
  return `${client.name} (${client.plan})`;
}
