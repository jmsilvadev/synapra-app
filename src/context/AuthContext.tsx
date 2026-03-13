import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { auth } from "../service/firebase";
import axios from "axios";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  initializing: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setInitializing(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const firebaseIdToken = await result.user.getIdToken(true);

    // TEMPORÁRIO: Mock da resposta para testar UI
    console.log("Firebase login successful:", result.user.displayName);
    const mockResponse = {
      data: {
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "1",
          name: result.user.displayName || "Usuário",
          email: result.user.email || "",
          photoUrl: result.user.photoURL,
        },
      },
    };

    const { token, user: userData } = mockResponse.data;
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);

    // DESCOMENTE QUANDO A API ESTIVER RODANDO:
    // const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/google`, {
    //   id_token: firebaseIdToken,
    //   photo_url: result.user.photoURL,
    //   name: result.user.displayName,
    // });
    // const { token, user: userData } = res.data;
    // localStorage.setItem("authToken", token);
    // localStorage.setItem("user", JSON.stringify(userData));
    // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};