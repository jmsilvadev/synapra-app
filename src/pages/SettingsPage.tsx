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
import { getClients, getSubscription, updateClient } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import { getPublicPlans } from "../services/publicService";
import type { Client, Subscription } from "../types/admin";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openPlanEdit, setOpenPlanEdit] = useState(false);
  const [openOrganizationEdit, setOpenOrganizationEdit] = useState(false);
  const [planForm, setPlanForm] = useState({ plan: "" });
  const [organizationForm, setOrganizationForm] = useState({ name: "" });

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [clients, publicPlans, nextSubscription] = await Promise.all([
          getClients().catch(() => []),
          getPublicPlans().catch(() => []),
          getSubscription(currentOrganizationId).catch(() => null),
        ]);
        const currentClient = clients.find((item) => item.id === currentOrganizationId) || null;
        setClient(currentClient);
        setSubscription(nextSubscription);
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
