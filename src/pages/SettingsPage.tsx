import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
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
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import {
  getBillingProfile,
  getClients,
  getSubscription,
  updateBillingProfile,
  updateClient,
} from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import { getPublicPlans } from "../services/publicService";
import type { BillingProfile, Client, Subscription } from "../types/admin";

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
  const [client, setClient] = useState<Client | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Array<{ code: string; name: string }>>([]);
  const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openPlanEdit, setOpenPlanEdit] = useState(false);
  const [openOrganizationEdit, setOpenOrganizationEdit] = useState(false);
  const [openBillingEdit, setOpenBillingEdit] = useState(false);
  const [planForm, setPlanForm] = useState({ plan: "" });
  const [organizationForm, setOrganizationForm] = useState({ name: "" });
  const [billingForm, setBillingForm] = useState<BillingProfile>({
    legal_name: "",
    billing_email: "",
    contact_name: "",
    vat_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country_code: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [clients, publicPlans, nextSubscription, nextBillingProfile] = await Promise.all([
          getClients().catch(() => []),
          getPublicPlans().catch(() => []),
          getSubscription(currentOrganizationId).catch(() => null),
        ]);
        const currentClient = clients.find((item) => item.id === currentOrganizationId) || null;
        setClient(currentClient);
        setSubscription(nextSubscription);
        const resolvedBillingProfile = await getBillingProfile(currentOrganizationId).catch(() => null);
        if (resolvedBillingProfile) {
          setBillingProfile(resolvedBillingProfile);
          setBillingForm({
            legal_name: resolvedBillingProfile.legal_name || "",
            billing_email: resolvedBillingProfile.billing_email || "",
            contact_name: resolvedBillingProfile.contact_name || "",
            vat_number: resolvedBillingProfile.vat_number || "",
            address_line1: resolvedBillingProfile.address_line1 || "",
            address_line2: resolvedBillingProfile.address_line2 || "",
            city: resolvedBillingProfile.city || "",
            postal_code: resolvedBillingProfile.postal_code || "",
            country_code: resolvedBillingProfile.country_code || "",
          });
        } else {
          setBillingProfile(null);
        }
        setPlans(publicPlans.map((plan) => ({ code: plan.code, name: plan.name })));
        setPlanForm({ plan: nextSubscription?.plan_code || currentClient?.plan || "" });
        setOrganizationForm({ name: currentClient?.name || "" });
      } catch (err) {
        setError(extractErrorMessage(err, t("settings.load_error")));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentOrganizationId, t]);

  const handlePlanSave = async () => {
    if (!currentOrganizationId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateClient(currentOrganizationId, { plan: planForm.plan });
      setClient(updated);
      setPlanForm({ plan: updated.plan });
      setSubscription((current) => (current ? { ...current, plan_code: updated.plan } : current));
      setSuccess(t("settings.save_success"));
      setOpenPlanEdit(false);
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
      const payload: BillingProfile = {
        legal_name: billingForm.legal_name,
        billing_email: billingForm.billing_email,
        contact_name: billingForm.contact_name || undefined,
        vat_number: billingForm.vat_number || undefined,
        address_line1: billingForm.address_line1 || undefined,
        address_line2: billingForm.address_line2 || undefined,
        city: billingForm.city || undefined,
        postal_code: billingForm.postal_code || undefined,
        country_code: billingForm.country_code || undefined,
      };
      const updated = await updateBillingProfile(currentOrganizationId, payload);
      setBillingProfile(updated);
      setBillingForm({
        legal_name: updated.legal_name || "",
        billing_email: updated.billing_email || "",
        contact_name: updated.contact_name || "",
        vat_number: updated.vat_number || "",
        address_line1: updated.address_line1 || "",
        address_line2: updated.address_line2 || "",
        city: updated.city || "",
        postal_code: updated.postal_code || "",
        country_code: updated.country_code || "",
      });
      setSuccess(t("settings.save_success"));
      setOpenBillingEdit(false);
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
      const updated = await updateClient(currentOrganizationId, { name: organizationForm.name });
      setClient(updated);
      setOrganizationForm({ name: updated.name });
      setSuccess(t("settings.save_success"));
      setOpenOrganizationEdit(false);
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
                  {subscription?.plan_code || client?.plan || t("settings.no_subscription")}
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

          <Card>
            <CardContent>
              <Typography variant="h6">{t("settings.organization")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("settings.organization_name")}: {client?.name || "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("settings.organization_id")}: {client?.id || "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("settings.created_at")}: {formatDate(locale, client?.created_at)}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" onClick={() => setOpenOrganizationEdit(true)}>{t("common.edit")}</Button>
            </CardActions>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>{t("settings.billing")}</Typography>
              {billingProfile ? (
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.legal_name")}: {billingProfile.legal_name || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.billing_email")}: {billingProfile.billing_email || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.contact_name")}: {billingProfile.contact_name || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.vat_number")}: {billingProfile.vat_number || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.address_line1")}: {billingProfile.address_line1 || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.address_line2")}: {billingProfile.address_line2 || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.city")}: {billingProfile.city || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.postal_code")}: {billingProfile.postal_code || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.country_code")}: {billingProfile.country_code || "-"}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("settings.billing_missing")}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="outlined" onClick={() => setOpenBillingEdit(true)}>{t("common.edit")}</Button>
            </CardActions>
          </Card>
        </Stack>
      )}

      <Dialog open={openPlanEdit} onClose={() => setOpenPlanEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("common.edit")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label={t("settings.plan_code")}
              value={planForm.plan}
              onChange={(event) => setPlanForm({ plan: event.target.value })}
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

      <Dialog open={openBillingEdit} onClose={() => setOpenBillingEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("common.edit")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("settings.legal_name")}
              value={billingForm.legal_name}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, legal_name: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.billing_email")}
              value={billingForm.billing_email}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, billing_email: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.contact_name")}
              value={billingForm.contact_name || ""}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, contact_name: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.vat_number")}
              value={billingForm.vat_number || ""}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, vat_number: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.address_line1")}
              value={billingForm.address_line1 || ""}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, address_line1: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.address_line2")}
              value={billingForm.address_line2 || ""}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, address_line2: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.city")}
              value={billingForm.city || ""}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, city: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.postal_code")}
              value={billingForm.postal_code || ""}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, postal_code: event.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t("settings.country_code")}
              value={billingForm.country_code || ""}
              onChange={(event) =>
                setBillingForm((current) => ({ ...current, country_code: event.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBillingEdit(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleBillingSave} variant="contained" disabled={saving}>
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOrganizationEdit} onClose={() => setOpenOrganizationEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("common.edit")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("settings.organization_name")}
              value={organizationForm.name}
              onChange={(event) => setOrganizationForm({ name: event.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrganizationEdit(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleOrganizationSave} variant="contained" disabled={saving}>{t("common.save")}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
