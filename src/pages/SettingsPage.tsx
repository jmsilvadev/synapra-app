import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
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
  Grid,
  Divider,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  RadioGroup,
  Radio,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import {
  Business as BusinessIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  OpenInNew as OpenInNewIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  ReceiptLong as ReceiptLongIcon,
  ShoppingCart as ShoppingCartIcon,
  QueryStats as QueryStatsIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import {
  getBillingProfile,
  getClients,
  getSubscription,
  getUsage,
  updateBillingProfile,
  updateClient,
} from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import { getPublicPlans } from "../services/publicService";
import { getStripePrices } from "../services/publicService";
import { getBillingPortal, createSubscriptionCheckout } from "../services/billingService";
import type { BillingProfile, Client, Subscription, Usage } from "../types/admin";
import type { StripePrice } from "../services/publicService";

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

function getStatusColor(status: string): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "active":
      return "success";
    case "trialing":
      return "warning";
    case "past_due":
    case "unpaid":
    case "canceled":
      return "error";
    default:
      return "default";
  }
}

function getStatusIcon(status: string): React.ReactNode {
  switch (status) {
    case "active":
      return <CheckCircleIcon fontSize="small" />;
    case "trialing":
      return <HourglassEmptyIcon fontSize="small" />;
    case "past_due":
    case "unpaid":
    case "canceled":
      return <ErrorIcon fontSize="small" />;
    default:
      return null;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "trialing":
      return "Trialing";
    case "past_due":
      return "Past Due";
    case "unpaid":
      return "Unpaid";
    case "canceled":
      return "Canceled";
    case "incomplete":
      return "Incomplete";
    case "checkout_completed":
      return "Processing";
    default:
      return status;
  }
}

function formatUsageNumber(value?: number) {
  if (value === undefined || value === null) return "-";
  return value.toLocaleString();
}

function toPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function operationLabel(operation: string) {
  switch (operation) {
    case "search_retrieval":
      return "Search";
    case "embedding_generation":
      return "Embeddings";
    case "chunking":
      return "Chunking";
    case "indexing":
      return "Indexing";
    case "graph_update":
      return "Graph Update";
    case "sync_orchestration":
      return "Sync Orchestration";
    default:
      return operation;
  }
}

const SettingsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t, locale } = useI18n();
  const [client, setClient] = useState<Client | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
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
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
  const [openPlanSelect, setOpenPlanSelect] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loadingPrices, setLoadingPrices] = useState(false);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [clients, publicPlans, nextSubscription, usageData] = await Promise.all([
          getClients().catch(() => []),
          getPublicPlans().catch(() => []),
          getSubscription(currentOrganizationId).catch(() => null),
          getUsage(currentOrganizationId).catch(() => null),
        ]);
        const currentClient = clients.find((item) => item.id === currentOrganizationId) || null;
        setClient(currentClient);
        setSubscription(nextSubscription);
        setUsage(usageData);
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
        setPlans(publicPlans.map((plan) => ({ code: plan.code, name: plan.name, price_cents: plan.price_cents })));
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

  const handleBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const portal = await getBillingPortal();
      if (portal.url) {
        window.open(portal.url, "_blank");
      }
    } catch (err) {
      setError(extractErrorMessage(err, t("settings.portal_error")));
    } finally {
      setPortalLoading(false);
    }
  };

  const pollSubscription = async (): Promise<boolean> => {
    if (!currentOrganizationId) return false;
    try {
      const sub = await getSubscription(currentOrganizationId);
      if (sub && (sub.status === "active" || sub.status === "trialing")) {
        setSubscription(sub);
        setSuccess(t("settings.subscription_activated", { defaultValue: "Subscription activated successfully!" }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const startPolling = () => {
    setPolling(true);
    let attempts = 0;
    const maxAttempts = 60;
    const poll = async () => {
      attempts++;
      const activated = await pollSubscription();
      if (activated || attempts >= maxAttempts) {
        setPolling(false);
        if (pollingRef.current) {
          clearTimeout(pollingRef.current);
          pollingRef.current = null;
        }
        if (!activated && attempts >= maxAttempts) {
          setError(t("settings.polling_timeout", { defaultValue: "Subscription verification timed out. Please refresh the page." }));
        }
        return;
      }
      pollingRef.current = setTimeout(poll, 3000);
    };
    poll();
  };

  const stopPolling = () => {
    setPolling(false);
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  const loadStripePrices = async () => {
    setLoadingPrices(true);
    try {
      const prices = await getStripePrices();
      setStripePrices(prices);
      return prices;
    } catch (err) {
      setError(extractErrorMessage(err, t("settings.prices_error", { defaultValue: "Failed to load plans" })));
      return [];
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleSubscribe = async () => {
    if (!currentOrganizationId) return;
    if (subscription?.plan_code && hasStripeSubscription) {
      await proceedToCheckout(subscription.plan_code);
    } else {
      const prices = await loadStripePrices();
      if (prices.length === 0) {
        setError(t("settings.no_plans", { defaultValue: "No plans available. Please contact support." }));
        return;
      }
      const uniquePlans = prices.filter((price) => price.Product).reduce((acc: StripePrice[], price: StripePrice) => {
        if (!acc.find(p => p.Product?.ID === price.Product?.ID)) {
          acc.push(price);
        }
        return acc;
      }, []);
      if (uniquePlans.length === 1) {
        await proceedToCheckout(uniquePlans[0].ID);
      } else {
        setOpenPlanSelect(true);
      }
    }
  };

  const proceedToCheckout = async (planCode: string) => {
    if (!currentOrganizationId) return;
    setCheckoutLoading(true);
    setError(null);
    setOpenPlanSelect(false);
    try {
      const checkout = await createSubscriptionCheckout(currentOrganizationId, planCode);
      if (checkout.url) {
        const width = 600;
        const height = 800;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        const checkoutWindow = window.open(
          checkout.url,
          "StripeCheckout",
          `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes`
        );
        setCheckoutLoading(false);
        startPolling();
        const checkClosed = setInterval(() => {
          if (checkoutWindow?.closed) {
            clearInterval(checkClosed);
            if (polling) {
              pollSubscription();
            }
          }
        }, 1000);
      }
    } catch (err) {
      setError(extractErrorMessage(err, t("settings.checkout_error")));
      setCheckoutLoading(false);
    }
  };

  const handleBillingPortalWithPolling = async () => {
    await handleBillingPortal();
    setTimeout(() => {
      startPolling();
    }, 2000);
  };

  const hasStripeSubscription = subscription?.provider === "stripe" && (subscription?.status === "active" || subscription?.status === "trialing" || subscription?.status === "past_due");
  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const isCanceled = subscription?.cancel_at_period_end || subscription?.status === "canceled";

  const scuChartData = (usage?.scu?.by_operation || []).map((entry) => ({
    operation: operationLabel(entry.operation_type),
    scu: entry.scu_consumed,
    operations: entry.operations,
  }));
  const totalSCUByAction = scuChartData.reduce((sum, entry) => sum + Math.max(entry.scu, 0), 0);
  const scuLegendPayload = scuChartData.map((entry) => {
    const percent = totalSCUByAction > 0 ? (Math.max(entry.scu, 0) / totalSCUByAction) * 100 : 0;
    return {
      id: entry.operation,
      type: "square" as const,
      value: `${entry.operation} (${percent.toFixed(1)}%)`,
      color: "#0288d1",
    };
  });
  const hasPositiveSCUValues = scuChartData.some((entry) => entry.scu > 0);
  const hasSCUData = Boolean(usage?.scu && usage.scu.monthly_allowance !== undefined);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>{t("settings.title")}</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {loading ? <CircularProgress /> : (
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <BusinessIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">{t("settings.organization")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {client?.name || "-"}
                  </Typography>
                </Box>
                <Chip 
                  label={client?.id?.slice(0, 8) || "-"} 
                  size="small" 
                  variant="outlined" 
                />
                <Box sx={{ ml: "auto" }}>
                  <Tooltip title={t("common.edit")}>
                    <IconButton color="primary" onClick={() => setOpenOrganizationEdit(true)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BadgeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.organization_id")}: {client?.id || "-"}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.created_at")}: {formatDate(locale, client?.created_at)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <QueryStatsIcon color="primary" fontSize="large" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{t("settings.usage_title", { defaultValue: "Usage & Quotas" })}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.usage_subtitle", { defaultValue: "Track total SCU spent, available SCU, and SCU consumption by action." })}
                  </Typography>
                </Box>
                <Chip
                  label={hasSCUData
                    ? `${formatUsageNumber(usage?.scu?.remaining)} SCU ${t("settings.remaining", { defaultValue: "remaining" })}`
                    : t("settings.scu_unavailable", { defaultValue: "SCU data unavailable" })}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </Stack>

              <Stack spacing={2}>
                <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t("settings.scu_budget", { defaultValue: "SCU Monthly Budget" })}
                  </Typography>
                  <Typography variant="h4">
                    {hasSCUData
                      ? `${formatUsageNumber(usage?.scu?.consumed)} / ${formatUsageNumber(usage?.scu?.monthly_allowance)}`
                      : "-"}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={hasSCUData ? toPercent(usage?.scu?.percent_consumed) : 0}
                    sx={{ mt: 1.5, height: 10, borderRadius: 999 }}
                  />
                  {hasSCUData ? (
                    <>
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("settings.consumed", { defaultValue: "Consumed" })}: {toPercent(usage?.scu?.percent_consumed).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("settings.remaining", { defaultValue: "Remaining" })}: {formatUsageNumber(usage?.scu?.remaining)} SCU
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                        {t("settings.billing_period", { defaultValue: "Billing period" })}: {formatDate(locale, usage?.scu?.billing_period_start)} - {formatDate(locale, usage?.scu?.billing_period_end)}
                      </Typography>
                    </>
                  ) : (
                    <Alert severity="info" sx={{ mt: 1.5 }}>
                      {t("settings.scu_unavailable_desc", { defaultValue: "SCU data is not available yet for this organization." })}
                    </Alert>
                  )}
                </Box>

                <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2, width: "100%", minWidth: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t("settings.scu_by_action", { defaultValue: "SCU Spent by Action" })}
                  </Typography>
                  {scuChartData.length > 0 ? (
                    <Box sx={{ height: 320, width: "100%", minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <BarChart data={scuChartData} margin={{ top: 28, right: 16, left: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="operation" interval={0} minTickGap={24} />
                          <YAxis
                            scale={hasPositiveSCUValues ? "log" : "auto"}
                            domain={hasPositiveSCUValues ? [1, "auto"] : [0, "auto"]}
                            allowDataOverflow
                            width={64}
                            tickFormatter={(value: number) => formatUsageNumber(Math.round(value))}
                          />
                          <RechartsTooltip
                            formatter={(value: number) => [
                              `${formatUsageNumber(Math.round(value))} SCU`,
                              t("settings.scu", { defaultValue: "SCU" }),
                            ]}
                          />
                          <Legend verticalAlign="top" align="center" payload={scuLegendPayload} />
                          <Bar dataKey="scu" fill="#0288d1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {t("settings.no_scu_consumption", { defaultValue: "No SCU consumption recorded for this billing period yet." })}
                    </Alert>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <CreditCardIcon color="primary" fontSize="large" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{t("settings.my_plan")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subscription?.plan_code || client?.plan || t("settings.no_subscription")}
                  </Typography>
                </Box>
                <Chip
                  label={subscription ? getStatusLabel(subscription.status) : t("settings.undefined_status")}
                  color={subscription ? getStatusColor(subscription.status) : "default"}
                  variant="outlined"
                  size="small"
                />
                <Box>
                  <Tooltip title={t("common.edit")}>
                    <IconButton color="primary" onClick={() => setOpenPlanEdit(true)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.cycle_start")}: {formatDate(locale, subscription?.current_period_start)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {t("settings.cycle_end")}: {formatDate(locale, subscription?.current_period_end)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {t("settings.provider")}: Stripe
                    </Typography>
                    {isCanceled && (
                      <Alert severity="warning" icon={<WarningIcon fontSize="small" />} sx={{ py: 0 }}>
                        {subscription?.cancel_at_period_end 
                          ? t("settings.canceling_at_period_end", { defaultValue: "Subscription will cancel at period end" })
                          : t("settings.subscription_canceled", { defaultValue: "Subscription canceled" })
                        }
                      </Alert>
                    )}
                    {!isCanceled && subscription?.trial_ends_at && (
                      <Typography variant="body2" color="warning.main">
                        {t("settings.trial_until")}: {formatDate(locale, subscription.trial_ends_at)}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
{hasStripeSubscription ? (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={polling ? <CircularProgress size={16} color="inherit" /> : <OpenInNewIcon />}
                      onClick={handleBillingPortalWithPolling}
                      disabled={portalLoading || polling}
                    >
                      {polling ? t("settings.verifying", { defaultValue: "Verifying..." }) : portalLoading ? t("settings.loading") : t("settings.manage_billing", { defaultValue: "Manage Subscription" })}
                    </Button>
                    {!isCanceled && isActive && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={handleBillingPortalWithPolling}
                        disabled={portalLoading || polling}
                      >
                        {t("settings.cancel_subscription", { defaultValue: "Cancel Subscription" })}
                      </Button>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {t("settings.stripe_portal_hint", { defaultValue: "Manage payment methods, view invoices, upgrade/downgrade plan or cancel subscription via Stripe" })}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {polling ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CircularProgress size={20} />
                        <Typography>{t("settings.waiting_payment", { defaultValue: "Waiting for payment confirmation..." })}</Typography>
                        <Button size="small" onClick={stopPolling}>
                          {t("common.cancel")}
                        </Button>
                      </Stack>
                    </Alert>
                  ) : null}
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={checkoutLoading ? <CircularProgress size={16} color="inherit" /> : <ShoppingCartIcon />}
                    onClick={handleSubscribe}
                    disabled={checkoutLoading || polling}
                  >
                    {checkoutLoading ? t("settings.loading") : t("settings.subscribe_stripe", { defaultValue: "Subscribe with Stripe" })}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {t("settings.subscribe_hint", { defaultValue: "Click to start your subscription via Stripe. You will be redirected to complete payment." })}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <SettingsIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">{t("settings.billing")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {billingProfile?.legal_name || t("settings.billing_missing")}
                  </Typography>
                </Box>
                <Box sx={{ ml: "auto" }}>
                  <Tooltip title={billingProfile ? t("common.edit") : t("settings.add_billing")}>
                    <IconButton color="primary" onClick={() => setOpenBillingEdit(true)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              {billingProfile ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography variant="body2">{billingProfile.legal_name || "-"}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{billingProfile.billing_email || "-"}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">{billingProfile.contact_name || "-"}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <BadgeIcon fontSize="small" color="action" />
                          <Typography variant="body2">{billingProfile.vat_number || "-"}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">{billingProfile.address_line1 || "-"}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {billingProfile.address_line2 || "-"}
                        </Typography>
                        <Typography variant="body2">
                          {billingProfile.postal_code} {billingProfile.city}
                        </Typography>
                        <Typography variant="body2">
                          {billingProfile.country_code || "-"}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {t("settings.billing_missing")}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      <Dialog open={openPlanEdit} onClose={() => setOpenPlanEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CreditCardIcon color="primary" />
            {t("settings.my_plan")}
          </Stack>
        </DialogTitle>
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
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SettingsIcon color="primary" />
            {t("settings.billing")}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("settings.legal_name")}
                value={billingForm.legal_name}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, legal_name: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("settings.billing_email")}
                value={billingForm.billing_email}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, billing_email: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("settings.contact_name")}
                value={billingForm.contact_name || ""}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, contact_name: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("settings.vat_number")}
                value={billingForm.vat_number || ""}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, vat_number: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("settings.address_line1")}
                value={billingForm.address_line1 || ""}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, address_line1: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("settings.address_line2")}
                value={billingForm.address_line2 || ""}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, address_line2: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t("settings.city")}
                value={billingForm.city || ""}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, city: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t("settings.postal_code")}
                value={billingForm.postal_code || ""}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, postal_code: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t("settings.country_code")}
                value={billingForm.country_code || ""}
                onChange={(event) =>
                  setBillingForm((current) => ({ ...current, country_code: event.target.value }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBillingEdit(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleBillingSave} variant="contained" disabled={saving}>
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOrganizationEdit} onClose={() => setOpenOrganizationEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BusinessIcon color="primary" />
            {t("settings.organization")}
          </Stack>
        </DialogTitle>
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

      <Dialog open={openPlanSelect} onClose={() => setOpenPlanSelect(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CreditCardIcon color="primary" />
            {t("settings.select_plan", { defaultValue: "Choose Your Plan" })}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("settings.select_plan_desc", { defaultValue: "Select a plan to continue with your subscription." })}
          </Typography>
          {loadingPrices ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <RadioGroup
              value={selectedPlan}
              onChange={(_, value) => setSelectedPlan(value)}
            >
              {stripePrices
                .filter((price) => price.Product)
                .filter((price, index, self) =>
                  self.findIndex(p => p.Product?.ID === price.Product?.ID) === index
                )
                .map((price) => {
                  const planName = price.Product?.Name || `Plan ${price.ID.slice(-6)}`;
                  return (
                    <FormControlLabel
                      key={price.ID}
                      value={price.ID}
                      control={<Radio />}
                      label={
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box>
                            <Typography variant="subtitle1">{planName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(price.UnitAmount / 100).toFixed(2)} {price.Currency.toUpperCase()} / {price.Interval}
                            </Typography>
                          </Box>
                        </Stack>
                      }
                      sx={{
                        border: selectedPlan === price.ID ? "1px solid" : "1px solid transparent",
                        borderColor: "primary.main",
                        borderRadius: 1,
                        mb: 1,
                        p: 1,
                      }}
                    />
                  );
                })}
            </RadioGroup>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPlanSelect(false)}>{t("common.cancel")}</Button>
          <Button
            onClick={() => proceedToCheckout(selectedPlan)}
            variant="contained"
            disabled={!selectedPlan || checkoutLoading}
          >
            {checkoutLoading ? <CircularProgress size={20} /> : t("settings.continue_checkout", { defaultValue: "Continue to Checkout" })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;