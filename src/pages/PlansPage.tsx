import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Container, Stack, Typography, Alert, Snackbar, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n";
import { usePageSeo } from "../hooks/usePageSeo";
import { getPublicPlans, getStripePrices, startRegistration } from "../services/publicService";
import { getSubscription } from "../services/adminService";
import { createSubscriptionCheckout } from "../services/billingService";
import type { Plan } from "../services/publicService";

type OnboardingForm = {
  organizationName: string;
  billingEmail: string;
  contactName: string;
};

const fallbackCosts = {
  search: 10,
  memoryWrite: 5,
  documents: 25,
  embeddings: 2,
  graphOps: 5,
  syncPerFile: 50,
};

type SCUCostModel = {
  search: number;
  memoryWrite: number;
  documents: number;
  embeddings: number;
  graphOps: number;
  syncPerFile: number;
};

function parseIntMeta(meta: Record<string, string>, keys: string[], fallback: number): number {
  for (const key of keys) {
    const raw = (meta[key] || "").trim();
    if (!raw) {
      continue;
    }
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return fallback;
}

function buildSCUCostModelFromStripePrices(prices: any[]): SCUCostModel {
  const base = prices.find((p) => p?.Product?.Metadata?.app === "synapra") || prices[0];
  const meta = (base?.Product?.Metadata || {}) as Record<string, string>;
  return {
    search: parseIntMeta(meta, ["scu_cost_search", "search_scu_cost"], fallbackCosts.search),
    memoryWrite: parseIntMeta(meta, ["scu_cost_memory_write", "memory_write_scu_cost"], fallbackCosts.memoryWrite),
    documents: parseIntMeta(meta, ["scu_cost_documents", "documents_scu_cost"], fallbackCosts.documents),
    embeddings: parseIntMeta(meta, ["scu_cost_embeddings", "embeddings_scu_cost"], fallbackCosts.embeddings),
    graphOps: parseIntMeta(meta, ["scu_cost_graph_ops", "graph_ops_scu_cost", "graph_scu_cost"], fallbackCosts.graphOps),
    syncPerFile: parseIntMeta(meta, ["scu_cost_sync_per_file", "sync_per_file_scu_cost"], fallbackCosts.syncPerFile),
  };
}

function ensureFreemiumPlan(plans: Plan[]): Plan[] {
  const list = Array.isArray(plans) ? [...plans] : [];
  const hasFreemium = list.some((plan) => plan.code === "freemium");
  if (hasFreemium) {
    return list;
  }

  const starter = list.find((plan) => plan.code === "starter");

  return [
    {
      ...(starter || {}),
      code: "freemium",
      name: "Freemium",
      description: starter?.description || "Local free plan for onboarding and evaluation.",
      billing_cycle: starter?.billing_cycle || "monthly",
      price_cents: 0,
      currency_code: starter?.currency_code || "EUR",
      trial_days: 0,
      invoice_provider: "internal",
      scu_monthly_allowance: 10000,
      active: true,
    },
    ...list,
  ];
}

const PlansPage: React.FC = () => {
  const { currentOrganizationId, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingSuccessOpen, setOnboardingSuccessOpen] = useState(false);
  const [onboardingSuccessEmail, setOnboardingSuccessEmail] = useState("");
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [costModel, setCostModel] = useState<SCUCostModel>(fallbackCosts);
  const [onboardingForm, setOnboardingForm] = useState<OnboardingForm>({
    organizationName: "",
    billingEmail: "",
    contactName: "",
  });

  usePageSeo({
    title: "Synapra Plans | Enterprise AI Pricing for Developers and Teams",
    description:
      "Conheca os planos do Synapra para empresas e times de desenvolvimento com IA: precificacao transparente, capacidade SCU e escala de agentes de IA.",
    keywords:
      "preco IA para empresas, planos AI agents, enterprise AI pricing, custo agentes de IA, developer AI platform pricing, SCU pricing",
    path: "/plans",
    imagePath: "/synapra_final_logo.svg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Synapra Plans",
      description: "Pagina de planos e precificacao para uso de Synapra em times de desenvolvimento com IA.",
      url: `${window.location.origin}/plans`,
      isPartOf: {
        "@type": "WebSite",
        name: "Synapra",
        url: window.location.origin,
      },
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [plansData, stripePrices, subscriptionData] = await Promise.all([
          getPublicPlans(),
          getStripePrices().catch(() => []),
          currentOrganizationId ? getSubscription(currentOrganizationId).catch(() => null) : Promise.resolve(null),
        ]);
        setPlans(ensureFreemiumPlan(plansData));
        if (stripePrices.length > 0) {
          setCostModel(buildSCUCostModelFromStripePrices(stripePrices));
        }
        if (subscriptionData) {
          setCurrentPlan(subscriptionData.plan_code);
        }
      } catch (err) {
        console.error("Failed to load plans:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentOrganizationId]);

  const formatMoney = (plan: Plan) => {
    if (plan.price_cents <= 0) {
      return "0€";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: plan.currency_code || "EUR",
      maximumFractionDigits: 0,
    }).format(plan.price_cents / 100);
  };

  const planEntitlements = useMemo(() => {
    return plans.map((plan) => {
      const scu = plan.code === "freemium" ? 10000 : (plan.scu_monthly_allowance || 0);
      return {
        ...plan,
        description: plan.code === "freemium"
          ? t("plans.freemium_desc", { defaultValue: "Free plan for onboarding and evaluation." })
          : plan.description,
        scu,
        estimations: {
          searches: Math.floor(scu / costModel.search),
          memories: Math.floor(scu / costModel.memoryWrite),
          documentUnits: Math.floor(scu / costModel.documents),
          embeddingUnits: Math.floor(scu / costModel.embeddings),
          graphOps: Math.floor(scu / costModel.graphOps),
          syncFiles: Math.floor(scu / costModel.syncPerFile),
        },
      };
    });
  }, [plans, costModel, t]);

  const handleSubscribe = async (plan: Plan) => {
    if (!currentOrganizationId) {
      setSelectedPlan(plan);
      setOnboardingOpen(true);
      return;
    }

    if (plan.price_cents === 0) {
      navigate("/settings");
      return;
    }

    if (currentPlan === plan.code) {
      navigate("/settings");
      return;
    }

    setCheckingOut(plan.code);
    setError(null);

    try {
      const session = await createSubscriptionCheckout(currentOrganizationId);
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      setError(t("plans.checkout_error", { defaultValue: "Failed to start checkout. Please try again." }));
      setCheckingOut(null);
    }
  };

  const handleStartOnboarding = async () => {
    if (!selectedPlan) {
      return;
    }
    if (!onboardingForm.organizationName.trim() || !onboardingForm.billingEmail.trim()) {
      setError(t("plans.onboarding_required", { defaultValue: "Organization name and billing email are required." }));
      return;
    }

    setOnboardingSubmitting(true);
    setError(null);

    try {
      const response = await startRegistration({
        organization_name: onboardingForm.organizationName.trim(),
        email: onboardingForm.billingEmail.trim(),
        plan_code: selectedPlan.code,
        billing_profile: {
          legal_name: onboardingForm.organizationName.trim(),
          billing_email: onboardingForm.billingEmail.trim(),
          contact_name: onboardingForm.contactName.trim(),
        },
      });

      if (!response.email_sent) {
        setError(t("plans.onboarding_email_missing", { defaultValue: "Onboarding email was not sent by backend." }));
        return;
      }

      setOnboardingOpen(false);
      setOnboardingSuccessEmail(onboardingForm.billingEmail.trim());
      setOnboardingSuccessOpen(true);
      setOnboardingForm({ organizationName: "", billingEmail: "", contactName: "" });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(t("plans.onboarding_email_exists", { defaultValue: "Este email ja existe no nosso cadastro." }));
        return;
      }
      setError(t("plans.onboarding_error", { defaultValue: "Could not start onboarding. Please try again." }));
    } finally {
      setOnboardingSubmitting(false);
    }
  };

  const handleLogin = () => {
    void loginWithGoogle();
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(0, 224, 255, 0.14), transparent 28%), #071417",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(0, 224, 255, 0.14), transparent 28%), #071417",
        px: 2,
        py: 4,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 20, right: 20, zIndex: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          aria-label={t("plans.go_home", { defaultValue: "Go to home" })}
          onClick={() => navigate("/")}
          sx={{
            color: "common.white",
            border: "1px solid rgba(255,255,255,0.2)",
            bgcolor: "rgba(7,20,23,0.5)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          <HomeIcon fontSize="small" />
        </IconButton>
        <LanguageSwitcher compact />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>

        <Stack spacing={4} alignItems="center">
          <Box
            component="img"
            src={`${process.env.PUBLIC_URL || ""}/synapra_final_logo.svg`}
            alt="Synapra"
            sx={{
              display: "block",
              width: "100%",
              maxWidth: 420,
              mx: "auto",
              borderRadius: 3,
            }}
          />

          <Box sx={{ textAlign: "center", color: "common.white" }}>
            <Typography variant="h3" gutterBottom>
              {t("plans.title", { defaultValue: "Simple, Transparent Pricing" })}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.72)" }}>
              {t("plans.subtitle", { defaultValue: "Choose the plan that fits your needs" })}
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ width: "100%", maxWidth: 1200, p: 2 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h5">
                {t("plans.scu_title", { defaultValue: "How SCU Is Calculated" })}
              </Typography>
              <Typography color="text.secondary">
                {t("plans.scu_desc", { defaultValue: "SCU (Software Capacity Units) is your monthly usage budget. Every operation consumes a fixed amount of SCU." })}
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <Chip label={`Search = ${costModel.search} SCU`} />
                <Chip label={`Memory write = ${costModel.memoryWrite} SCU`} />
                <Chip label={`Documents unit = ${costModel.documents} SCU`} />
                <Chip label={`Embeddings unit = ${costModel.embeddings} SCU`} />
                <Chip label={`Graph ops unit = ${costModel.graphOps} SCU`} />
                <Chip label={`Sync (per file) = ${costModel.syncPerFile} SCU`} />
              </Stack>
            </Stack>
          </CardContent>
          </Card>

          <Box
            sx={{
              maxWidth: 1200,
              width: "100%",
              display: "grid",
              gap: 4,
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
              alignItems: "stretch",
            }}
          >
            {planEntitlements.map((plan) => (
              <Box key={plan.code}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    borderColor: plan.code === "pro" ? "primary.main" : undefined,
                    borderWidth: plan.code === "pro" ? 2 : 1,
                  }}
                >
                  <CardHeader
                    title={plan.name}
                    subheader={plan.description}
                    titleTypographyProps={{ variant: "h5", align: "center" }}
                    subheaderTypographyProps={{ align: "center" }}
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h3" component="span">
                        {formatMoney(plan)}
                      </Typography>
                      {plan.price_cents > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          /{plan.billing_cycle}
                        </Typography>
                      )}
                    </Box>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {t("plans.scu_allowance", { defaultValue: "Monthly SCU allowance" })}: {plan.scu.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("plans.scu_examples", { defaultValue: "Estimated monthly capacity if you spent all SCU in one operation type:" })}
                      </Typography>
                      <Typography variant="caption">{plan.estimations.searches.toLocaleString()} {t("plans.metric_searches", { defaultValue: "searches" })}</Typography>
                      <Typography variant="caption">{plan.estimations.memories.toLocaleString()} {t("plans.metric_memory_writes", { defaultValue: "memory writes" })}</Typography>
                      <Typography variant="caption">{plan.estimations.documentUnits.toLocaleString()} document units</Typography>
                      <Typography variant="caption">{plan.estimations.embeddingUnits.toLocaleString()} embedding units</Typography>
                      <Typography variant="caption">{plan.estimations.graphOps.toLocaleString()} graph operation units</Typography>
                      <Typography variant="caption">{plan.estimations.syncFiles.toLocaleString()} {t("plans.metric_synced_files", { defaultValue: "synced files" })}</Typography>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleIcon color="primary" fontSize="small" />
                        <Typography variant="body2">{t("plans.right_1", { defaultValue: "Knowledge search and contextual retrieval" })}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleIcon color="primary" fontSize="small" />
                        <Typography variant="body2">{t("plans.right_2", { defaultValue: "Memory writes and organization knowledge sync" })}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleIcon color="primary" fontSize="small" />
                        <Typography variant="body2">{t("plans.right_3", { defaultValue: "Billing and usage visibility in dashboard" })}</Typography>
                      </Stack>
                    </Stack>
                    {currentOrganizationId ? (
                      <Button 
                        variant={plan.code === "pro" ? "contained" : "outlined"} 
                        fullWidth 
                        size="large"
                        disabled={checkingOut !== null}
                        onClick={() => handleSubscribe(plan)}
                      >
                        {checkingOut === plan.code 
                          ? t("plans.redirecting", { defaultValue: "Redirecting..." })
                          : currentPlan === plan.code 
                            ? t("plans.current", { defaultValue: "Current Plan" })
                            : t("plans.subscribe", { defaultValue: "Subscribe" })}
                      </Button>
                    ) : (
                      <Button 
                        variant={plan.code === "pro" ? "contained" : "outlined"} 
                        fullWidth 
                        size="large"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setOnboardingOpen(true);
                        }}
                      >
                        {t("plans.get_started", { defaultValue: "Start Onboarding" })}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {!currentOrganizationId && (
            <Button variant="text" onClick={handleLogin} sx={{ color: "common.white" }}>
              {t("plans.have_account", { defaultValue: "Already have an account? Sign in with Google" })}
            </Button>
          )}
        </Stack>

        <Dialog open={onboardingOpen} onClose={() => setOnboardingOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            {t("plans.onboarding_title", { defaultValue: "Start your onboarding" })}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography color="text.secondary">
                {t("plans.onboarding_plan", { defaultValue: "Selected plan" })}: {selectedPlan?.name || "-"}
              </Typography>
              <TextField
                label={t("plans.org_name", { defaultValue: "Organization name" })}
                value={onboardingForm.organizationName}
                onChange={(event) => setOnboardingForm((prev) => ({ ...prev, organizationName: event.target.value }))}
                fullWidth
              />
              <TextField
                label={t("plans.billing_email", { defaultValue: "Billing email" })}
                type="email"
                value={onboardingForm.billingEmail}
                onChange={(event) => setOnboardingForm((prev) => ({ ...prev, billingEmail: event.target.value }))}
                fullWidth
              />
              <TextField
                label={t("plans.contact_name", { defaultValue: "Contact name (optional)" })}
                value={onboardingForm.contactName}
                onChange={(event) => setOnboardingForm((prev) => ({ ...prev, contactName: event.target.value }))}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOnboardingOpen(false)}>
              {t("plans.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button onClick={handleStartOnboarding} variant="contained" disabled={onboardingSubmitting}>
              {onboardingSubmitting
                ? t("plans.onboarding_starting", { defaultValue: "Starting..." })
                : t("plans.onboarding_cta", { defaultValue: "Start onboarding" })}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={onboardingSuccessOpen} onClose={() => setOnboardingSuccessOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            {t("plans.onboarding_success_title", { defaultValue: "Confirm your email" })}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="success">
                {t("plans.onboarding_success", { defaultValue: "Onboarding started. Check your email to continue." })}
              </Alert>
              <Typography>
                {t("plans.onboarding_success_body", {
                  defaultValue: "We sent a confirmation email to {{email}}. Open your inbox and confirm the email before continuing.",
                  email: onboardingSuccessEmail,
                })}
              </Typography>
              <Typography color="text.secondary">
                {t("plans.onboarding_success_hint", {
                  defaultValue: "If you do not see the message, check your spam folder and search for Synapra in your mailbox.",
                })}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOnboardingSuccessOpen(false)}>
              {t("plans.close_notice", { defaultValue: "Close" })}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setOnboardingSuccessOpen(false);
                navigate("/login");
              }}
            >
              {t("plans.go_to_login", { defaultValue: "Go to login" })}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default PlansPage;
