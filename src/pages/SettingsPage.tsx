import React, { useEffect, useState } from "react";
import { Alert, Button, Card, CardActions, CardContent, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getBillingProfile, getClients, getInvoices, getOrganizationSettings, getSubscription, updateBillingProfile, updateClient, updateOrganizationSettings } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import { getPublicPlans } from "../services/publicService";
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
  const [organizationName, setOrganizationName] = useState("");
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [plans, setPlans] = useState<Array<{ code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openPlanEdit, setOpenPlanEdit] = useState(false);
  const [openOrganizationEdit, setOpenOrganizationEdit] = useState(false);
  const [openBillingEdit, setOpenBillingEdit] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", plan: "" });
  const [settingsForm, setSettingsForm] = useState<OrganizationSettings>({ organization_id: "" });
  const [billingForm, setBillingForm] = useState<BillingProfile>({ legal_name: "", billing_email: "" });

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [clients, publicPlans, nextSettings, nextProfile, nextSubscription, nextInvoices] = await Promise.all([
          getClients().catch(() => []),
          getPublicPlans().catch(() => []),
          getOrganizationSettings(currentOrganizationId).catch(() => null),
          getBillingProfile(currentOrganizationId).catch(() => null),
          getSubscription(currentOrganizationId).catch(() => null),
          getInvoices(currentOrganizationId).catch(() => []),
        ]);
        const currentClient = clients.find((client) => client.id === currentOrganizationId);
        setOrganizationName(currentClient?.name || "");
        setPlanForm({
          name: currentClient?.name || "",
          plan: nextSubscription?.plan_code || currentClient?.plan || "",
        });
        setPlans(publicPlans.map((plan) => ({ code: plan.code, name: plan.name })));
        setSettings(nextSettings);
        setSettingsForm(nextSettings || { organization_id: currentOrganizationId });
        setProfile(nextProfile);
        setBillingForm(nextProfile || { legal_name: "", billing_email: "" });
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

  const handlePlanSave = async () => {
    if (!currentOrganizationId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateClient(currentOrganizationId, {
        name: planForm.name,
        plan: planForm.plan,
      });
      setOrganizationName(updated.name);
      setPlanForm({ name: updated.name, plan: updated.plan });
      setSubscription((current) => current ? { ...current, plan_code: updated.plan } : current);
      setSuccess(t("settings.save_success"));
      setOpenPlanEdit(false);
    } catch (err) {
      setError(extractErrorMessage(err, t("settings.load_error")));
    } finally {
      setSaving(false);
    }
  };

  const handleOrganizationSave = async () => {
    if (!currentOrganizationId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateOrganizationSettings(currentOrganizationId, settingsForm);
      setSettings(updated);
      setSettingsForm(updated);
      setSuccess(t("settings.save_success"));
      setOpenOrganizationEdit(false);
    } catch (err) {
      setError(extractErrorMessage(err, t("settings.load_error")));
    } finally {
      setSaving(false);
    }
  };

  const handleBillingSave = async () => {
    if (!currentOrganizationId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateBillingProfile(currentOrganizationId, billingForm);
      setProfile(updated);
      setBillingForm(updated);
      setSuccess(t("settings.save_success"));
      setOpenBillingEdit(false);
    } catch (err) {
      setError(extractErrorMessage(err, t("settings.load_error")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>{t("settings.title")}</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}
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
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" onClick={() => setOpenPlanEdit(true)}>{t("common.edit")}</Button>
            </CardActions>
          </Card>
          <Card><CardContent>
            <Typography variant="h6">{t("settings.organization")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.allowed_domain")}: {settings?.allowed_email_domain || "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("settings.default_workspace")}: {settings?.default_project_id || "-"} / {settings?.default_namespace || "-"}
            </Typography>
          </CardContent><CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="outlined" onClick={() => setOpenOrganizationEdit(true)}>{t("common.edit")}</Button>
          </CardActions></Card>
          <Card><CardContent>
            <Typography variant="h6">{t("settings.billing")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.legal_name || t("settings.billing_missing")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.billing_email || "-"}
            </Typography>
          </CardContent><CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="outlined" onClick={() => setOpenBillingEdit(true)}>{t("common.edit")}</Button>
          </CardActions></Card>
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

      <Dialog open={openPlanEdit} onClose={() => setOpenPlanEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("common.edit")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("settings.plan_name")}
              value={planForm.name}
              onChange={(event) => setPlanForm((current) => ({ ...current, name: event.target.value }))}
            />
            <TextField
              select
              fullWidth
              label={t("settings.plan_code")}
              value={planForm.plan}
              onChange={(event) => setPlanForm((current) => ({ ...current, plan: event.target.value }))}
            >
              {plans.map((plan) => (
                <MenuItem key={plan.code} value={plan.code}>{plan.name}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPlanEdit(false)}>{t("common.cancel")}</Button>
          <Button onClick={handlePlanSave} variant="contained" disabled={saving}>{t("common.save")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOrganizationEdit} onClose={() => setOpenOrganizationEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("common.edit")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("settings.domain")}
              value={settingsForm.allowed_email_domain || ""}
              onChange={(event) => setSettingsForm((current) => ({ ...current, allowed_email_domain: event.target.value }))}
            />
            <TextField
              fullWidth
              label={t("settings.workspace_id")}
              value={settingsForm.default_project_id || ""}
              onChange={(event) => setSettingsForm((current) => ({ ...current, default_project_id: event.target.value }))}
            />
            <TextField
              fullWidth
              label={t("settings.workspace_scope")}
              value={settingsForm.default_namespace || ""}
              onChange={(event) => setSettingsForm((current) => ({ ...current, default_namespace: event.target.value }))}
            />
            <TextField
              fullWidth
              label={t("settings.website_url")}
              value={settingsForm.website_url || ""}
              onChange={(event) => setSettingsForm((current) => ({ ...current, website_url: event.target.value }))}
            />
            <TextField
              fullWidth
              label={t("settings.support_email")}
              value={settingsForm.support_email || ""}
              onChange={(event) => setSettingsForm((current) => ({ ...current, support_email: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrganizationEdit(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleOrganizationSave} variant="contained" disabled={saving}>{t("common.save")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openBillingEdit} onClose={() => setOpenBillingEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("common.edit")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label={t("settings.legal_name")} value={billingForm.legal_name || ""} onChange={(event) => setBillingForm((current) => ({ ...current, legal_name: event.target.value }))} />
            <TextField fullWidth label={t("settings.billing_email")} value={billingForm.billing_email || ""} onChange={(event) => setBillingForm((current) => ({ ...current, billing_email: event.target.value }))} />
            <TextField fullWidth label={t("settings.contact_name")} value={billingForm.contact_name || ""} onChange={(event) => setBillingForm((current) => ({ ...current, contact_name: event.target.value }))} />
            <TextField fullWidth label={t("settings.vat_number")} value={billingForm.vat_number || ""} onChange={(event) => setBillingForm((current) => ({ ...current, vat_number: event.target.value }))} />
            <TextField fullWidth label={t("settings.address_line1")} value={billingForm.address_line1 || ""} onChange={(event) => setBillingForm((current) => ({ ...current, address_line1: event.target.value }))} />
            <TextField fullWidth label={t("settings.address_line2")} value={billingForm.address_line2 || ""} onChange={(event) => setBillingForm((current) => ({ ...current, address_line2: event.target.value }))} />
            <TextField fullWidth label={t("settings.city")} value={billingForm.city || ""} onChange={(event) => setBillingForm((current) => ({ ...current, city: event.target.value }))} />
            <TextField fullWidth label={t("settings.postal_code")} value={billingForm.postal_code || ""} onChange={(event) => setBillingForm((current) => ({ ...current, postal_code: event.target.value }))} />
            <TextField fullWidth label={t("settings.country_code")} value={billingForm.country_code || ""} onChange={(event) => setBillingForm((current) => ({ ...current, country_code: event.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBillingEdit(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleBillingSave} variant="contained" disabled={saving}>{t("common.save")}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
