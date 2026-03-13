import React, { useEffect, useState } from "react";
import { Alert, Card, CardContent, Chip, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getBillingProfile, getInvoices, getOrganizationSettings, getSubscription } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { BillingProfile, InvoiceRecord, OrganizationSettings, Subscription } from "../types/admin";

function formatDate(locale: string, value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const SettingsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t, locale } = useI18n();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [nextSettings, nextProfile, nextSubscription, nextInvoices] = await Promise.all([
          getOrganizationSettings(currentOrganizationId).catch(() => null),
          getBillingProfile(currentOrganizationId).catch(() => null),
          getSubscription(currentOrganizationId).catch(() => null),
          getInvoices(currentOrganizationId).catch(() => []),
        ]);
        setSettings(nextSettings);
        setProfile(nextProfile);
        setSubscription(nextSubscription);
        setInvoices(nextInvoices);
      } catch (err) {
        setError(extractErrorMessage(err, t("settings.load_error")));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentOrganizationId]);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>{t("settings.title")}</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>{t("settings.my_plan")}</Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  {subscription?.plan_code || t("settings.no_subscription")}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={subscription?.status || t("settings.undefined_status")}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  {subscription?.provider && (
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.provider")}: {subscription.provider}
                    </Typography>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.cycle_start")}: {formatDate(locale, subscription?.current_period_start)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.cycle_end")}: {formatDate(locale, subscription?.current_period_end)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("settings.cancel_at_period_end")}: {subscription?.cancel_at_period_end ? t("common.yes") : t("common.no")}
                </Typography>
                {subscription?.trial_ends_at && (
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.trial_until")}: {formatDate(locale, subscription.trial_ends_at)}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
          <Card><CardContent>
            <Typography variant="h6">{t("settings.organization")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.allowed_domain")}: {settings?.allowed_email_domain || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.default_workspace")}: {settings?.default_project_id || "-"} / {settings?.default_namespace || "-"}
            </Typography>
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant="h6">{t("settings.billing")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.legal_name || t("settings.billing_missing")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.billing_email || "-"}
            </Typography>
          </CardContent></Card>
          <Card><CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>{t("settings.recent_invoices")}</Typography>
            <Stack spacing={1}>
              {invoices.map((invoice) => (
                <Typography key={invoice.id} variant="body2" color="text.secondary">
                  {invoice.reference || invoice.external_id} • {invoice.status} • {(invoice.total_cents / 100).toFixed(2)} {invoice.currency_code}
                </Typography>
              ))}
              {invoices.length === 0 && (
                <Typography variant="body2" color="text.secondary">{t("settings.no_invoices")}</Typography>
              )}
            </Stack>
          </CardContent></Card>
        </Stack>
      )}
    </Container>
  );
};

export default SettingsPage;
