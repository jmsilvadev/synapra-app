import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import { extractErrorMessage, setAdminToken } from "../services/apiClient";
import {
  getCurrentAdminSession,
  loginAdminWithFirebase,
  logoutAdmin,
} from "../services/adminService";
import type { AdminSession, Client } from "../types/admin";

type AuthUser = AdminSession["user"];

type AuthContextType = {
  user: AuthUser | null;
  session: AdminSession | null;
  currentClientId: string | null;
  initializing: boolean;
  loginError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setCurrentClientId: (clientId: string | null) => void;
  getClientMembership: (clientId: string) => AdminSession["memberships"][number] | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "adminAuthToken";
const SESSION_KEY = "adminSession";
const CLIENT_KEY = "adminCurrentClientId";

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
  localStorage.removeItem(CLIENT_KEY);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [currentClientId, setCurrentClientIdState] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const setCurrentClientId = useCallback((clientId: string | null) => {
    setCurrentClientIdState(clientId);
    if (clientId) {
      localStorage.setItem(CLIENT_KEY, clientId);
      return;
    }
    localStorage.removeItem(CLIENT_KEY);
  }, []);

  const applySession = useCallback(
    (nextSession: AdminSession | null) => {
      setSession(nextSession);
      if (!nextSession) {
        setAdminToken(null);
        clearStoredSession();
        setCurrentClientIdState(null);
        return;
      }

      if (nextSession.token) {
        setAdminToken(nextSession.token);
      }
      persistSession(nextSession);

      const storedClientId = localStorage.getItem(CLIENT_KEY);
      const firstMembership = nextSession.memberships.find((membership) => membership.active);
      const validStoredMembership = nextSession.memberships.find(
        (membership) => membership.organization_id === storedClientId && membership.active
      );
      const nextClientId = validStoredMembership?.organization_id || firstMembership?.organization_id || null;
      setCurrentClientIdState(nextClientId);
      if (nextClientId) {
        localStorage.setItem(CLIENT_KEY, nextClientId);
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

  const loginWithGoogle = useCallback(async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
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
      setLoginError(extractErrorMessage(error, "Falha ao autenticar com Google"));
      throw error;
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

  const getClientMembership = useCallback(
    (clientId: string) => session?.memberships.find((membership) => membership.organization_id === clientId),
    [session]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user || null,
      session,
      currentClientId,
      initializing,
      loginError,
      loginWithGoogle,
      logout,
      setCurrentClientId,
      getClientMembership,
    }),
    [
      currentClientId,
      getClientMembership,
      initializing,
      loginError,
      loginWithGoogle,
      logout,
      session,
      setCurrentClientId,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useCurrentClient() {
  const { currentClientId, setCurrentClientId } = useAuth();
  return { currentClientId, setCurrentClientId };
}

export function getClientLabel(client: Client) {
  return `${client.name} (${client.plan})`;
}
