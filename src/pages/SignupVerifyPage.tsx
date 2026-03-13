import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n";
import { completeRegistration, verifyRegistration } from "../services/publicService";
import { extractErrorMessage } from "../services/apiClient";

type CompletionState = {
  organizationName: string;
  email: string;
  planCode: string;
};

const SignupVerifyPage: React.FC = () => {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<CompletionState | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setError(t("signup_verify.missing_token"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const verified = await verifyRegistration(token);
        const completedResponse = await completeRegistration(token);
        setCompleted({
          organizationName: completedResponse.organization_name || verified.session.organization_name,
          email: verified.session.email,
          planCode: completedResponse.plan_code,
        });
      } catch (err) {
        setError(extractErrorMessage(err, t("signup_verify.error")));
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [t, token]);

  return (
    <Container maxWidth="sm" sx={{ py: 8, position: "relative" }}>
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <LanguageSwitcher compact />
      </Box>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {t("signup_verify.title")}
              </Typography>
              <Typography color="text.secondary">
                {t("signup_verify.subtitle")}
              </Typography>
            </div>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {completed && (
              <Alert severity="success">
                {t("signup_verify.success", {
                  organization: completed.organizationName,
                  plan: completed.planCode,
                  email: completed.email,
                })}
              </Alert>
            )}

            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/" variant="contained" disabled={loading}>
                {t("signup_verify.go_to_login")}
              </Button>
              {!loading && error && (
                <Button component={RouterLink} to="/signup" variant="outlined">
                  {t("signup_verify.back_to_signup")}
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SignupVerifyPage;
