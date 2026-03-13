import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { clearPendingSignupContext, loadPendingSignupContext } from "../context/AuthContext";
import { extractErrorMessage } from "../services/apiClient";
import { getPublicPlans, startRegistration } from "../services/publicService";
import type { Plan } from "../types/admin";

const SignupPage: React.FC = () => {
  const pendingSignup = loadPendingSignupContext();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState(pendingSignup?.email || "");
  const [contactName, setContactName] = useState(pendingSignup?.name || "");
  const [planCode, setPlanCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicPlans()
      .then((items) => {
        setPlans(items);
        if (items[0]) {
          setPlanCode(items[0].code);
        }
      })
      .catch((err) => setError(extractErrorMessage(err, "Falha ao carregar planos")))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!organizationName.trim() || !email.trim() || !planCode.trim()) {
      setError("Preencha organização, email e plano.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
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
      clearPendingSignupContext();
      setSuccess(`Enviámos um email para ${response.email}. Abra esse link para concluir a criação da organização e da subscrição.`);
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao iniciar o registo"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Criar organização
              </Typography>
              <Typography color="text.secondary">
                O seu utilizador ainda não pertence a nenhuma organização. Complete o registo e enviaremos um email de verificação para continuar o onboarding.
              </Typography>
            </div>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2}>
                <TextField
                  label="Nome da organização"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Nome do contacto"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  fullWidth
                />
                <TextField
                  select
                  label="Plano"
                  value={planCode}
                  onChange={(event) => setPlanCode(event.target.value)}
                  fullWidth
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.code} value={plan.code}>
                      {plan.name} • {(plan.price_cents / 100).toFixed(2)} {plan.currency_code}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "A enviar..." : "Enviar email de onboarding"}
                </Button>
                <Button component={RouterLink} to="/" variant="text">
                  Voltar ao login
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SignupPage;
