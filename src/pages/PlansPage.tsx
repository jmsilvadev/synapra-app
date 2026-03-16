import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Container, Grid, Stack, Typography, Alert, Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getPublicPlans } from "../services/publicService";
import { getSubscription } from "../services/adminService";
import { createSubscriptionCheckout } from "../services/billingService";
import type { Plan } from "../services/publicService";

const PlansPage: React.FC = () => {
  const { currentOrganizationId, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansData, subscriptionData] = await Promise.all([
          getPublicPlans(),
          currentOrganizationId ? getSubscription(currentOrganizationId).catch(() => null) : Promise.resolve(null),
        ]);
        setPlans(plansData);
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

  const handleSubscribe = async (plan: Plan) => {
    if (!currentOrganizationId) {
      loginWithGoogle();
      return;
    }

    if (plan.price === 0) {
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
      const session = await createSubscriptionCheckout();
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      setError(t("plans.checkout_error", { defaultValue: "Failed to start checkout. Please try again." }));
      setCheckingOut(null);
    }
  };

  const handleLogin = () => {
    loginWithGoogle();
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>

      <Stack spacing={4} alignItems="center">
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h3" gutterBottom>
            {t("plans.title", { defaultValue: "Simple, Transparent Pricing" })}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t("plans.subtitle", { defaultValue: "Choose the plan that fits your needs" })}
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ maxWidth: 1000, width: "100%" }}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.code}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: "100%", 
                  display: "flex", 
                  flexDirection: "column",
                  borderColor: plan.featured ? "primary.main" : undefined,
                  borderWidth: plan.featured ? 2 : 1,
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
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </Typography>
                    {plan.price > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        /{plan.interval}
                      </Typography>
                    )}
                  </Box>
                  <Stack spacing={1.5} sx={{ mb: 3, flexGrow: 1 }}>
                    {plan.features?.map((feature, idx) => (
                      <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleIcon color="primary" fontSize="small" />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  {currentOrganizationId ? (
                    <Button 
                      variant={plan.featured ? "contained" : "outlined"} 
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
                      variant={plan.featured ? "contained" : "outlined"} 
                      fullWidth 
                      size="large"
                      onClick={handleLogin}
                    >
                      {t("plans.get_started", { defaultValue: "Get Started" })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
};

export default PlansPage;