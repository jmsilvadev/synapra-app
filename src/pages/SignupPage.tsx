import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { clearPendingSignupContext, loadPendingSignupContext } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import { getPublicPlans, startRegistration } from "../services/publicService";
import type { Plan } from "../types/admin";

const SignupPage: React.FC = () => {
  const { t, locale } = useI18n();
  const pendingSignup = loadPendingSignupContext();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState(pendingSignup?.email || "");
  const [contactName, setContactName] = useState(pendingSignup?.name || "");
  const [planCode, setPlanCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicPlans()
      .then((items) => {
        setPlans(items);
        if (items[0]) {
          setPlanCode(items[0].code);
        }
      })
      .catch((err) => setError(extractErrorMessage(err, t("signup.load_error"))))
      .finally(() => setLoading(false));
  }, [t]);

  const handleSubmit = async () => {
    if (!organizationName.trim() || !email.trim() || !planCode.trim()) {
      setError(t("signup.validation.required"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await startRegistration({
        organization_name: organizationName.trim(),
        email: email.trim(),
        plan_code: planCode,
        billing_profile: {
          legal_name: organizationName.trim(),
          billing_email: email.trim(),
          contact_name: contactName.trim(),
        },
      });
      if (!response.email_sent) {
        setError(t("signup.backend_email_missing"));
        return;
      }
      clearPendingSignupContext();
      setConfirmedEmail(response.email);
      setEmailDialogOpen(true);
    } catch (err) {
      setError(extractErrorMessage(err, t("signup.submit_error")));
    } finally {
      setSubmitting(false);
    }
  };

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
                {t("signup.title")}
              </Typography>
              <Typography color="text.secondary">
                {t("signup.subtitle")}
              </Typography>
            </div>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2}>
                <TextField
                  label={t("signup.organization_name")}
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  fullWidth
                />
                <TextField
                  label={t("signup.email")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                />
                <TextField
                  label={t("signup.contact_name")}
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  fullWidth
                />
                <TextField
                  select
                  label={t("signup.plan")}
                  value={planCode}
                  onChange={(event) => setPlanCode(event.target.value)}
                  fullWidth
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.code} value={plan.code}>
                      {plan.name} • {new Intl.NumberFormat(locale, { style: "currency", currency: plan.currency_code }).format(plan.price_cents / 100)}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? t("signup.submitting") : t("signup.submit")}
                </Button>
                <Button component={RouterLink} to="/" variant="text">
                  {t("signup.back_to_login")}
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={emailDialogOpen} fullWidth maxWidth="sm">
        <DialogTitle>{t("signup.dialog_title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography>
              {t("signup.dialog_intro", { email: confirmedEmail })}
            </Typography>
            <Typography color="text.secondary">
              {t("signup.dialog_desc")}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button component={RouterLink} to="/" variant="contained" onClick={() => setEmailDialogOpen(false)}>
            {t("signup.back_to_login")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SignupPage;
