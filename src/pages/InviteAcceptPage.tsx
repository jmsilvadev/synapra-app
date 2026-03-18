import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../services/apiClient";

const InviteAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { acceptInvitationWithGoogle } = useAuth();

  const token = useMemo(() => String(searchParams.get("token") || "").trim(), [searchParams]);
  const [processing, setProcessing] = useState(false);
  const [attemptedAutoStart, setAttemptedAutoStart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInviteFlow = useCallback(async () => {
    if (!token) {
      setError("Invitation token is missing in the link.");
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      await acceptInvitationWithGoogle(token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to accept invitation."));
    } finally {
      setProcessing(false);
    }
  }, [acceptInvitationWithGoogle, navigate, token]);

  useEffect(() => {
    if (attemptedAutoStart) {
      return;
    }
    setAttemptedAutoStart(true);
    void startInviteFlow();
  }, [attemptedAutoStart, startInviteFlow]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Stack spacing={2} alignItems="stretch">
            <Typography variant="h4" component="h1" sx={{ textAlign: "center" }}>
              Accept Invitation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              We will open Google OAuth to confirm your identity and activate your invite.
            </Typography>

            {processing && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {!processing && (
              <Button variant="contained" onClick={() => void startInviteFlow()}>
                Continue with Google
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default InviteAcceptPage;