import React, { useEffect, useState } from "react";
import { Alert, Card, CardContent, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getBillingProfile, getInvoices, getOrganizationSettings, getSubscription } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { BillingProfile, InvoiceRecord, OrganizationSettings, Subscription } from "../types/admin";

const SettingsPage: React.FC = () => {
  const { currentClientId } = useAuth();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentClientId) {
        setLoading(false);
        return;
      }
      try {
        const [nextSettings, nextProfile, nextSubscription, nextInvoices] = await Promise.all([
          getOrganizationSettings(currentClientId).catch(() => null),
          getBillingProfile(currentClientId).catch(() => null),
          getSubscription(currentClientId).catch(() => null),
          getInvoices(currentClientId).catch(() => []),
        ]);
        setSettings(nextSettings);
        setProfile(nextProfile);
        setSubscription(nextSubscription);
        setInvoices(nextInvoices);
      } catch (err) {
        setError(extractErrorMessage(err, "Falha ao carregar configurações"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentClientId]);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>Configurações</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Stack spacing={2}>
          <Card><CardContent>
            <Typography variant="h6">Organização</Typography>
            <Typography variant="body2" color="text.secondary">
              Domínio permitido: {settings?.allowed_email_domain || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Workspace padrão: {settings?.default_project_id || "-"} / {settings?.default_namespace || "-"}
            </Typography>
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant="h6">Cobrança</Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.legal_name || "Perfil de billing não configurado"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.billing_email || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plano atual: {subscription?.plan_code || "-"} • {subscription?.status || "-"}
            </Typography>
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Faturas recentes</Typography>
            <Stack spacing={1}>
              {invoices.map((invoice) => (
                <Typography key={invoice.id} variant="body2" color="text.secondary">
                  {invoice.reference || invoice.external_id} • {invoice.status} • {(invoice.total_cents / 100).toFixed(2)} {invoice.currency_code}
                </Typography>
              ))}
              {invoices.length === 0 && (
                <Typography variant="body2" color="text.secondary">Nenhuma fatura encontrada.</Typography>
              )}
            </Stack>
          </CardContent></Card>
        </Stack>
      )}
    </Container>
  );
};

export default SettingsPage;
