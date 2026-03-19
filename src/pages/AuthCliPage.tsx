import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Alert, CircularProgress, Divider } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BrandLockup from "../components/BrandLockup";
import { auth } from "../service/firebase";
import { loginAdminWithFirebase } from "../services/adminService";
import { setAdminToken } from "../services/apiClient";

const AuthCliPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem("adminAuthToken"));
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get("session");
  const generateCalledRef = useRef(false);

  useEffect(() => {
    if (sessionToken && sessionId && !generateCalledRef.current) {
      generateCalledRef.current = true;
      void generateApiKey();
    }
  }, [sessionToken, sessionId]);

  const handleGoogleLogin = async () => {
    setLoggingIn(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      const result = await signInWithPopup(auth, provider);
      const firebaseIdToken = await result.user.getIdToken(true);
      
      const adminSession = await loginAdminWithFirebase({
        id_token: firebaseIdToken,
        email: result.user.email || undefined,
        name: result.user.displayName || undefined,
        picture_url: result.user.photoURL || undefined,
      });
      
      if (!adminSession.user.organization_id) {
        setError("No organization found. Please sign up first at the main console.");
        setLoggingIn(false);
        return;
      }
      
      if (adminSession.token) {
        localStorage.setItem("adminAuthToken", adminSession.token);
        setSessionToken(adminSession.token);
        setOrganizationId(adminSession.user.organization_id);
        setAdminToken(adminSession.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoggingIn(false);
    }
  };

  const generateApiKey = async () => {
    if (!sessionToken) return;
    
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";
      
      const response = await fetch(`${baseUrl}/v1/public/auth/cli/api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`,
          "X-Console-Token": sessionToken,
        },
        credentials: "include",
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = "Failed to generate API key";
        try {
          const data = JSON.parse(responseText);
          errorMessage = data.error || data.message || errorMessage;
        } catch {
          if (response.status === 401) {
            errorMessage = "Not authenticated. Please log in first.";
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please try again later.";
          }
        }
        throw new Error(errorMessage);
      }

      JSON.parse(responseText);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#071417",
        px: 2,
      }}
    >
      <Box
        sx={{
          p: 4,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <BrandLockup
            iconSize={58}
            titleVariant="h4"
            titleSize={{ xs: "2rem", sm: "2.15rem" }}
            subtitleSize={{ xs: "0.92rem", sm: "1rem" }}
            maxWidth={420}
          />
        </Box>

        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: "#E6F7F7" }}>
          CLI Authentication
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Authenticate to use Elastra with your AI agents
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
            {error}
          </Alert>
        )}

        {!sessionToken && !done && (
          <>
            <Button
              variant="contained"
              startIcon={loggingIn ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loggingIn}
              sx={{ py: 1.5, px: 4 }}
            >
              {loggingIn ? "Signing in..." : "Continue with Google"}
            </Button>

            <Divider sx={{ my: 3, borderColor: "rgba(0, 198, 184, 0.2)" }} />

            <Typography variant="caption" color="text.secondary">
              Don't have an account?{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => navigate("/signup")}
              >
                Sign up
              </Box>
            </Typography>
          </>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {done && !loading && (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              Authentication successful! Your API key is ready. You can close this window.
            </Alert>

            {sessionId && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                Your CLI will automatically detect this API key.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AuthCliPage;
